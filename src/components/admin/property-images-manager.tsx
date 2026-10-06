"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ImageUploadError, MAX_IMAGE_BYTES, uploadPropertyImage } from "@/lib/admin/property-images";
import { ImageOptimizeError, optimizeImageFile } from "@/lib/admin/image-optimize";
import { createClient } from "@/lib/supabase/client";
import { mapWithConcurrency } from "@/lib/admin/upload-queue";
import { PropertyPhotoCard, PropertyPhotoDragPreview } from "@/components/admin/property-photo-card";
import { buttonClass } from "@/components/admin/ui/button";
import { IconImagePlus } from "@/components/admin/ui/icons";
import { cn } from "@/lib/utils";

// Hint for the OS file picker only — actual validation happens by trying to
// decode the file (see optimizeImageFile), which is what lets HEIC/HEIF
// through opportunistically on browsers that can open it.
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

// Cap on simultaneous browser→Supabase Storage uploads. Keeps a 10-15 photo
// batch from opening that many parallel connections at once while still
// uploading well ahead of one-at-a-time.
const UPLOAD_CONCURRENCY = 3;

const DROP_ANIMATION = { ...defaultDropAnimation, duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };

const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "Para mover la foto con el teclado, presioná Espacio o Enter para levantarla, usá las flechas para elegir la nueva posición y presioná Espacio o Enter para soltarla. Escape cancela. La primera foto es la portada.",
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Card reflow transitions are plain CSS and already neutralized by the
 * global reduced-motion rule in globals.css — the drop animation runs on
 * the Web Animations API instead, which that rule can't reach. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export type ImageItem = {
  key: string;
  url: string;
  /** Not editable in the UI anymore, but still carried through `commit` so
   * saving never blanks an ALT a photo already has in property_images. */
  alt: string;
  file?: File;
  previewUrl: string;
  status: "idle" | "uploading" | "error" | "done";
  error?: string;
};

export type PropertyImagesManagerHandle = {
  /**
   * Uploads every not-yet-uploaded file directly to Supabase Storage (max
   * `UPLOAD_CONCURRENCY` at a time) and resolves with the final ordered
   * `{ url, alt }` list once nothing is left pending or failed. If any
   * upload fails, the promise stays pending — the user resolves it by
   * clicking "Reintentar" (which re-runs this same step) or "Continuar sin
   * estas fotos" (which drops the failed items and resolves immediately)
   * inside this component.
   */
  commit(propertyId: string): Promise<{ url: string; alt: string }[]>;
};

export const PropertyImagesManager = forwardRef<
  PropertyImagesManagerHandle,
  { initialImages: { id: string; url: string; alt: string }[]; disabled?: boolean }
