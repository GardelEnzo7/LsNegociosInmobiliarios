import Link from "next/link";
import type { PropertyWithImages } from "@/lib/data/properties";
import { AVAILABILITY_LABELS, OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { cn, formatNeighborhood, formatPrice } from "@/lib/utils";
import { IconPin } from "@/components/site/icons";
import { PropertyImage } from "@/components/site/property-image";

/**
 * Photo-first listing card. No surrounding box: the photo is the card, and
 * the copy sits underneath on the page background like a printed listing.
 *
 * The operation tag is "cut" into the photo's bottom-left corner in the page
 * background color (plata), with two concave corners so it reads as part of
 * the page rather than a sticker on top of the photo. Every place this card
 * is rendered sits on `bg-plata` — if it's ever placed on another
 * background, override `--card-notch` on a parent.
 *
 * On hover-capable devices the second photo crossfades in, giving a glimpse
 * of the interior without leaving the grid.
 */
export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const [cover, second] = property.property_images;
  const photoCount = property.property_images.length;
  const isClosed = property.availability !== "disponible";
  const typeLabel = PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type;

  const specs = [
    property.m2_total ? `${property.m2_total} m²` : null,
    property.rooms ? `${property.rooms} amb.` : null,
    property.bedrooms ? `${property.bedrooms} dorm.` : null,
    property.bathrooms ? `${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}` : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group block h-full rounded-lg [--card-notch:var(--color-plata)] focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-piedra">
        {cover ? (
          <PropertyImage
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]",
              isClosed && "grayscale-[40%] saturate-[0.8]",
            )}
          />
        ) : null}
        {second ? (
          <PropertyImage
            src={second.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "hidden object-cover opacity-0 transition-opacity duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100",
              isClosed && "grayscale-[40%] saturate-[0.8]",
            )}
          />
        ) : null}

        {isClosed ? (
          <StatusTag availability={property.availability} className="absolute left-3 top-3" />
        ) : property.isNew ? (
          <span className="absolute left-3 top-3 rounded-sm bg-petroleo px-2 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-blanco-roto shadow-[0_2px_8px_rgba(28,33,41,0.2)]">
            Nueva
          </span>
        ) : null}

        {photoCount > 1 ? (
          <span className="absolute right-3 top-3 rounded-sm bg-grafito-dark/55 px-1.5 py-0.5 font-utility text-[10px] tabular-nums text-blanco-roto/90 backdrop-blur-sm">
            {photoCount} fotos
          </span>
        ) : null}

        <span className="absolute bottom-0 left-0 rounded-tr-lg bg-[var(--card-notch)] pr-4 pt-2.5 font-body text-[13px] font-medium text-grafito">
          {OPERATION_LABELS[property.operation] ?? property.operation}
          <span className="text-grafito/40"> — </span>
          <span className="text-grafito/60">{typeLabel}</span>
          {/* Concave corners joining the tag to the photo edges. */}
          <span
            aria-hidden="true"
            className="absolute -top-2 left-0 h-2 w-2 bg-[radial-gradient(circle_at_100%_0,transparent_7.5px,var(--card-notch)_8px)]"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 -right-2 h-2 w-2 bg-[radial-gradient(circle_at_100%_0,transparent_7.5px,var(--card-notch)_8px)]"
          />
        </span>
      </div>

      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-[28px] leading-none tracking-[-0.01em] tabular-nums text-grafito">
            {formatPrice(property.price, property.currency as "USD" | "ARS")}
            {property.operation === "alquiler" ? (
              <span className="font-body text-sm tracking-normal text-grafito/45"> /mes</span>
            ) : null}
          </p>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 -translate-x-1 items-center justify-center rounded-full border border-grafito/15 text-grafito/60 opacity-0 transition-[opacity,transform,background-color,color,border-color] duration-300 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:border-petroleo group-hover:bg-petroleo group-hover:text-blanco-roto group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-x-0"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-1 font-display text-[17px] leading-snug text-grafito transition-colors duration-200 ease-out group-hover:text-petroleo">
          {property.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 font-body text-[13px] text-grafito/55">
          <IconPin className="h-3.5 w-3.5 shrink-0 text-grafito/35" />
          {formatNeighborhood(property.neighborhood)}
        </p>

        {specs.length > 0 ? (
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-grafito/10 pt-3 font-utility text-[12px] tabular-nums text-grafito/65">
            {specs.map((spec, index) => (
              <span key={spec} className="flex items-center gap-2.5">
                {index > 0 ? <span aria-hidden="true" className="h-3 w-px bg-grafito/15" /> : null}
                {spec}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** Status label over the cover photo — solid light background (not a
 * translucent overlay) so legibility never depends on how light or dark the
 * underlying photo is. The dot carries the meaning: bronce = still in play
 * (reservada), petróleo = closed deal (vendida/alquilada). */
function StatusTag({ availability, className }: { availability: string; className?: string }) {
  const label = AVAILABILITY_LABELS[availability] ?? availability;
  const isDone = availability === "vendida" || availability === "alquilada";
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-sm bg-blanco-roto px-2 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-grafito shadow-[0_2px_8px_rgba(28,33,41,0.2)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", isDone ? "bg-petroleo" : "bg-bronce")}
      />
      {label}
    </span>
  );
}

export function PropertyCardCompact({
  property,
  className,
}: {
  property: PropertyWithImages;
  className?: string;
}) {
  const cover = property.property_images[0];
  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className={cn("group relative block aspect-[4/5] overflow-hidden rounded-lg bg-piedra/40", className)}
    >
      {cover ? (
        <PropertyImage
          src={cover.url}
          alt={cover.alt || property.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.03]"
        />
      ) : null}
      <StatusTag availability={property.availability} className="absolute left-3 top-3" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-grafito-dark/90 via-grafito-dark/50 via-45% to-transparent p-5 pt-16">
        <p className="font-body text-[13px] text-blanco-roto/70">
          {PROPERTY_TYPE_LABELS[property.property_type]}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 font-display text-lg text-blanco-roto">
          <IconPin className="h-3.5 w-3.5 shrink-0 text-blanco-roto/60" />
          {formatNeighborhood(property.neighborhood)}
        </p>
      </div>
    </Link>
  );
}
