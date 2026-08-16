import { ContactForm } from "@/components/site/contact-form";
import { Reveal } from "@/components/site/reveal";
import { IconInstagram, IconPin } from "@/components/site/icons";
import { SITE, whatsappLink } from "@/lib/constants";

export function ContactSection({ topic }: { topic?: string }) {
  const defaultMessage = topic ? `Hola, quiero más información sobre ${topic}.` : undefined;

  return (
    <section id="contacto" className="bg-piedra/30 py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal className="text-center">
          <h2 className="font-display text-4xl text-grafito">Contactanos</h2>
          <p className="mt-3 font-body text-grafito/60">
            {topic
              ? `Contanos más sobre tu consulta de ${topic} y te respondemos a la brevedad.`
              : "¿Tenés alguna consulta? Dejanos tu mensaje y te contactaremos a la brevedad."}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <Reveal className="rounded-2xl bg-blanco-roto p-8 sm:p-10">
            <h3 className="font-display text-xl text-grafito">Información de Contacto</h3>
            <ul className="mt-6 space-y-5 font-body text-sm text-grafito/75">
              <li>
                <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-grafito/45">
                  Dirección
                </p>
                <p className="mt-1">{SITE.address}</p>
              </li>
              <li>
                <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-grafito/45">
                  Teléfono
                </p>
                <p className="mt-1">{SITE.phoneDisplay}</p>
              </li>
              <li>
                <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-grafito/45">
                  Email
                </p>
                <p className="mt-1">{SITE.email}</p>
              </li>
              <li>
                <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-grafito/45">
                  Horarios de Atención
                </p>
                {SITE.hours.map((h) => (
                  <p key={h.label} className="mt-1">
                    {h.label}: {h.value}
                  </p>
                ))}
              </li>
            </ul>

            <p className="mt-6 font-utility text-[11px] uppercase tracking-[0.1em] text-grafito/45">
              Seguinos en Redes
            </p>
            <div className="mt-3 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-piedra/50 text-grafito transition-colors duration-200 ease-out hover:bg-petroleo hover:text-blanco-roto"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink("Hola, quiero más información sobre una propiedad.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-piedra/50 text-grafito transition-colors duration-200 ease-out hover:bg-whatsapp hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.1c-1.62 0-3.13-.47-4.4-1.28l-.32-.2-3 .79.8-2.93-.21-.3a8.1 8.1 0 0 1-1.27-4.18c0-4.48 3.65-8.12 8.4-8.12 4.74 0 8.4 3.64 8.4 8.12s-3.66 8.1-8.4 8.1Z" />
                </svg>
              </a>
            </div>
          </Reveal>

          <Reveal delay={100} className="rounded-2xl bg-blanco-roto p-8 sm:p-10">
            <h3 className="font-display text-xl text-grafito">Envianos un Mensaje</h3>
            <div className="mt-6">
              <ContactForm defaultMessage={defaultMessage} />
            </div>
          </Reveal>
        </div>

        <Reveal delay={150} className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-2xl">
          <iframe
            title={`Ubicación de ${SITE.name}`}
            src={SITE.mapEmbedSrc}
            className="h-full w-full grayscale-[10%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute left-5 top-5 max-w-xs rounded-xl bg-blanco-roto p-4 shadow-[0_12px_30px_-10px_rgba(28,33,41,0.3)]">
            <p className="flex items-center gap-1.5 font-display text-sm text-grafito">
              <IconPin className="h-4 w-4 shrink-0 text-petroleo" />
              {SITE.address}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
