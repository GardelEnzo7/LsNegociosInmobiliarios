import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { IconChart, IconHome, IconUsers } from "@/components/site/icons";

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

export default function NosotrosPage() {
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

      <div className="mx-auto mt-16 max-w-3xl px-6 text-center sm:px-10">
        <Reveal className="space-y-5 font-body text-[15px] leading-relaxed text-grafito/70">
          <p>
            Laura Senmache Negocios Inmobiliarios nació de la idea simple de que comprar,
            vender o alquilar una propiedad no debería sentirse como un trámite frío.
            Empezamos acompañando operaciones puntuales en el centro de Rosario y, con el
            tiempo, fuimos sumando barrios y experiencia sin perder ese trato cercano.
          </p>
          <p>
            Hoy seguimos operando de la misma forma: cada propiedad pasa por una tasación
            real, cada cliente tiene un solo interlocutor durante todo el proceso, y cada
            operación se cierra con la misma atención que le pondríamos a la nuestra.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-6 sm:px-10">
        <div className="rounded-2xl bg-grafito py-16 text-blanco-roto">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <div className="grid gap-10 sm:grid-cols-3">
              {METRICS.map((metric, index) => (
                <Reveal key={metric.label} delay={index * 100} className="text-center">
                  <p className="font-display text-5xl tabular-nums text-petroleo-claro">
                    {metric.value}
                  </p>
                  <p className="mx-auto mt-3 max-w-[22ch] font-body text-sm leading-relaxed text-blanco-roto/70">
                    {metric.label}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
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

      <Reveal delay={150} className="mx-auto mt-20 max-w-2xl px-6 text-center sm:px-10">
        <p className="font-display text-xl italic leading-relaxed text-grafito/60">
          &ldquo;Espacio reservado para el testimonio de un cliente real, con nombre y
          operación concreta.&rdquo;
        </p>
      </Reveal>

      <div className="mx-auto mt-16 flex max-w-7xl justify-center px-6 sm:px-10">
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
