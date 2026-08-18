import Link from "next/link";
import { notFound } from "next/navigation";
import { RentalPayments } from "@/components/admin/rental-payments";
import { RentalAdjustments } from "@/components/admin/rental-adjustments";
import { StatusBadge } from "@/components/admin/status-badge";
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
    <div>
      <Link href="/admin/administraciones" className="text-sm text-grafito/50 hover:text-petroleo">
        ← Administraciones
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] leading-tight text-grafito" style={{ fontWeight: 480 }}>
            {contract.properties?.title ?? "Propiedad eliminada"}
          </h1>
          <p className="mt-1 text-sm text-grafito/50">
            {contract.start_date} → {contract.end_date ?? "en curso"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-grafito/10 bg-blanco-roto p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-grafito/50">Propietario / cliente</p>
          <p className="mt-2 text-sm font-medium text-grafito">{contract.owner?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-grafito/50">
            {[contract.owner?.contact_phone, contract.owner?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="rounded-xl border border-grafito/10 bg-blanco-roto p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-grafito/50">Inquilino</p>
          <p className="mt-2 text-sm font-medium text-grafito">{contract.tenant?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-grafito/50">
            {[contract.tenant?.contact_phone, contract.tenant?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="rounded-xl border border-grafito/10 bg-blanco-roto p-5 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-grafito/50">Contrato</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-grafito">
            <span className="rounded-full bg-piedra/50 px-2.5 py-1">
              Alquiler: {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
            </span>
            {contract.expensas_amount ? (
              <span className="rounded-full bg-piedra/50 px-2.5 py-1">
                Expensas: {formatPrice(contract.expensas_amount, "ARS")}
              </span>
            ) : null}
            <StatusBadge tier={RENTAL_STATUS_TIERS[contract.status]} label={RENTAL_STATUS_LABELS[contract.status] ?? contract.status} />
          </div>
          {contract.notes ? <p className="mt-3 text-sm leading-relaxed text-grafito/70">{contract.notes}</p> : null}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-[19px] text-grafito" style={{ fontWeight: 480 }}>Ajustes de alquiler</h2>
        <div className="mt-3">
          <RentalAdjustments contract={contract} adjustments={adjustments} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-[19px] text-grafito" style={{ fontWeight: 480 }}>Historial de pagos</h2>
        <div className="mt-3">
          <RentalPayments contractId={contract.id} payments={payments} />
        </div>
      </div>
    </div>
  );
}
