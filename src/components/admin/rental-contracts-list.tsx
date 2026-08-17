"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteContract, updateContractStatus } from "@/app/actions/rentals";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TIERS } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
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
  properties: { id: string; title: string; slug: string } | null;
  owner: { id: string; full_name: string } | null;
  tenant: { id: string; full_name: string } | null;
};

export function RentalContractsList({ contracts }: { contracts: Contract[] }) {
  if (contracts.length === 0) {
    return <EmptyState text="Todavía no hay administraciones cargadas." bordered />;
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract) => (
        <ContractCard key={contract.id} contract={contract} />
      ))}
    </div>
  );
}

function ContractCard({ contract }: { contract: Contract }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <div
      className={cn(
        "rounded-xl border border-grafito/10 bg-blanco-roto p-5 transition-opacity duration-150",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/administraciones/${contract.id}`}
            className="font-medium text-grafito hover:text-petroleo"
          >
            {contract.properties?.title ?? "Propiedad eliminada"}
          </Link>
          <p className="mt-0.5 text-xs text-grafito/50">
            Cliente: {contract.owner?.full_name ?? "—"} · Inquilino: {contract.tenant?.full_name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-grafito/40">
            {contract.start_date} → {contract.end_date ?? "en curso"}
          </p>
        </div>
        <StatusSelect
          value={contract.status}
          tier={RENTAL_STATUS_TIERS[contract.status]}
          options={RENTAL_STATUS_OPTIONS}
          disabled={isPending}
          onChange={(value) => startTransition(() => updateContractStatus(contract.id, value))}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-grafito">
        <span className="rounded-full bg-piedra/50 px-2.5 py-1">
          Alquiler: {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
        </span>
        {contract.expensas_amount ? (
          <span className="rounded-full bg-piedra/50 px-2.5 py-1">
            Expensas: {formatPrice(contract.expensas_amount, "ARS")}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Link
          href={`/admin/administraciones/${contract.id}`}
          className="text-xs font-medium text-petroleo hover:underline"
        >
          Ver detalle y pagos
        </Link>
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: "¿Eliminar esta administración?", confirmLabel: "Eliminar", destructive: true });
            if (ok) startTransition(() => deleteContract(contract.id));
          }}
          className="text-xs font-medium text-terracota hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
