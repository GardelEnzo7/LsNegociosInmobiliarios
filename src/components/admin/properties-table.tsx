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
import { Switch } from "@/components/admin/ui/switch";
import { buttonClass } from "@/components/admin/ui/button";
import { inputClass } from "@/components/admin/ui/form-field";
import { IconPin, IconSearch } from "@/components/site/icons";
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
            className={buttonClass("primary")}
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
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grafito/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, barrio o dirección…"
            aria-label="Buscar propiedades"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <div role="group" aria-label="Filtrar por operación" className="flex rounded-lg bg-piedra/40 p-1">
          {OPERATION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setOperation(f.value)}
              aria-pressed={operation === f.value}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium transition-colors duration-150 ease-out",
                operation === f.value
                  ? "bg-blanco-roto text-grafito shadow-[0_1px_2px_rgba(28,33,41,0.12)]"
                  : "text-grafito/55 hover:text-grafito",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs tabular-nums text-grafito/50">
          {filtered.length} de {properties.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-5" bordered text="Ninguna propiedad coincide con la búsqueda." />
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
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
        "flex flex-col overflow-hidden rounded-2xl bg-blanco-roto ring-1 ring-grafito/[0.07] transition-[opacity,box-shadow] duration-200 ease-out hover:shadow-[0_12px_32px_-20px_rgba(28,33,41,0.45)]",
        isPending && "opacity-60",
      )}
    >
      <Link href={`/admin/propiedades/${property.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-piedra">
          {cover ? (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : null}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-md bg-grafito-dark/85 px-2 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
              {OPERATION_LABELS[property.operation]}
            </span>
            {property.status === "draft" ? (
              <span className="rounded-md bg-bronce px-2 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-blanco-roto">
                Borrador
              </span>
            ) : null}
          </div>
        </div>
        <div className="px-4 pt-4">
          <p className="font-display text-xl tabular-nums text-grafito" style={{ fontWeight: 460 }}>
            {formatPrice(property.price, property.currency as "USD" | "ARS")}
            {property.operation === "alquiler" ? <span className="font-body text-sm text-grafito/45"> /mes</span> : null}
          </p>
          <h3 className="mt-1 truncate text-sm font-medium text-grafito">
            {property.title}
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-grafito/55">
            <IconPin className="h-3 w-3 shrink-0" />
            {property.neighborhood} · {PROPERTY_TYPE_LABELS[property.property_type]}
          </p>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-grafito/[0.06] px-4 py-3">
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
        <Switch
          checked={featured}
          onClick={() => {
            const next = !featured;
            setFeatured(next);
            startTransition(() => toggleFeatured(property.id, next));
          }}
          ariaLabel="Destacada en la home"
          title="Destacada en la home"
          label="Destacada"
        />

        <div className="-mr-1.5 ml-auto flex items-center">
          <Link href={`/admin/propiedades/${property.id}`} className={buttonClass("ghost", "sm")}>
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
              className={buttonClass("danger", "sm")}
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