>(function PropertyImagesManager({ initialImages, disabled = false }, ref) {
  const [items, setItems] = useState<ImageItem[]>(
    initialImages.map((img) => ({
      key: img.id,
      url: img.url,
      alt: img.alt,
      previewUrl: img.url,
      status: "done",
    })),
  );
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState<{ done: number; total: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  // Drag-session UI only (which photo the overlay shows) — never the order.
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = usePrefersReducedMotion();
  // dnd-kit's own id counter differs between SSR and the client, which
  // breaks hydration of the aria-describedby it puts on every handle.
  const dndId = useId();

  const gridRef = useRef<HTMLUListElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef<{ key: string } | "add" | null>(null);
  const itemsRef = useRef(items);
  const commitRef = useRef<{ propertyId: string; resolve: (v: { url: string; alt: string }[]) => void } | null>(null);

  const isBusy = disabled || processing !== null || uploadProgress !== null;
  const hasFailedUploads = items.some((item) => item.status === "error");

  /** Every mutation goes through this so `itemsRef` is always in sync with
   * the latest state at the point control returns to `commit`/`runCommitStep` —
   * those run inside promise chains where a plain `useEffect` sync would lag
   * a tick behind. */
  const updateItems = useCallback((updater: (current: ImageItem[]) => ImageItem[]) => {
    setItems((current) => {
      const next = updater(current);
      itemsRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.file) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  async function handlePick(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    const errors: string[] = [];
    const next: ImageItem[] = [];

    setFileErrors([]);
    setProcessing({ done: 0, total: picked.length });

    for (let index = 0; index < picked.length; index++) {
      const file = picked[index];

      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
        errors.push(`"${file.name}": no parece ser una imagen.`);
        setProcessing({ done: index + 1, total: picked.length });
        continue;
      }

      try {
        const optimized = await optimizeImageFile(file);
        if (optimized.size > MAX_IMAGE_BYTES) {
          errors.push(`"${file.name}": sigue pesando demasiado incluso optimizada (máx. 8MB).`);
        } else {
          next.push({
            key: `new-${crypto.randomUUID()}`,
            url: "",
            alt: "",
            file: optimized,
            previewUrl: URL.createObjectURL(optimized),
            status: "idle",
          });
        }
      } catch (error) {
        errors.push(error instanceof ImageOptimizeError ? error.message : `"${file.name}": no se pudo procesar.`);
      }

      setProcessing({ done: index + 1, total: picked.length });
    }

    setFileErrors(errors);
    updateItems((current) => [...current, ...next]);
    setProcessing(null);
  }

  // "Hacer portada" disappears from the photo it was pressed on, and
  // "Quitar" removes its whole card — focus is re-placed on a photo handle
  // (or the add button) once React has committed the change.
  useEffect(() => {
    const request = pendingFocusRef.current;
    if (!request) return;
    pendingFocusRef.current = null;
    if (request === "add") {
      pickerRef.current?.focus();
      return;
    }
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-photo-key="${CSS.escape(request.key)}"] [data-focus="handle"]`)
      ?.focus();
  }, [items]);

  /** The only way the order changes — "Hacer portada" and drag & drop
   * (mouse, touch and keyboard) both end here, so `items` stays the single client-side source of
   * the order that `commit` sends to syncPropertyImages (position = index). */
  const reorder = useCallback(
    (key: string, toIndex: number) => {
      updateItems((current) => {
        const from = current.findIndex((item) => item.key === key);
        if (from < 0 || toIndex < 0 || toIndex >= current.length || from === toIndex) return current;
        return arrayMove(current, from, toIndex);
      });
    },
    [updateItems],
  );

  const makeCover = useCallback(
    (key: string) => {
      if (itemsRef.current.findIndex((item) => item.key === key) <= 0) return;
      pendingFocusRef.current = { key };
      reorder(key, 0);
      setAnnouncement("La foto ahora es la portada.");
    },
    [reorder],
  );

  const removeItem = useCallback(
    (key: string) => {
      const current = itemsRef.current;
      const index = current.findIndex((item) => item.key === key);
      if (index < 0) return;
      const neighbor = current[index + 1] ?? current[index - 1];
      pendingFocusRef.current = neighbor ? { key: neighbor.key } : "add";

      const target = current[index];
      if (target.file) URL.revokeObjectURL(target.previewUrl);
      updateItems((items) => items.filter((item) => item.key !== key));
      setAnnouncement(
        `Foto quitada.${index === 0 && neighbor ? " La siguiente pasa a ser la portada." : ""} Se aplica al guardar.`,
      );
    },
    [updateItems],
  );

  const sensors = useSensors(
    // A few px of travel before a mouse drag starts, so a plain click on the
    // preview never reorders anything.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Press-and-hold on touch: a normal swipe over the photos keeps
    // scrolling the page; only a deliberate ~0.2s hold picks one up.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const positionOf = useCallback((id: UniqueIdentifier) => itemsRef.current.findIndex((item) => item.key === id) + 1, []);

  const announcements = useMemo<Announcements>(
    () => ({
      onDragStart: ({ active }) => `Levantaste la foto ${positionOf(active.id)} de ${itemsRef.current.length}.`,
      onDragOver: ({ over }) =>
        over
          ? `Posición ${positionOf(over.id)} de ${itemsRef.current.length}.${positionOf(over.id) === 1 ? " Quedará como portada." : ""}`
          : "La foto no está sobre ninguna posición.",
      onDragEnd: ({ active, over }) =>
        over
          ? `Foto soltada en la posición ${positionOf(over.id)} de ${itemsRef.current.length}.${positionOf(over.id) === 1 ? " Ahora es la portada." : ""}`
          : `Foto soltada. Sigue en la posición ${positionOf(active.id)}.`,
      onDragCancel: ({ active }) => `Movimiento cancelado. La foto sigue en la posición ${positionOf(active.id)}.`,
    }),
    [positionOf],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveKey(String(event.active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveKey(null);
    if (!over || active.id === over.id) return;
    reorder(String(active.id), itemsRef.current.findIndex((item) => item.key === over.id));
  }

  const activeItem = activeKey ? items.find((item) => item.key === activeKey) : undefined;

  /** Uploads every item that still has a `file` and isn't already `done`,
   * with at most `UPLOAD_CONCURRENCY` in flight. A per-file failure marks
   * that item `error` and moves on — it never aborts the others. */
  const uploadPending = useCallback(async (propertyId: string) => {
    const pending = itemsRef.current.filter((item) => item.file && item.status !== "done");
    if (pending.length === 0) return;

    updateItems((current) =>
      current.map((item) => (item.file && item.status !== "done" ? { ...item, status: "uploading", error: undefined } : item)),
    );

    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    const supabase = createClient();

    await mapWithConcurrency(pending, UPLOAD_CONCURRENCY, async (item) => {
      try {
        const url = await uploadPropertyImage(supabase, propertyId, item.file!);
        updateItems((current) =>
          current.map((it) => (it.key === item.key ? { ...it, url, status: "done", error: undefined } : it)),
        );
      } catch (error) {
        const message =
          error instanceof ImageUploadError ? error.message : `"${item.file!.name}": no se pudo subir.`;
        updateItems((current) => current.map((it) => (it.key === item.key ? { ...it, status: "error", error: message } : it)));
      } finally {
        doneCount += 1;
        setUploadProgress({ done: doneCount, total: pending.length });
      }
    });

    setUploadProgress(null);
  }, [updateItems]);

  const runCommitStep = useCallback(async () => {
    const ctx = commitRef.current;
    if (!ctx) return;

    await uploadPending(ctx.propertyId);

    const settled = itemsRef.current;
    if (settled.some((item) => item.status === "error")) {
      // Leave the promise pending — the "Reintentar" / "Continuar sin estas
      // fotos" buttons below call back into this function to unblock it.
      return;
    }

    commitRef.current = null;
    ctx.resolve(settled.filter((item) => item.url).map((item) => ({ url: item.url, alt: item.alt })));
  }, [uploadPending]);

  function retryFailed() {
    void runCommitStep();
  }

  function discardFailed() {
    updateItems((current) => {
      for (const item of current) {
        if (item.status === "error" && item.file) URL.revokeObjectURL(item.previewUrl);
      }
      return current.filter((item) => item.status !== "error");
    });
    void runCommitStep();
  }

  useImperativeHandle(
    ref,
    () => ({
      commit(propertyId: string) {
        return new Promise<{ url: string; alt: string }[]>((resolve) => {
          commitRef.current = { propertyId, resolve };
          void runCommitStep();
        });
      },
    }),
    [runCommitStep],
  );

  return (
    <div>
      {/* Phones: count + button share the first row and the help text gets
          the full width below; from `sm` the button sits beside both. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:items-start">
        <p className="text-sm font-medium tabular-nums text-grafito/80">
          {items.length === 0 ? "Sin fotos" : `${items.length} ${items.length === 1 ? "foto" : "fotos"}`}
        </p>
        <p className="col-span-2 row-start-2 font-body text-xs leading-relaxed text-grafito/50 sm:col-span-1">
          {items.length > 1
            ? "Arrastrá las fotos para cambiar el orden. La primera es la portada de la propiedad."
            : "La primera foto es la portada de la propiedad."}
        </p>
        <label
          className={cn(
            buttonClass(
              "secondary",
              "md",
              "col-start-2 row-start-1 self-center sm:row-span-2 sm:self-start has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-petroleo-claro",
            ),
            isBusy ? "pointer-events-none opacity-50" : "cursor-pointer",
          )}
        >
          <IconImagePlus className="h-4 w-4 text-grafito/60" />
          Agregar fotos
          <input
            ref={pickerRef}
            type="file"
            multiple
            disabled={isBusy}
            accept={ACCEPT_ATTR}
            onChange={(event) => {
              handlePick(event.target.files);
              event.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      </div>

      {items.length > 0 ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveKey(null)}
        >
          <SortableContext items={items.map((item) => item.key)} strategy={rectSortingStrategy}>
            {/* Column count follows the space each card needs (photo + two
                text actions): one column on phones, then 2 → 4 only as the
                editor really widens. */}
            <ul
              ref={gridRef}
              aria-label="Fotos de la propiedad, en orden. La primera es la portada."
              className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4 sm:gap-5"
            >
              {items.map((item, index) => (
                <PropertyPhotoCard
                  key={item.key}
                  item={item}
                  index={index}
                  total={items.length}
                  disabled={isBusy}
                  onMakeCover={makeCover}
                  onRemove={removeItem}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay dropAnimation={reducedMotion ? null : DROP_ANIMATION}>
            {activeItem ? <PropertyPhotoDragPreview item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-grafito/15 px-4 py-10 text-center text-sm text-grafito/50">
          Todavía no hay fotos cargadas.
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {processing ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-grafito/55">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-grafito/20 border-t-petroleo" />
          Optimizando fotos… ({processing.done} de {processing.total})
        </p>
      ) : null}

      {uploadProgress ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-grafito/55">
          <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-grafito/20 border-t-petroleo" />
          Subiendo fotos {uploadProgress.done} de {uploadProgress.total}…
        </p>
      ) : null}

      {hasFailedUploads && !uploadProgress ? (
        <div role="alert" className="mt-4 rounded-xl bg-terracota/[0.06] p-4 ring-1 ring-inset ring-terracota/20">
          <p className="text-sm text-terracota">
            Algunas fotos no se pudieron subir. Reintentá o continuá sin ellas para guardar el resto.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={retryFailed}
              className={buttonClass("dangerSolid", "sm")}
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={discardFailed}
              className={buttonClass("secondary", "sm")}
            >
              Continuar sin estas fotos
            </button>
          </div>
        </div>
      ) : null}

      {fileErrors.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {fileErrors.map((message) => (
            <li key={message} className="text-xs text-terracota">
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-5 font-body text-xs leading-relaxed text-grafito/45">
        JPG, PNG, WEBP, AVIF o HEIC, optimizadas automáticamente a WebP (máx. 1920px). Los cambios se aplican
        al guardar.
      </p>
    </div>
  );
});
