import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import {
  IconBuilding,
  IconCalculator,
  IconChart,
  IconDocument,
  IconHome,
  IconKey,
} from "@/components/site/icons";

export const ALL_SERVICES = [
  {
    icon: IconBuilding,
    title: "Compra y Venta",
    description:
      "Te acompañamos en todo el proceso de compra o venta de tu propiedad con asesoramiento profesional.",
  },
  {
    icon: IconKey,
    title: "Alquileres",
    description:
      "Gestión completa de alquileres, desde la búsqueda hasta la administración de contratos.",
  },
  {
    icon: IconCalculator,
    title: "Tasaciones",
    description: "Valuación profesional basada en el mercado actual de Rosario.",
  },
  {
    icon: IconDocument,
    title: "Asesoramiento Inmobiliario",
    description: "Orientación legal e impositiva antes de firmar cualquier operación.",
  },
  {
    icon: IconChart,
    title: "Inversiones",
    description: "Identificamos oportunidades con potencial de renta y valorización.",
  },
  {
    icon: IconHome,
    title: "Administración",
    description: "Gestión integral de propiedades para propietarios a distancia.",
  },
];

const SERVICES = ALL_SERVICES.slice(0, 2);

export function Services() {
  return (
    <section className="bg-piedra/30 py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal className="text-center">
          <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
            Lo que hacemos
          </p>
          <h2 className="mt-3 font-display text-4xl text-grafito">Nuestros Servicios</h2>
          <p className="mt-3 font-body text-grafito/60">
            Soluciones integrales para cada etapa de tu operación inmobiliaria
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service, index) => (
            <Reveal key={service.title} delay={index * 80}>
              <Link
                href={`/contacto?asunto=${encodeURIComponent(service.title)}`}
                className="group block h-full rounded-2xl bg-blanco-roto p-8 shadow-[0_1px_3px_rgba(28,33,41,0.06)] transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(28,33,41,0.25)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-piedra/60 text-grafito transition-colors duration-300 ease-out group-hover:bg-petroleo group-hover:text-blanco-roto">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl text-grafito">{service.title}</h3>
                <p className="mt-2 max-w-sm font-body text-[15px] leading-relaxed text-grafito/60">
                  {service.description}
                </p>
                <span className="mt-4 flex items-center gap-1 font-utility text-[11px] uppercase tracking-[0.08em] text-petroleo transition-transform duration-200 ease-out group-hover:translate-x-1">
                  Consultar →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
