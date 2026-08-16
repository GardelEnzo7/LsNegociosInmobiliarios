import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/site/contact-form";
import { PropertyGallery } from "@/components/site/property-gallery";
import { PropertyCard } from "@/components/site/property-card";
import { Reveal } from "@/components/site/reveal";
import { TrackPropertyView } from "@/components/site/track-property-view";
import { IconArea, IconBath, IconBed, IconPin } from "@/components/site/icons";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS, SITE, whatsappLink } from "@/lib/constants";
import { getPropertyBySlug, getSimilarProperties } from "@/lib/data/properties";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export default async function PropertyDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const similar = await getSimilarProperties(property);

  const summary = [
    PROPERTY_TYPE_LABELS[property.property_type],
    property.m2_total ? `${property.m2_total} m²` : null,
    property.bedrooms ? `${property.bedrooms} ambiente${property.bedrooms > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const specs = [
    property.m2_total ? { icon: IconArea, value: `${property.m2_total} m²`, label: "tot." } : null,
    property.m2_covered ? { icon: IconArea, value: `${property.m2_covered} m²`, label: "cub." } : null,
    property.bedrooms ? { icon: IconBed, value: `${property.bedrooms}`, label: "amb." } : null,
    property.bathrooms
      ? { icon: IconBath, value: `${property.bathrooms}`, label: property.bathrooms > 1 ? "baños" : "baño" }
      : null,
  ].filter(Boolean) as { icon: typeof IconBed; value: string; label: string }[];

  const message = `Hola, quiero más información sobre "${property.title}".`;

  return (
    <div className="pb-24">
      <TrackPropertyView propertyId={property.id} />
      <div className="mx-auto max-w-7xl px-6 pt-8 sm:px-10">
        <nav className="flex flex-wrap items-center gap-1.5 font-body text-sm text-grafito/50">
          <Link href="/" className="transition-colors duration-200 ease-out hover:text-petroleo">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/propiedades" className="transition-colors duration-200 ease-out hover:text-petroleo">
            Propiedades
          </Link>
          <span>/</span>
          <span className="text-grafito/75">{property.title}</span>
        </nav>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-6 sm:px-10">
        <PropertyGallery images={property.property_images} title={property.title} />
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-x-14 gap-y-10 px-6 sm:px-10 lg:grid-cols-[2.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-utility text-[11px] uppercase tracking-[0.14em] text-grafito/50">{summary}</p>
            <span className="rounded-md bg-piedra/50 px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.08em] text-grafito/70">
              {OPERATION_LABELS[property.operation]}
            </span>
          </div>
          <p className="mt-2 font-display text-3xl tabular-nums text-grafito sm:text-4xl">
            {formatPrice(property.price, property.currency as "USD" | "ARS")}
            {property.operation === "alquiler" ? (
              <span className="font-body text-base text-grafito/50"> /mes</span>
            ) : null}
          </p>

          {property.address ? (
            <div className="mt-10 border-t border-piedra pt-8">
              <p className="flex items-center gap-1.5 font-body text-[15px] text-grafito/75">
                <IconPin className="h-4 w-4 shrink-0 text-grafito/40" />
                {property.address}, {property.neighborhood}
              </p>
              {property.lat && property.lng ? (
                <div className="relative mt-5 aspect-[16/7] w-full overflow-hidden rounded-2xl">
                  <iframe
                    title={`Ubicación de ${property.title}`}
                    src={`https://www.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {specs.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-x-9 gap-y-4 border-y border-piedra py-6">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <spec.icon className="h-4 w-4 shrink-0 text-grafito/35" />
                  <span className="font-display text-base tabular-nums text-grafito">{spec.value}</span>
                  <span className="font-utility text-[11px] uppercase tracking-[0.04em] text-grafito/50">
                    {spec.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-10">
            <h1 className="font-display text-2xl text-grafito">{property.title}</h1>
            <p className="mt-1.5 font-body text-sm text-grafito/50">{property.neighborhood}</p>
            <p className="mt-6 max-w-2xl font-body text-[15px] leading-relaxed text-grafito/75">
              {property.description}
            </p>
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-piedra bg-blanco-roto p-6">
            <p className="font-display text-lg text-grafito">Contactá al anunciante</p>
            <div className="mt-5">
              <ContactForm propertyId={property.id} />
            </div>
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 font-utility text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-whatsapp-dark active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.1c-1.62 0-3.13-.47-4.4-1.28l-.32-.2-3 .79.8-2.93-.21-.3a8.1 8.1 0 0 1-1.27-4.18c0-4.48 3.65-8.12 8.4-8.12 4.74 0 8.4 3.64 8.4 8.12s-3.66 8.1-8.4 8.1Z" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>

          <div className="mt-4 rounded-2xl bg-piedra/30 p-5">
            <p className="font-display text-sm text-grafito">{SITE.name}</p>
            <p className="mt-1.5 font-body text-sm text-grafito/60">{SITE.phoneDisplay}</p>
            <p className="font-body text-sm text-grafito/60">{SITE.email}</p>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:px-10">
          <p className="font-utility text-[11px] uppercase tracking-[0.16em] text-grafito/45">
            Propiedades Similares
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <PropertyCard property={item} />
              </Reveal>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
