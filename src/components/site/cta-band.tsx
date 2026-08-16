import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { IconCalculator, IconChart, IconUsers } from "@/components/site/icons";

const REASONS = [
  {
    icon: IconCalculator,
    title: "Valuación Profesional",
    description: "Análisis actualizado del mercado rosarino para fijar el precio justo.",
  },
  {
    icon: IconChart,
    title: "Marketing Efectivo",
    description: "Difusión en los portales inmobiliarios más consultados de la región.",
  },
  {
    icon: IconUsers,
    title: "Acompañamiento Total",
    description: "Te asesoramos en cada etapa, desde la tasación hasta la firma.",
  },
];

export function CtaBand() {
  return (
    <section className="bg-grafito py-24 text-blanco-roto">
      <div className="mx-auto max-w-7xl px-6 text-center sm:px-10">
        <Reveal>
          <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo-claro">
            Poné tu propiedad a trabajar
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl">
            ¿Querés vender o alquilar tu propiedad?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-blanco-roto/70">
            Con más de 5 años en el mercado rosarino, te ayudamos a obtener el mejor
            resultado en el menor tiempo posible.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 80}>
              <div className="h-full rounded-2xl bg-blanco-roto/5 p-7 text-left ring-1 ring-inset ring-blanco-roto/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blanco-roto/10 text-petroleo-claro">
                  <reason.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg">{reason.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-blanco-roto/60">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12">
          <Link
            href="/contacto"
            className="inline-flex items-center rounded-full bg-blanco-roto px-8 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.1em] text-grafito transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
          >
            Contactar Ahora
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
