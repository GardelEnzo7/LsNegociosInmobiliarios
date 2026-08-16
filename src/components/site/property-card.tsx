import Image from "next/image";
import Link from "next/link";
import type { PropertyWithImages } from "@/lib/data/properties";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { IconArea, IconBath, IconBed, IconPin } from "@/components/site/icons";

export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const cover = property.property_images[0];
  const specs = [
    property.bedrooms ? { icon: IconBed, value: `${property.bedrooms}` } : null,
    property.bathrooms ? { icon: IconBath, value: `${property.bathrooms}` } : null,
    property.m2_total ? { icon: IconArea, value: `${property.m2_total} m²` } : null,
  ].filter(Boolean) as { icon: typeof IconBed; value: string }[];

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group block overflow-hidden rounded-2xl bg-blanco-roto shadow-[0_1px_3px_rgba(28,33,41,0.08)] transition-shadow duration-300 ease-out hover:shadow-[0_20px_40px_-16px_rgba(28,33,41,0.3)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-piedra">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-md bg-grafito px-3 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.1em] text-blanco-roto">
            {OPERATION_LABELS[property.operation]}
          </span>
          <span className="rounded-md bg-blanco-roto/90 px-3 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.1em] text-grafito">
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="font-display text-2xl tabular-nums text-grafito">
          {formatPrice(property.price, property.currency as "USD" | "ARS")}
          {property.operation === "alquiler" ? (
            <span className="font-body text-sm text-grafito/50"> /mes</span>
          ) : null}
        </p>
        <h3 className="mt-3 line-clamp-1 font-display text-lg leading-snug text-grafito">
          {property.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 font-body text-sm text-grafito/55">
          <IconPin className="h-3.5 w-3.5 shrink-0" />
          {property.neighborhood}
        </p>

        <div className="mt-5 flex items-center gap-4 border-t border-piedra pt-5 font-utility text-[13px] text-grafito/70">
          {specs.map((spec, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <spec.icon className="h-4 w-4 text-grafito/40" />
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
