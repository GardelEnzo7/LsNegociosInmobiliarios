import Link from "next/link";
import { notFound } from "next/navigation";
import { RentalPayments } from "@/components/admin/rental-payments";
import { getContractById, getPaymentsForContract } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminAdministracionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);

  if (!contract) notFound();

  const payments = await getPaymentsForContract(id);

  return (
    <div>
      <Link href="/admin/administraciones" className="text-sm text-zinc-500 hover:text-petroleo">
        ← Administraciones
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{contract.properties?.title ?? "Propiedad eliminada"}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {contract.start_date} → {contract.end_date ?? "en curso"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Propietario / cliente</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{contract.owners?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {[contract.owners?.contact_phone, contract.owners?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Inquilino</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{contract.tenants?.full_name ?? "—"}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {[contract.tenants?.contact_phone, contract.tenants?.contact_email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Contrato</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-grafito">
            <span className="rounded-full bg-piedra/50 px-2.5 py-1">
              Alquiler: {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
            </span>
            {contract.expensas_amount ? (
              <span className="rounded-full bg-piedra/50 px-2.5 py-1">
                Expensas: {formatPrice(contract.expensas_amount, "ARS")}
              </span>
            ) : null}
            <span className="rounded-full bg-piedra/50 px-2.5 py-1">Estado: {contract.status}</span>
          </div>
          {contract.notes ? <p className="mt-3 text-sm leading-relaxed text-zinc-700">{contract.notes}</p> : null}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Historial de pagos</h2>
        <div className="mt-3">
          <RentalPayments contractId={contract.id} payments={payments} />
        </div>
      </div>
    </div>
  );
}
