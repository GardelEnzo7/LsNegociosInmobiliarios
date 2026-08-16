import { Reveal } from "@/components/site/reveal";
import { IconStar } from "@/components/site/icons";

const TESTIMONIALS = [
  "La venta de nuestra casa se cerró antes de lo que esperábamos. El acompañamiento fue claro en cada paso, sin sorpresas de último momento.",
  "Nos ayudaron a conseguir un precio justo gracias a un análisis de mercado bien fundamentado. Todo el proceso fue transparente de punta a punta.",
  "Encontramos el departamento ideal en pocas semanas. Nos explicaron el contrato con paciencia y siempre estuvieron disponibles ante cualquier duda.",
  "Necesitábamos alquilar rápido y con inquilinos serios, y así fue. Gestión prolija y atención personalizada en todo momento.",
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
      <Reveal className="text-center">
        <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
          Testimonios
        </p>
        <h2 className="mt-3 font-display text-4xl text-grafito">Lo que dicen nuestros clientes</h2>
        <p className="mx-auto mt-3 max-w-md font-body text-grafito/60">
          Experiencias reales de personas que confiaron en nosotros para sus operaciones
          inmobiliarias.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((quote, index) => (
          <Reveal key={index} delay={index * 70}>
            <div className="h-full rounded-2xl bg-blanco-roto p-6 shadow-[0_1px_3px_rgba(28,33,41,0.06)]">
              <div className="flex gap-0.5 text-petroleo">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>
              <p className="mt-4 font-body text-sm leading-relaxed text-grafito/70">
                &ldquo;{quote}&rdquo;
              </p>
              <p className="mt-4 font-display text-sm text-grafito/50">Anónimo</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
