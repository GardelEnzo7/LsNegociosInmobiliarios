import type { Metadata } from "next";
import { ContactsDirectory } from "@/components/admin/contacts-directory";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getContactsDirectory } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Contactos" };

export default async function AdminContactosPage() {
  const contacts = await getContactsDirectory();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Contactos"
        subtitle="Propietarios e inquilinos de tus administraciones. Buscá a alguien, escribile o corregí sus datos."
      />
      <div className="mt-8">
        <ContactsDirectory contacts={contacts} />
      </div>
    </div>
  );
}
