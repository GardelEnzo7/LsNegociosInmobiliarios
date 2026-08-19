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
  // Official profile — components that link to it (ContactSection, Footer)
  // only render the icon when this is present, so it stays overridable via
  // env for a future rebrand without touching those components.
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/ls.negociosinmobiliarios/",
  hours: [
    { label: "Lunes a viernes", value: "9:00 - 18:00" },
    { label: "Sábados", value: "9:00 - 13:00" },
    { label: "Domingos", value: "Cerrado" },
  ],
} as const;

/** Official social-share image — the single global fallback for Open Graph
 * and Twitter/X Card on every public page that doesn't have a more specific
 * image of its own (a property's own cover photo still takes priority over
 * this). Real file dimensions, not the 1200×630 "ideal" — declaring a size
 * that doesn't match the actual file is exactly the metadata/asset mismatch
 * this replaces (see the old costanera.jpg og:image, which claimed 1200×800
 * for a 3840×2560 file). */
export const SITE_OG_IMAGE = {
  url: "/images/og/og-image-ls-negocios-inmobiliarios-V2.png",
  width: 3840,
  height: 2560,
  alt: `${SITE.name} | Rosario`,
};

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

/** Shared Open Graph fields every public page needs beyond its own
 * title/description/url — `type`, `siteName` and `locale` are otherwise
 * silently lost because Next.js replaces (doesn't merge) a segment's
 * `openGraph` object wholesale when a page defines its own, instead of
 * merging it field-by-field with the root layout's. */
export function pageOpenGraph(title: string, description: string) {
  return {
    title,
    description,
    type: "website" as const,
    siteName: SITE.name,
    locale: "es_AR",
    images: [SITE_OG_IMAGE],
  };
}
