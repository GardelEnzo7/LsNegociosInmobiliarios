import { notFound } from "next/navigation";
import { RentalPayments } from "@/components/admin/rental-payments";
import { RentalAdjustments } from "@/components/admin/rental-adjustments";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel, SectionHeading } from "@/components/admin/ui/panel";
import { labelClass } from "@/components/admin/ui/form-field";
import { chipClass } from "@/components/admin/ui/chip";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TIERS } from "@/lib/admin/constants";
import { getContractById, getPaymentsForContract, getAdjustmentsForContract } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminAdministracionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);

  if (!contract) notFound();

  const [payments, adjustments] = await Promise.all([
    getPaymentsForContract(id),
    getAdjustmentsForContract(id),
  ]);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={contract.properties?.title ?? "Propiedad eliminada"}
        subtitle={`${contract.start_date} → ${contract.end_date ?? "en curso"}`}
        back={{ href: "/admin/administraciones", label: "Administraciones" }}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Panel>
          <p className={labelClass}>Propietario / cliente</p>
          <p className="mt-2 text-sm font-medium text-grafito">{contract.owner?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-grafito/55">
            {[contract.owner?.contact_phone, contract.owner?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </Panel>
        <Panel>
          <p className={labelClass}>Inquilino</p>
          <p className="mt-2 text-sm font-medium text-grafito">{contract.tenant?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-grafito/55">
            {[contract.tenant?.contact_phone, contract.tenant?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </Panel>
        <Panel className="sm:col-span-2">
          <p className={labelClass}>Contrato</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={chipClass}>
              Alquiler: {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
            </span>
            {contract.expensas_amount ? (
              <span className={chipClass}>Expensas: {formatPrice(contract.expensas_amount, "ARS")}</span>
            ) : null}
            <StatusBadge tier={RENTAL_STATUS_TIERS[contract.status]} label={RENTAL_STATUS_LABELS[contract.status] ?? contract.status} />
          </div>
          {contract.notes ? <p className="mt-4 text-sm leading-relaxed text-grafito/70">{contract.notes}</p> : null}
        </Panel>
      </div>

      <section className="mt-10">
        <SectionHeading>Ajustes de alquiler</SectionHeading>
        <div className="mt-4">
          <RentalAdjustments contract={contract} adjustments={adjustments} />
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading>Historial de pagos</SectionHeading>
        <div className="mt-4">
          <RentalPayments contractId={contract.id} payments={payments} />
        </div>
      </section>
    </div>
  );
}
