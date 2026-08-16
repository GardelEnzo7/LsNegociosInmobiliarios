import { ContactForm } from "@/components/admin/contact-form";
import { ContactsList } from "@/components/admin/contacts-list";
import { getAllContacts, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminClientsPage() {
  const [contacts, properties] = await Promise.all([getAllContacts(), getPropertiesForSelect()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-500">{contacts.length} en total.</p>
        </div>
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        <ContactForm properties={properties} />
        <ContactsList contacts={contacts} />
      </div>
    </div>
  );
}
