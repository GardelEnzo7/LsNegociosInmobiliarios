import type { Metadata } from "next";
import { ContactSection } from "@/components/site/contact-section";

const DESCRIPTION = "Escribinos y te respondemos a la brevedad, o contactanos por WhatsApp.";

export const metadata: Metadata = {
  title: "Contacto",
  description: DESCRIPTION,
  alternates: { canonical: "/contacto" },
  openGraph: { title: "Contacto", description: DESCRIPTION, url: "/contacto" },
};

type SearchParams = Promise<{ asunto?: string }>;

export default async function ContactoPage({ searchParams }: { searchParams: SearchParams }) {
  const { asunto } = await searchParams;

  return <ContactSection topic={asunto} />;
}
