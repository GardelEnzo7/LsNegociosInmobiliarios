"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { PROPERTY_IMAGES_BUCKET } from "@/lib/admin/property-images";

/** Never delete an object younger than this — an admin might still be
 * mid-edit (uploaded a photo, hasn't hit save yet), or a slower concurrent
 * save might still reference it by the time this runs. Preferred 7-day
 * window per the maintenance design (24h is the stated minimum). */
const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
const LIST_LIMIT = 1000;

export type OrphanCleanupResult = {
  /** Total objects found in the bucket, across every folder. */
  scanned: number;
  /** How many distinct Storage paths are referenced by property_images. */
  referenced: number;
  /** Unreferenced objects found, before applying the grace period. */
  orphanCandidates: number;
  /** Actually removed this run (unreferenced, past the grace period, and
   * re-confirmed unreferenced immediately before deletion). */
  deleted: string[];
  /** Unreferenced but not old enough yet — left alone, will be picked up
   * by a future run. */
  pendingGracePeriod: string[];
  /** Unreferenced, but Storage didn't return a usable `created_at` for
   * them — never auto-deleted; surfaced here for manual review only. */
  undated: string[];
  error?: string;
};

type StorageEntry = { path: string; createdAt: string | null };

function extractReferencedPaths(rows: { url: string }[]): Set<string> {
  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  return new Set(
    rows
      .map((r) => r.url)
      .filter((url) => url.includes(marker))
      .map((url) => url.slice(url.indexOf(marker) + marker.length)),
  );
}

/**
 * Manual, admin-only Storage maintenance — deliberately NOT run
 * automatically as part of saving/editing/deleting a property (see
 * syncPropertyImages/deleteProperty in properties.ts for why: Postgres and
 * Supabase Storage are two different systems, and no synchronous
 * "delete right after sync" step can be made truly atomic with a DB write).
 *
 * `property_images` is the source of truth for what's live. This function
 * only ever removes a Storage object once it satisfies ALL of:
 *   1. It exists in the `property-images` bucket (any folder — including
 *      folders left behind by a since-deleted property).
 *   2. It is NOT referenced by any current `property_images.url`.
 *   3. It is older than the grace period (skips anything younger).
 *   4. It is re-confirmed unreferenced immediately before the delete call
 *      (closes the gap between the initial scan and the actual removal —
 *      a scan across every property can take a while).
 *
 * Not wired to any schedule, cron, or admin UI in this change — it exists
 * as a safe function ready to be invoked (manually, or from a future
 * scheduled/UI trigger) without expanding scope here.
 */
export async function cleanupOrphanPropertyImages(): Promise<OrphanCleanupResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: topLevel, error: listError } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .list("", { limit: LIST_LIMIT });
  if (listError) {
    return {
      scanned: 0,
      referenced: 0,
      orphanCandidates: 0,
      deleted: [],
      pendingGracePeriod: [],
      undated: [],
      error: "No se pudo listar el bucket de imágenes.",
    };
  }

  // This bucket only ever has one level of nesting (`${propertyId}/${file}`,
  // written by uploadPropertyImage) — one level of recursion is enough.
  // `id === null` marks a folder pseudo-entry (folders aren't real objects
  // in Storage; anything with a real `id` at the root would be an unusual
  // stray file, kept as a top-level candidate rather than ignored).
  const allObjects: StorageEntry[] = [];
  for (const entry of topLevel ?? []) {
    if (entry.id !== null) {
      allObjects.push({ path: entry.name, createdAt: entry.created_at });
      continue;
    }
    const { data: files } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .list(entry.name, { limit: LIST_LIMIT });
    for (const file of files ?? []) {
      if (file.id === null) continue; // unexpected nested folder — skip, don't recurse further
      allObjects.push({ path: `${entry.name}/${file.name}`, createdAt: file.created_at });
    }
  }

  const { data: rows, error: rowsError } = await supabase.from("property_images").select("url");
  if (rowsError) {
    return {
      scanned: allObjects.length,
      referenced: 0,
      orphanCandidates: 0,
      deleted: [],
      pendingGracePeriod: [],
      undated: [],
      error: "No se pudo leer property_images.",
    };
  }
  const referencedPaths = extractReferencedPaths(rows ?? []);

  const candidates = allObjects.filter((o) => !referencedPaths.has(o.path));

  const now = Date.now();
  const pastGracePeriod: StorageEntry[] = [];
  const pendingGracePeriod: string[] = [];
  const undated: string[] = [];

  for (const candidate of candidates) {
    const createdMs = candidate.createdAt ? new Date(candidate.createdAt).getTime() : NaN;
    if (!Number.isFinite(createdMs)) {
      // Can't reliably establish age — never auto-delete, just report it.
      undated.push(candidate.path);
    } else if (now - createdMs >= GRACE_PERIOD_MS) {
      pastGracePeriod.push(candidate);
    } else {
      pendingGracePeriod.push(candidate.path);
    }
  }

  if (pastGracePeriod.length === 0) {
    return {
      scanned: allObjects.length,
      referenced: referencedPaths.size,
      orphanCandidates: candidates.length,
      deleted: [],
      pendingGracePeriod,
      undated,
    };
  }

  // Final re-check right before the physical delete: a scan across every
  // property can take a while, and this re-reads property_images fresh so
  // nothing referenced *by now* — even if it wasn't when the scan above
  // started — gets removed.
  const { data: freshRows } = await supabase.from("property_images").select("url");
  const freshReferenced = extractReferencedPaths(freshRows ?? []);
  const safeToDelete = pastGracePeriod.filter((o) => !freshReferenced.has(o.path));

  if (safeToDelete.length === 0) {
    return {
      scanned: allObjects.length,
      referenced: referencedPaths.size,
      orphanCandidates: candidates.length,
      deleted: [],
      pendingGracePeriod,
      undated,
    };
  }

  const { error: removeError } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove(safeToDelete.map((o) => o.path));

  if (removeError) {
    return {
      scanned: allObjects.length,
      referenced: referencedPaths.size,
      orphanCandidates: candidates.length,
      deleted: [],
      pendingGracePeriod,
      undated,
      error: "No se pudieron borrar algunos objetos huérfanos.",
    };
  }

  return {
    scanned: allObjects.length,
    referenced: referencedPaths.size,
    orphanCandidates: candidates.length,
    deleted: safeToDelete.map((o) => o.path),
    pendingGracePeriod,
    undated,
  };
}
