import { VisitForm } from "@/components/admin/visit-form";
import { VisitsList } from "@/components/admin/visits-list";
import { PageHeader } from "@/components/admin/ui/page-header";
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
      <PageHeader title="Visitas" subtitle="Qué tenemos hoy y qué viene después." />

      <div className="mt-6 max-w-3xl space-y-6">
        <VisitForm properties={properties} contacts={contacts} admins={admins} />
        <VisitsList visits={visits} />
      </div>
    </div>
  );
}
