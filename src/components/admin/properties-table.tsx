"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteProperty, toggleFeatured, updateAvailability } from "@/app/actions/properties";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { AVAILABILITY_LABELS, AVAILABILITY_TIERS } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { IconPin } from "@/components/site/icons";
import { cn, formatPrice } from "@/lib/utils";
import type { PropertyWithImages } from "@/lib/data/properties";

const AVAILABILITY_OPTIONS = Object.entries(AVAILABILITY_LABELS).map(([value, label]) => ({ value, label }));
const OPERATION_FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
] as const;

export function PropertiesTable({
  properties,
  canDelete = true,
}: {
  properties: PropertyWithImages[];
  canDelete?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<string>("todas");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (operation !== "todas" && p.operation !== operation) return false;
      if (!term) return true;
      return [p.title, p.neighborhood, p.address].filter(Boolean).some((v) => v!.toLowerCase().includes(term));
    });
  }, [properties, query, operation]);

  if (properties.length === 0) {
    return (
      <EmptyState
        bordered
        text="Todavía no cargaste ninguna propiedad."
        action={
          <Link
            href="/admin/propiedades/nueva"
            className="inline-block rounded-lg bg-grafito px-4 py-2 text-sm font-medium text-blanco-roto transition-colors duration-150 ease-out hover:bg-grafito-dark"
          >
            Cargar la primera
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título, barrio o dirección…"
          className="w-full max-w-xs rounded-lg border border-grafito/10 bg-blanco-roto px-3 py-2 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo"
        />
        <div className="flex gap-1.5">
          {OPERATION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setOperation(f.value)}
              className={cn(
                "rounded-full px-3 py-1.5 font-utility text-[11px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ease-out",
                operation === f.value ? "bg-grafito text-blanco-roto" : "bg-piedra/40 text-grafito/60 hover:bg-piedra/60",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-grafito/40">{filtered.length} de {properties.length}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-4" bordered text="Ninguna propiedad coincide con la búsqueda." />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, canDelete }: { property: PropertyWithImages; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [availability, setAvailability] = useState(property.availability);
  const [featured, setFeatured] = useState(property.featured);
  const confirm = useConfirm();
  const cover = property.property_images[0];

  return (
    <div
      className={cn(
        "rounded-2xl bg-blanco-roto p-2 ring-1 ring-grafito/[0.06] transition-opacity duration-150",
        isPending && "opacity-60",
      )}
    >
      <Link href={`/admin/propiedades/${property.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-piedra">
          {cover ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
            <span className="rounded-full bg-grafito-dark/90 px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
              {OPERATION_LABELS[property.operation]}
            </span>
            {property.status === "draft" ? (
              <span className="rounded-full bg-bronce px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
                Borrador
              </span>
            ) : null}
          </div>
        </div>
        <div className="px-1.5 pt-3">
          <p className="font-display text-xl tabular-nums text-grafito" style={{ fontWeight: 460 }}>
            {formatPrice(property.price, property.currency as "USD" | "ARS")}
            {property.operation === "alquiler" ? <span className="font-body text-sm text-grafito/45"> /mes</span> : null}
          </p>
          <h3 className="mt-1 truncate font-display text-[15px] text-grafito" style={{ fontWeight: 460 }}>
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-grafito/50">
            <IconPin className="h-3 w-3 shrink-0" />
            {property.neighborhood} · {PROPERTY_TYPE_LABELS[property.property_type]}
          </p>
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-2 border-t border-grafito/[0.06] px-1.5 pt-3">
        <StatusSelect
          value={availability}
          tier={AVAILABILITY_TIERS[availability]}
          options={AVAILABILITY_OPTIONS}
          disabled={isPending}
          ariaLabel={`Estado de la operación para ${property.title}`}
          onChange={(value) => {
            setAvailability(value);
            startTransition(() => updateAvailability(property.id, value));
          }}
        />
        <button
          type="button"
          onClick={() => {
            const next = !featured;
            setFeatured(next);
            startTransition(() => toggleFeatured(property.id, next));
          }}
          role="switch"
          aria-checked={featured}
          aria-label="Destacada en la home"
          title="Destacada en la home"
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-out",
            featured ? "bg-petroleo" : "bg-piedra",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-blanco-roto shadow-sm transition-transform duration-200 ease-out",
              featured ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <Link href={`/admin/propiedades/${property.id}`} className="text-xs font-medium text-petroleo hover:underline">
            Editar
          </Link>
          {canDelete ? (
            <button
              type="button"
              onClick={async () => {
                const ok = await confirm({
                  title: `¿Eliminar "${property.title}"?`,
                  description: "Esta acción no se puede deshacer.",
                  confirmLabel: "Eliminar",
                  destructive: true,
                });
                if (ok) startTransition(() => void deleteProperty(property.id));
              }}
              className="text-xs font-medium text-terracota hover:underline"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
