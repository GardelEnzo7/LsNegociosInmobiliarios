import { VisitForm } from "@/components/admin/visit-form";
import { VisitsList } from "@/components/admin/visits-list";
import { getAllVisits, getContactsForSelect, getActiveAdminProfiles, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminVisitsPage() {
  const [visits, properties, contacts, admins] = await Promise.all([
    getAllVisits(),
    getPropertiesForSelect(),
    getContactsForSelect(),
    getActiveAdminProfiles(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Visitas</h1>
      <p className="mt-1 text-sm text-zinc-500">{visits.length} en total.</p>

      <div className="mt-6 max-w-3xl space-y-6">
        <VisitForm properties={properties} contacts={contacts} admins={admins} />
        <VisitsList visits={visits} />
      </div>
    </div>
  );
}
