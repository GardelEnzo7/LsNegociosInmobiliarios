import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import { SITE, SITE_OG_IMAGE, SITE_URL } from "@/lib/constants";
import { jsonLdString } from "@/lib/utils";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  // 700 (font-bold) is never used anywhere in the app — confirmed via a
  // whole-repo search — so it's one fewer font file preloaded/downloaded
  // on every page for zero visual difference.
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-utility",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const DEFAULT_DESCRIPTION =
  "Compra, venta, alquiler, tasaciones e inversiones inmobiliarias en Rosario. Encontrá tu lugar en el horizonte de la ciudad.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} | Rosario`,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE.name,
  robots: { index: true, follow: true },
  // No explicit `icons` entry needed: favicon.ico and apple-icon.png in
  // src/app/ are picked up automatically by Next's file-convention metadata
  // (see node_modules/next/dist/docs/.../app-icons.md) — apple-icon.png is
  // the real 180x180 PNG generated from the LS isotype (Logo-3.webp),
  // replacing the old direct .webp reference here (Apple's convention wants
  // a PNG, not webp).
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
    title: `${SITE.name} | Rosario`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Rosario`,
    description: DEFAULT_DESCRIPTION,
    images: [SITE_OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#1c2129",
};

const OPENING_HOURS = SITE.hours
  .filter((h) => h.value.toLowerCase() !== "cerrado")
  .map((h) => `${h.label}: ${h.value}`);

// Sin dirección física propia todavía (atención remota / a domicilio) — no
// declaramos PostalAddress para no afirmar un local que no existe.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE.name,
  alternateName: SITE.shortName,
  description: SITE.description,
  url: SITE_URL,
  logo: `${SITE_URL}/Logo.webp`,
  image: `${SITE_URL}/images/hero/costanera.jpg`,
  telephone: SITE.phoneDisplay,
  email: SITE.email,
  areaServed: {
    "@type": "City",
    name: "Rosario",
  },
  sameAs: [SITE.instagramUrl],
  founder: {
    "@type": "Person",
    name: SITE.displayName,
    jobTitle: "Fundadora",
  },
  ...(OPENING_HOURS.length > 0 ? { openingHours: OPENING_HOURS } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-plata text-grafito font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
