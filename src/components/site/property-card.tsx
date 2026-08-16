import Image from "next/image";
import Link from "next/link";
import type { PropertyWithImages } from "@/lib/data/properties";
import { AVAILABILITY_LABELS, OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { IconArea, IconBath, IconBed, IconPin } from "@/components/site/icons";

export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const cover = property.property_images[0];
  const isClosed = property.availability !== "disponible";
  const specs = [
    property.bedrooms ? { icon: IconBed, value: `${property.bedrooms}` } : null,
    property.bathrooms ? { icon: IconBath, value: `${property.bathrooms}` } : null,
    property.m2_total ? { icon: IconArea, value: `${property.m2_total} m²` } : null,
  ].filter(Boolean) as { icon: typeof IconBed; value: string }[];

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-blanco-roto p-2 shadow-[0_1px_3px_rgba(28,33,41,0.08)] ring-1 ring-grafito/[0.06] transition-[box-shadow,ring-color] duration-500 ease-out hover:shadow-[0_20px_40px_-16px_rgba(28,33,41,0.3)] hover:ring-grafito/10"
    >
      <div className="flex items-center gap-2 px-2 pb-3 pt-1">
        <span className="rounded-full bg-grafito px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.1em] text-blanco-roto">
          {OPERATION_LABELS[property.operation]}
        </span>
        <span className="font-utility text-[10px] font-medium uppercase tracking-[0.14em] text-grafito/45">
          {PROPERTY_TYPE_LABELS[property.property_type]}
        </span>
        {isClosed ? <StatusPill availability={property.availability} className="ml-auto" /> : null}
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-piedra">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              isClosed && "grayscale-[35%] saturate-[0.85]",
            )}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="font-display text-[26px] leading-none tabular-nums text-grafito">
          {formatPrice(property.price, property.currency as "USD" | "ARS")}
          {property.operation === "alquiler" ? (
            <span className="font-body text-sm text-grafito/50"> /mes</span>
          ) : null}
        </p>
        <h3 className="mt-2.5 line-clamp-1 font-display text-[17px] leading-snug text-grafito">
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 font-body text-[13px] text-grafito/50">
          <IconPin className="h-3.5 w-3.5 shrink-0 text-grafito/35" />
          {property.neighborhood}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-piedra/70 pt-4 font-utility text-[12px] text-grafito/60">
          {specs.map((spec, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <spec.icon className="h-4 w-4 text-grafito/35" />
              {spec.value}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 font-utility text-[11px] uppercase tracking-[0.08em] text-petroleo transition-transform duration-200 ease-out group-hover:translate-x-1">
            Ver más →
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ availability, className }: { availability: string; className?: string }) {
  const label = AVAILABILITY_LABELS[availability] ?? availability;
  const isDone = availability === "vendida" || availability === "alquilada";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.1em]",
        isDone ? "bg-petroleo text-blanco-roto" : "text-grafito/60 ring-1 ring-inset ring-grafito/20",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function PropertyCardCompact({ property }: { property: PropertyWithImages }) {
  const cover = property.property_images[0];
  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-piedra/40 ring-1 ring-grafito/5 transition-shadow duration-500 ease-out hover:shadow-[0_16px_32px_-14px_rgba(28,33,41,0.25)]"
    >
      {cover ? (
        <Image
          src={cover.url}
          alt={cover.alt || property.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 45vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-grafito-dark/85 via-grafito-dark/25 to-transparent p-4 pt-10">
        <p className="font-utility text-[10px] font-medium uppercase tracking-[0.12em] text-petroleo-claro">
          {(AVAILABILITY_LABELS[property.availability] ?? property.availability)} ·{" "}
          {PROPERTY_TYPE_LABELS[property.property_type]}
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-display text-[15px] text-blanco-roto">
          <IconPin className="h-3.5 w-3.5 shrink-0 text-blanco-roto/60" />
          {property.neighborhood}
        </p>
      </div>
    </Link>
  );
}
