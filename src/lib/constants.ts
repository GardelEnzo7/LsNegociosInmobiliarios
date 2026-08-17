export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

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
