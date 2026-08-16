import { Reveal } from "@/components/site/reveal";
import { IconPortrait } from "@/components/site/icons";
import { PropertyCardCompact } from "@/components/site/property-card";
import { getClosedProperties } from "@/lib/data/properties";
import { SITE } from "@/lib/constants";

export async function OwnerShowcase() {
  const closed = await getClosedProperties(3);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
      <Reveal className="text-center">
        <p className="font-utility text-[12px] uppercase tracking-[0.24em] text-petroleo">
          Quién te acompaña
        </p>
        <h2 className="mt-3 font-display text-4xl text-grafito">
          Detrás de cada operación, un mismo nombre
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
        <Reveal>
          <div className="rounded-2xl bg-blanco-roto p-6 shadow-[0_1px_3px_rgba(28,33,41,0.06)] sm:p-8">
            <div className="mx-auto flex aspect-square w-40 items-center justify-center rounded-full bg-piedra/60 text-grafito/40 sm:w-48">
              <IconPortrait className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <div className="mt-6 text-center">
              <p className="font-display text-2xl text-grafito">{SITE.displayName}</p>
              <p className="mt-1 font-utility text-[11px] uppercase tracking-[0.14em] text-petroleo">
                Fundadora · {SITE.matricula}
              </p>
              <p className="mx-auto mt-4 max-w-xs font-body text-sm leading-relaxed text-grafito/60">
                Más de 5 años acompañando a familias rosarinas a comprar, vender y alquilar
                con confianza.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <p className="font-body text-sm text-grafito/60">
              Un vistazo a algunas de las operaciones que fuimos cerrando.
            </p>
            {closed.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {closed.map((property) => (
                  <PropertyCardCompact key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-2xl bg-piedra/40 p-8 text-center">
                <p className="max-w-xs font-body text-sm leading-relaxed text-grafito/50">
                  Pronto vamos a mostrar acá operaciones reales que fuimos cerrando en Rosario.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
