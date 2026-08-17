import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SITE, whatsappLink } from "@/lib/constants";

const SERVICE_LINKS = [
  "Compra y Venta",
  "Alquileres",
  "Tasaciones",
  "Asesoramiento Inmobiliario",
  "Inversiones",
  "Administración",
];

export function Footer() {
  return (
    <footer className="bg-grafito pt-16 text-blanco-roto/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-12 sm:px-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/Logo.webp" alt="" width={32} height={32} className="h-8 w-8" />
            <div className="leading-tight text-blanco-roto">
              <p className="font-display text-lg">{SITE.displayName}</p>
              <p className="font-utility text-[10px] uppercase tracking-[0.2em] text-blanco-roto/50">
                Negocios Inmobiliarios
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-blanco-roto/60">
            Conectamos personas con su próxima propiedad en Rosario y alrededores, con
            profesionalismo y dedicación en cada paso del camino.
          </p>
          <p className="mt-6 font-utility text-[11px] text-blanco-roto/40">{SITE.matricula}</p>
        </div>

        <div>
          <p className="font-utility text-[11px] uppercase tracking-[0.18em] text-petroleo-claro">
            Navegación
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="transition-colors duration-200 ease-out hover:text-blanco-roto">
                Inicio
              </Link>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors duration-200 ease-out hover:text-blanco-roto">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-utility text-[11px] uppercase tracking-[0.18em] text-petroleo-claro">
            Servicios
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {SERVICE_LINKS.map((service) => (
              <li key={service} className="text-blanco-roto/60">
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-utility text-[11px] uppercase tracking-[0.18em] text-petroleo-claro">
            Contacto
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{SITE.phoneDisplay}</li>
            <li>{SITE.email}</li>
          </ul>
          <a
            href={whatsappLink("Hola, quiero más información sobre una propiedad.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 font-utility text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-whatsapp-dark active:scale-[0.97]"
          >
            Escribinos
          </a>
        </div>
      </div>
      <div className="border-t border-blanco-roto/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-[11px] text-blanco-roto/40 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
          <p>{SITE.matricula}</p>
        </div>
      </div>
    </footer>
  );
}
