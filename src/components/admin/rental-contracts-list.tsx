"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteContract, updateContractStatus } from "@/app/actions/rentals";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TIERS } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { chipClass, pendingChipClass } from "@/components/admin/ui/chip";
import { cn, formatPrice } from "@/lib/utils";

const RENTAL_STATUS_OPTIONS = Object.entries(RENTAL_STATUS_LABELS).map(([value, label]) => ({ value, label }));

type Contract = {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  rent_currency: string;
  expensas_amount: number | null;
  status: string;
  adjustment_next_date: string | null;
  properties: { id: string; title: string; slug: string } | null;
  owner: { id: string; full_name: string } | null;
  tenant: { id: string; full_name: string } | null;
};

export function RentalContractsList({ contracts, canDelete = true }: { contracts: Contract[]; canDelete?: boolean }) {
  if (contracts.length === 0) {
    return <EmptyState text="Todavía no hay administraciones cargadas." bordered />;
  }

  return (
    <ul className="space-y-3">
      {contracts.map((contract) => (
        <li key={contract.id}>
          <ContractCard contract={contract} canDelete={canDelete} />
        </li>
      ))}
    </ul>
  );
}

function ContractCard({ contract, canDelete }: { contract: Contract; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <div
      className={cn(
        "rounded-2xl bg-blanco-roto p-5 ring-1 ring-grafito/[0.07] transition-opacity duration-150 sm:p-6",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/administraciones/${contract.id}`}
            className="font-display text-[17px] leading-snug text-grafito transition-colors duration-150 ease-out hover:text-petroleo"
            style={{ fontWeight: 480 }}
          >
            {contract.properties?.title ?? "Propiedad eliminada"}
          </Link>
          <p className="mt-1 text-sm text-grafito/60">
            Cliente: {contract.owner?.full_name ?? "—"} · Inquilino: {contract.tenant?.full_name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-grafito/50">
            {contract.start_date} → {contract.end_date ?? "en curso"}
          </p>
        </div>
        <StatusSelect
          value={contract.status}
          tier={RENTAL_STATUS_TIERS[contract.status]}
          options={RENTAL_STATUS_OPTIONS}
          disabled={isPending}
          ariaLabel={`Estado del contrato de ${contract.properties?.title ?? "propiedad eliminada"}`}
          onChange={(value) => startTransition(() => updateContractStatus(contract.id, value))}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={chipClass}>
          Alquiler: {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
        </span>
        {contract.expensas_amount ? (
          <span className={chipClass}>Expensas: {formatPrice(contract.expensas_amount, "ARS")}</span>
        ) : null}
        {contract.adjustment_next_date ? (
          <span className={pendingChipClass}>
            Próximo ajuste: {contract.adjustment_next_date}
          </span>
        ) : null}
      </div>

      <div className="-mx-2.5 mt-4 flex items-center gap-1 border-t border-grafito/[0.06] pt-3">
        <Link href={`/admin/administraciones/${contract.id}`} className={buttonClass("ghost", "sm")}>
          Ver detalle y pagos
        </Link>
        {canDelete ? (
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({ title: "¿Eliminar esta administración?", confirmLabel: "Eliminar", destructive: true });
              if (ok) startTransition(() => deleteContract(contract.id));
            }}
            className={buttonClass("danger", "sm", "ml-auto")}
          >
            Eliminar
          </button>
        ) : null}
      </div>
    </div>
  );
}
