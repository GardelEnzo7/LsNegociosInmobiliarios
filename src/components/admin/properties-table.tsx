"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProperty, toggleFeatured, updateAvailability } from "@/app/actions/properties";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { AVAILABILITY_LABELS, AVAILABILITY_STYLES } from "@/lib/admin/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { PropertyWithImages } from "@/lib/data/properties";

export function PropertiesTable({
  properties,
  canDelete = true,
}: {
  properties: PropertyWithImages[];
  canDelete?: boolean;
}) {
  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no cargaste ninguna propiedad.</p>
        <Link
          href="/admin/propiedades/nueva"
          className="mt-4 inline-block rounded-lg bg-grafito px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark"
        >
          Cargar la primera
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Propiedad</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Destacada</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} canDelete={canDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PropertyRow({ property, canDelete }: { property: PropertyWithImages; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [availability, setAvailability] = useState(property.availability);
  const [featured, setFeatured] = useState(property.featured);
  const cover = property.property_images[0];

  return (
    <tr className={cn("transition-opacity duration-150", isPending && "opacity-50")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
            {cover ? <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900">{property.title}</p>
            <p className="text-xs text-zinc-500">
              {OPERATION_LABELS[property.operation]} · {PROPERTY_TYPE_LABELS[property.property_type]} ·{" "}
              {property.neighborhood}
            </p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-700">
        {formatPrice(property.price, property.currency as "USD" | "ARS")}
      </td>
      <td className="px-4 py-3">
        <select
          value={availability}
          onChange={(event) => {
            const value = event.target.value;
            setAvailability(value);
            startTransition(() => updateAvailability(property.id, value));
          }}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
            AVAILABILITY_STYLES[availability],
          )}
        >
          {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => {
            const next = !featured;
            setFeatured(next);
            startTransition(() => toggleFeatured(property.id, next));
          }}
          role="switch"
          aria-checked={featured}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200 ease-out",
            featured ? "bg-petroleo" : "bg-zinc-200",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out",
              featured ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/propiedades/${property.id}`}
            className="text-xs font-medium text-petroleo hover:underline"
          >
            Editar
          </Link>
          {canDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Eliminar "${property.title}"? Esta acción no se puede deshacer.`)) {
                  startTransition(() => deleteProperty(property.id));
                }
              }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
