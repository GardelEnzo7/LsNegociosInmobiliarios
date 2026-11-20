import Link from "next/link";
import { RentalContractForm } from "@/components/admin/rental-contract-form";
import { RentalContractsList } from "@/components/admin/rental-contracts-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { buttonClass } from "@/components/admin/ui/button";
import { getAllContracts, getPropertiesForSelect } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";
import { todayInArgentina } from "@/lib/rental-reminders";

export default async function AdminAdministracionesPage() {
  const [contracts, properties, role] = await Promise.all([
    getAllContracts(),
    getPropertiesForSelect(),
    getCurrentAdminRole(),
  ]);
  const active = contracts.filter((c) => c.status === "activo").length;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Administraciones"
        subtitle={`${active} ${active === 1 ? "contrato activo" : "contratos activos"} de ${contracts.length} en total.`}
        action={
          <Link href="/admin/cobros" className={buttonClass("secondary")}>
            Ver cobros del mes
          </Link>
        }
      />

      <div className="mt-8 space-y-5">
        <RentalContractForm properties={properties} />
        <RentalContractsList contracts={contracts} today={todayInArgentina()} canDelete={role === "admin"} />
      </div>
    </div>
  );
}
