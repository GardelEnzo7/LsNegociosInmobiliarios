export const SITE = {
  name: "Laura Senmache Negocios Inmobiliarios",
  displayName: "Laura Senmache",
  shortName: "LS",
  tagline: "Tu próxima propiedad te está esperando",
  description:
    "Compra, venta y alquiler en Rosario y alrededores. Asesoramiento profesional en cada paso.",
  phoneDisplay: "+54 341 279-7316",
  whatsappNumber: "5493412797316",
  email: "inmobiliariasenmache@gmail.com",
  address: "Av. Pellegrini 1234, Rosario, Santa Fe",
  matricula: "Mat. Nro: 2589 COCIR",
  hours: [
    { label: "Lunes a viernes", value: "9:00 - 18:00" },
    { label: "Sábados", value: "9:00 - 13:00" },
    { label: "Domingos", value: "Cerrado" },
  ],
  mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent("Av. Pellegrini 1234, Rosario, Santa Fe")}&z=15&output=embed`,
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

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
