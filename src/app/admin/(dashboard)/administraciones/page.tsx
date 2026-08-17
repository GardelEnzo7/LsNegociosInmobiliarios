import { RentalContractForm } from "@/components/admin/rental-contract-form";
import { RentalContractsList } from "@/components/admin/rental-contracts-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAllContracts, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminAdministracionesPage() {
  const [contracts, properties] = await Promise.all([getAllContracts(), getPropertiesForSelect()]);

  return (
    <div>
      <PageHeader title="Administraciones" subtitle={`${contracts.length} en total.`} />

      <div className="mt-6 max-w-3xl space-y-6">
        <RentalContractForm properties={properties} />
        <RentalContractsList contracts={contracts} />
      </div>
    </div>
  );
}
