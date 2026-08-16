"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteContract, updateContractStatus } from "@/app/actions/rentals";
import { cn, formatPrice } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
};

const STATUS_STYLES: Record<string, string> = {
  activo: "bg-petroleo/10 text-petroleo",
  finalizado: "bg-zinc-100 text-zinc-500",
};

type Contract = {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  rent_currency: string;
  expensas_amount: number | null;
  status: string;
  properties: { id: string; title: string; slug: string } | null;
  owners: { id: string; full_name: string } | null;
  tenants: { id: string; full_name: string } | null;
};

export function RentalContractsList({ contracts }: { contracts: Contract[] }) {
  if (contracts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no hay administraciones cargadas.</p>
      </div>
    );
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

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 transition-opacity duration-150",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/administraciones/${contract.id}`}
            className="font-medium text-zinc-900 hover:text-petroleo"
          >
            {contract.properties?.title ?? "Propiedad eliminada"}
          </Link>
          <p className="mt-0.5 text-xs text-zinc-500">
            Cliente: {contract.owners?.full_name ?? "—"} · Inquilino: {contract.tenants?.full_name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {contract.start_date} → {contract.end_date ?? "en curso"}
          </p>
        </div>
        <select
          defaultValue={contract.status}
          onChange={(event) => startTransition(() => updateContractStatus(contract.id, event.target.value))}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
            STATUS_STYLES[contract.status],
          )}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
          onClick={() => {
            if (confirm("¿Eliminar esta administración?")) {
              startTransition(() => deleteContract(contract.id));
            }
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
