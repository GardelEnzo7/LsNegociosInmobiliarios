import { RentalContractForm } from "@/components/admin/rental-contract-form";
import { RentalContractsList } from "@/components/admin/rental-contracts-list";
import { getAllContracts, getPropertiesForSelect } from "@/lib/data/admin";

export default async function AdminAdministracionesPage() {
  const [contracts, properties] = await Promise.all([getAllContracts(), getPropertiesForSelect()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Administraciones</h1>
          <p className="mt-1 text-sm text-zinc-500">{contracts.length} en total.</p>
        </div>
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        <RentalContractForm properties={properties} />
        <RentalContractsList contracts={contracts} />
      </div>
    </div>
  );
}
