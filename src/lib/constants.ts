/** Canonical production domain — hardcoded on purpose, not sourced from
 * any environment variable. This app has exactly one production domain,
 * and Netlify auto-populates build-time vars (its own URL/DEPLOY_URL/
 * DEPLOY_PRIME_URL, and previously NEXT_PUBLIC_SITE_URL in this project's
 * dashboard settings) with the *.netlify.app subdomain unless someone
 * remembers to override them — that's exactly how netlify.app leaked into
 * metadataBase, canonical URLs, Open Graph, sitemap.xml and robots.txt.
 * Trusting an env var here has no upside and a real footgun, so don't. */
export const SITE_URL = "https://inmobiliariasenmache.com.ar";

export const SITE = {
  name: "Laura Senmache Negocios Inmobiliarios",
  displayName: "Laura Senmache",
  shortName: "LS",
  tagline: "Tu próxima propiedad te está esperando",
  description:
    "Compra, venta y alquiler en Rosario y alrededores. Asesoramiento profesional en cada paso.",
  phoneDisplay: "+54 9 3417 40-5211",
  whatsappNumber: "5493417405211",
  email: "inmobiliariasenmache@gmail.com",
  matricula: "Mat. Nro: 2589 COCIR",
  // No real Instagram profile is configured yet — leave unset rather than
  // link to a placeholder. Set NEXT_PUBLIC_INSTAGRAM_URL once one exists;
  // ContactSection only renders the icon when this is present.
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
  hours: [
    { label: "Lunes a viernes", value: "9:00 - 18:00" },
    { label: "Sábados", value: "9:00 - 13:00" },
    { label: "Domingos", value: "Cerrado" },
  ],
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/servicios", label: "Servicios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const OPERATION_LABELS: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  ph: "PH",
  terreno: "Terreno",
  local: "Local",
  oficina: "Oficina",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  reservada: "Reservada",
  vendida: "Vendida",
  alquilada: "Alquilada",
};

export const ORIENTATION_LABELS: Record<string, string> = {
  norte: "Norte",
  sur: "Sur",
  este: "Este",
  oeste: "Oeste",
  noreste: "Noreste",
  noroeste: "Noroeste",
  sureste: "Sureste",
  suroeste: "Suroeste",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
