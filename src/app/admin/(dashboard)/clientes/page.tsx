import { ContactForm } from "@/components/admin/contact-form";
import { ContactsList } from "@/components/admin/contacts-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAllContacts, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminClientsPage() {
  const [contacts, properties] = await Promise.all([getAllContacts(), getPropertiesForSelect()]);

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${contacts.length} en total.`} />

      <div className="mt-6 max-w-3xl space-y-6">
        <ContactForm properties={properties} />
        <ContactsList contacts={contacts} />
      </div>
    </div>
  );
}
