import { notFound } from "next/navigation";
import Link from "next/link";
import { RentalPayments } from "@/components/admin/rental-payments";
import { RentalAdjustments } from "@/components/admin/rental-adjustments";
import { ContractEditForm } from "@/components/admin/contract-edit-form";
import { PersonCard } from "@/components/admin/person-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel, SectionHeading } from "@/components/admin/ui/panel";
import { labelClass } from "@/components/admin/ui/form-field";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TIERS } from "@/lib/admin/constants";
import { getContractById, getPaymentsForContract, getAdjustmentsForContract } from "@/lib/data/admin";
import {
  EXPIRY_WINDOW_DAYS,
  currentPeriod,
  daysUntil,
  describeDaysUntil,
  formatDateAR,
  todayInArgentina,
} from "@/lib/rental-reminders";
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

  const today = todayInArgentina();
  const active = contract.status === "activo";
  const daysToEnd = contract.end_date ? daysUntil(contract.end_date, today) : null;
  const endingSoon = active && daysToEnd !== null && daysToEnd <= EXPIRY_WINDOW_DAYS;
  const daysToAdjustment = contract.adjustment_next_date ? daysUntil(contract.adjustment_next_date, today) : null;
  const unpaid = payments.filter((p) => !p.paid).length;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={contract.properties?.title ?? "Propiedad eliminada"}
        subtitle={
          <>
            Del {formatDateAR(contract.start_date)} {contract.end_date ? `al ${formatDateAR(contract.end_date)}` : "· sin fecha de fin"}
            {contract.properties ? (
              <>
                {" · "}
                <Link href={`/admin/propiedades/${contract.properties.id}`} className="text-petroleo hover:underline">
                  Ver propiedad
                </Link>
              </>
            ) : null}
          </>
        }
        back={{ href: "/admin/administraciones", label: "Administraciones" }}
        action={<ContractEditForm contract={contract} rentLocked={adjustments.length > 0} />}
      />

      {/* At-a-glance strip: what this contract needs right now. */}
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-grafito/[0.06] ring-1 ring-grafito/[0.07] sm:grid-cols-4">
        <Fact label="Alquiler actual" value={formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")} />
        <Fact
          label="Próximo ajuste"
          value={contract.adjustment_next_date ? formatDateAR(contract.adjustment_next_date) : "Sin definir"}
          hint={daysToAdjustment !== null && active ? describeDaysUntil(daysToAdjustment) : undefined}
          warn={daysToAdjustment !== null && active && daysToAdjustment <= 15}
        />
        <Fact
          label="Vence el contrato"
          value={contract.end_date ? formatDateAR(contract.end_date) : "Sin fecha"}
          hint={endingSoon && daysToEnd !== null ? describeDaysUntil(daysToEnd) : undefined}
          warn={endingSoon}
        />
        <Fact
          label="Pagos pendientes"
          value={String(unpaid)}
          hint={unpaid > 0 ? "Ver abajo" : "Al día"}
          warn={unpaid > 0}
        />
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <PersonCard label="Propietario / cliente" person={contract.owner} />
        <PersonCard label="Inquilino" person={contract.tenant} />
      </div>

      <Panel className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className={labelClass}>Contrato</p>
          <StatusBadge tier={RENTAL_STATUS_TIERS[contract.status]} label={RENTAL_STATUS_LABELS[contract.status] ?? contract.status} />
        </div>
        <p className="mt-3 text-sm text-grafito/70">
          {contract.expensas_amount ? `Expensas: ${formatPrice(contract.expensas_amount, "ARS")}. ` : ""}
          {contract.notes || (contract.expensas_amount ? "" : "Sin notas.")}
        </p>
      </Panel>

      <section className="mt-10">
        <SectionHeading>Pagos</SectionHeading>
        <div className="mt-4">
          <RentalPayments
            contractId={contract.id}
            payments={payments}
            rentAmount={contract.rent_amount}
            rentCurrency={contract.rent_currency}
            currentPeriod={currentPeriod()}
            active={active}
          />
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading>Ajustes de alquiler</SectionHeading>
        <div className="mt-4">
          <RentalAdjustments contract={contract} adjustments={adjustments} />
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value, hint, warn }: { label: string; value: string; hint?: string; warn?: boolean }) {
  return (
    <div className="bg-blanco-roto px-5 py-4">
      <dt className="text-xs text-grafito/55">{label}</dt>
      <dd className="mt-1.5 text-[15px] font-medium tabular-nums text-grafito">{value}</dd>
      {hint ? <dd className={warn ? "mt-0.5 text-xs font-medium text-bronce" : "mt-0.5 text-xs text-grafito/50"}>{hint}</dd> : null}
    </div>
  );
}
