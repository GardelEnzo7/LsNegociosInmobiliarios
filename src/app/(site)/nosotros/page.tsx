import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { PropertyCardCompact } from "@/components/site/property-card";
import { getClosedProperties } from "@/lib/data/properties";
import { IconChart, IconHome, IconPortrait, IconUsers } from "@/components/site/icons";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Nosotros | Laura Senmache Negocios Inmobiliarios",
  description: "Más de 5 años acompañando operaciones de compra, venta y alquiler en Rosario.",
};

const METRICS = [
  { value: "+5", label: "años en el mercado inmobiliario de Rosario" },
  { value: "+320", label: "operaciones de compra, venta y alquiler cerradas" },
  { value: "98%", label: "de clientes que recomienda nuestro servicio" },
];

const VALUES = [
  {
    icon: IconHome,
    title: "Conocemos cada barrio",
    description:
      "No trabajamos con planillas genéricas: caminamos las zonas y conocemos su historia y su proyección antes de tasar.",
  },
  {
    icon: IconUsers,
    title: "Acompañamiento real",
    description:
      "Un mismo interlocutor de punta a punta, desde la primera visita hasta después de firmada la escritura.",
  },
  {
    icon: IconChart,
    title: "Transparencia en cada paso",
    description:
      "Valores de mercado, costos y tiempos claros desde el primer día, sin sorpresas al momento de firmar.",
  },
];

export default async function NosotrosPage() {
  const closed = await getClosedProperties(3);

  return (
    <div className="pb-24">
      <div className="bg-piedra/30 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
          <Reveal>
            <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
              Nosotros
            </p>
            <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl text-grafito sm:text-5xl">
              Rosario es nuestro oficio desde hace más de 5 años
            </h1>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <Reveal className="lg:sticky lg:top-28">
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-piedra/50 ring-1 ring-grafito/5">
              <div className="flex aspect-square w-40 items-center justify-center rounded-full bg-blanco-roto text-grafito/35 shadow-[0_1px_3px_rgba(28,33,41,0.06)] sm:w-48">
                <IconPortrait className="h-16 w-16 sm:h-20 sm:w-20" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="font-display text-2xl text-grafito">{SITE.displayName}</p>
              <p className="mt-1 font-utility text-[11px] uppercase tracking-[0.14em] text-petroleo">
                Fundadora · {SITE.matricula}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-piedra pt-6">
              {METRICS.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="font-display text-2xl tabular-nums text-petroleo">{metric.value}</p>
                  <p className="mt-1 font-body text-[11px] leading-snug text-grafito/50">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100} className="space-y-6 font-body text-[15px] leading-relaxed text-grafito/70">
            <p>
              Laura Senmache Negocios Inmobiliarios nació de la idea simple de que comprar,
              vender o alquilar una propiedad no debería sentirse como un trámite frío.
              Empezamos acompañando operaciones puntuales en el centro de Rosario y, con el
              tiempo, fuimos sumando barrios y experiencia sin perder ese trato cercano.
            </p>
            <p className="border-l-2 border-petroleo pl-5 font-display text-xl italic leading-snug text-grafito">
              &ldquo;Cada operación se cierra con la misma atención que le pondríamos a la
              nuestra.&rdquo;
            </p>
            <p>
              Hoy seguimos operando de la misma forma: cada propiedad pasa por una tasación
              real, cada cliente tiene un solo interlocutor durante todo el proceso, y cada
              operación se cierra con la misma atención que le pondríamos a la nuestra.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-7xl px-6 sm:px-10">
        <Reveal className="text-center">
          <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
            Cómo trabajamos
          </p>
          <h2 className="mt-3 font-display text-3xl text-grafito">Nuestros valores</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 80}>
              <div className="h-full rounded-2xl bg-blanco-roto p-7 shadow-[0_1px_3px_rgba(28,33,41,0.06)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-piedra/60 text-grafito">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-grafito">{value.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-grafito/60">
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-7xl px-6 sm:px-10">
        <Reveal className="text-center">
          <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
            Resultados
          </p>
          <h2 className="mt-3 font-display text-3xl text-grafito">Operaciones concretadas</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-grafito/60">
            Un repaso de compra-ventas y alquileres que ya cerramos en Rosario.
          </p>
        </Reveal>

        {closed.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {closed.map((property, index) => (
              <Reveal key={property.id} delay={index * 80}>
                <PropertyCardCompact property={property} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-12 rounded-2xl bg-piedra/30 px-8 py-14 text-center">
            <p className="font-display text-xl text-grafito/70">
              Pronto vamos a compartir acá nuestras operaciones concretadas.
            </p>
            <p className="mt-2 font-body text-sm text-grafito/50">
              Cada venta y alquiler que cerremos va a sumarse a esta sección.
            </p>
          </Reveal>
        )}
      </div>

      <div className="mx-auto mt-20 flex max-w-7xl justify-center px-6 sm:px-10">
        <Link
          href="/contacto"
          className="rounded-full bg-petroleo px-8 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.1em] text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-petroleo-dark active:scale-[0.97]"
        >
          Conversemos
        </Link>
      </div>
    </div>
  );
}
