import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { ALL_SERVICES } from "@/components/site/services";
import { pageOpenGraph } from "@/lib/constants";

const DESCRIPTION =
  "Compra, venta, alquiler, tasaciones, asesoramiento, inversiones y administración de propiedades en Rosario.";

export const metadata: Metadata = {
  title: "Servicios",
  description: DESCRIPTION,
  alternates: { canonical: "/servicios" },
  openGraph: { ...pageOpenGraph("Servicios", DESCRIPTION), url: "/servicios" },
};

const [primary, ...secondary] = ALL_SERVICES;

export default function ServiciosPage() {
  return (
    <div className="pb-24">
      <div className="bg-piedra/30 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
          <Reveal>
            <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
              Lo que hacemos
            </p>
            <h1 className="mt-3 font-display text-4xl text-grafito sm:text-5xl">
              Nuestros Servicios
            </h1>
            <p className="mx-auto mt-3 max-w-md font-body text-grafito/60">
              Soluciones integrales para cada etapa de tu operación inmobiliaria.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-6 sm:px-10">
        <Reveal>
          <Link
            href={`/contacto?asunto=${encodeURIComponent(primary.title)}`}
            className="group grid gap-8 rounded-2xl bg-grafito p-10 text-blanco-roto transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_44px_-16px_rgba(28,33,41,0.5)] sm:grid-cols-[auto_1fr] sm:items-center sm:p-14"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blanco-roto/10 text-petroleo-claro transition-colors duration-300 ease-out group-hover:bg-petroleo-claro group-hover:text-grafito">
              <primary.icon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl">{primary.title}</h2>
              <p className="mt-2 max-w-xl font-body text-blanco-roto/70">{primary.description}</p>
              <span className="mt-4 flex items-center gap-1 font-utility text-[11px] uppercase tracking-[0.08em] text-petroleo-claro transition-transform duration-200 ease-out group-hover:translate-x-1">
                Consultar →
              </span>
            </div>
          </Link>
        </Reveal>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {secondary.map((service, index) => (
            <Reveal key={service.title} delay={index * 70}>
              <Link
                href={`/contacto?asunto=${encodeURIComponent(service.title)}`}
                className="group block h-full rounded-2xl bg-blanco-roto p-7 shadow-[0_1px_3px_rgba(28,33,41,0.06)] transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(28,33,41,0.25)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-piedra/60 text-grafito transition-colors duration-300 ease-out group-hover:bg-petroleo group-hover:text-blanco-roto">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-grafito">{service.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-grafito/60">
                  {service.description}
                </p>
                <span className="mt-4 flex items-center gap-1 font-utility text-[11px] uppercase tracking-[0.08em] text-petroleo transition-transform duration-200 ease-out group-hover:translate-x-1">
                  Consultar →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-2xl text-grafito">¿Con cuál te podemos ayudar?</p>
          <Link
            href="/contacto"
            className="rounded-full bg-petroleo px-8 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.1em] text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-petroleo-dark active:scale-[0.97]"
          >
            Contactanos
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
