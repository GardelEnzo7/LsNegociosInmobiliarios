"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import type { PropertyWithImages } from "@/lib/data/properties";

const FILTERS = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
] as const;

export function FeaturedProperties({ properties }: { properties: PropertyWithImages[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("todas");

  const filtered = useMemo(
    () => (filter === "todas" ? properties : properties.filter((p) => p.operation === filter)),
    [properties, filter],
  );

  if (properties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
      <Reveal className="text-center">
        <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
          Selección exclusiva
        </p>
        <h2 className="mt-3 font-display text-4xl text-grafito">Propiedades Destacadas</h2>
        <p className="mt-3 font-body text-grafito/60">
          Las mejores oportunidades inmobiliarias en Rosario y alrededores
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-10 flex justify-center">
        <div className="inline-flex gap-1 rounded-full bg-piedra/60 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full px-5 py-2 font-utility text-[12px] font-medium uppercase tracking-[0.06em] transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96]",
                filter === item.value
                  ? "bg-grafito text-blanco-roto"
                  : "text-grafito/60 hover:text-grafito",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center font-body text-grafito/50">
          No hay propiedades destacadas para este filtro por ahora.
        </p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property, index) => (
            <Reveal key={property.id} delay={(index % 3) * 80}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={100} className="mt-12 flex justify-center">
        <Link
          href="/propiedades"
          className="rounded-full border border-grafito/20 px-8 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.1em] text-grafito transition-[border-color,color,transform] duration-200 ease-out hover:border-petroleo hover:text-petroleo active:scale-[0.97]"
        >
          Ver más
        </Link>
      </Reveal>
    </section>
  );
}
