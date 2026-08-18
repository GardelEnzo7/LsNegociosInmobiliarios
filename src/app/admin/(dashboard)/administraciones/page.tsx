import { RentalContractForm } from "@/components/admin/rental-contract-form";
import { RentalContractsList } from "@/components/admin/rental-contracts-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAllContracts, getPropertiesForSelect } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export default async function AdminAdministracionesPage() {
  const [contracts, properties, role] = await Promise.all([
    getAllContracts(),
    getPropertiesForSelect(),
    getCurrentAdminRole(),
  ]);

  return (
    <div>
      <PageHeader title="Administraciones" subtitle={`${contracts.length} en total.`} />

      <div className="mt-6 max-w-3xl space-y-6">
        <RentalContractForm properties={properties} />
        <RentalContractsList contracts={contracts} canDelete={role === "admin"} />
      </div>
    </div>
  );
}
