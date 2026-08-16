import type { Metadata } from "next";
import { ContactSection } from "@/components/site/contact-section";

export const metadata: Metadata = {
  title: "Contacto | Laura Senmache Negocios Inmobiliarios",
  description: "Escribinos y te respondemos a la brevedad, o contactanos por WhatsApp.",
};

type SearchParams = Promise<{ asunto?: string }>;

export default async function ContactoPage({ searchParams }: { searchParams: SearchParams }) {
  const { asunto } = await searchParams;

  return <ContactSection topic={asunto} />;
}
