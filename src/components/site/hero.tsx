import Image from "next/image";
import { PropertySearch } from "@/components/site/property-search";
import { SITE } from "@/lib/constants";

const HERO_IMAGES = [
  { src: "/images/hero/costanera.jpg", alt: "Costanera de Rosario al atardecer, sobre el río Paraná" },
  { src: "/images/hero/monumento.jpg", alt: "Monumento Nacional a la Bandera, Rosario" },
  { src: "/images/hero/puente.jpg", alt: "Puente Rosario-Victoria sobre el delta del Paraná" },
  { src: "/images/hero/centro.jpg", alt: "Casco histórico del centro de Rosario" },
];

export function Hero({ neighborhoods }: { neighborhoods: string[] }) {
  return (
    <section className="relative -mt-20 flex min-h-[100vh] flex-col items-center justify-center overflow-hidden bg-grafito-dark">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image.src}
            className="absolute inset-0 animate-crossfade opacity-0 motion-reduce:animate-none motion-reduce:opacity-100"
            style={{
              animationDelay: `${index * -4.5}s`,
              ...(index === 0 ? { opacity: 1 } : {}),
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-grafito-dark/85 via-grafito-dark/45 to-grafito-dark/55" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20 pt-24 text-center sm:px-10">
        <p
          className="animate-fade-up font-utility text-[12px] uppercase tracking-[0.3em] text-blanco-roto/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
        >
          {SITE.displayName} · Negocios Inmobiliarios
        </p>
        <h1
          className="animate-fade-up mt-5 text-balance font-display text-5xl font-normal leading-[1.08] tracking-[-0.01em] text-blanco-roto sm:text-6xl"
          style={{ animationDelay: "0.05s" }}
        >
          {SITE.tagline}
        </h1>
        <p
          className="animate-fade-up mx-auto mt-5 max-w-xl font-body text-lg leading-relaxed text-blanco-roto/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
          style={{ animationDelay: "0.1s" }}
        >
          {SITE.description}
        </p>

        <div className="animate-fade-up mt-12" style={{ animationDelay: "0.2s" }}>
          <PropertySearch neighborhoods={neighborhoods} />
        </div>
      </div>
    </section>
  );
}
