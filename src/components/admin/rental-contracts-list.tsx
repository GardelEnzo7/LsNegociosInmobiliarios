"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteContract, updateContractStatus } from "@/app/actions/rentals";
import { RENTAL_STATUS_LABELS, RENTAL_STATUS_TIERS } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { chipClass, pendingChipClass } from "@/components/admin/ui/chip";
import { inputClass } from "@/components/admin/ui/form-field";
import { IconSearch } from "@/components/site/icons";
import { EXPIRY_WINDOW_DAYS, daysUntil, describeDaysUntil, formatDateAR } from "@/lib/rental-reminders";
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

const FILTERS = [
  { id: "activo", label: "Activas" },
  { id: "finalizado", label: "Finalizadas" },
  { id: "todas", label: "Todas" },
] as const;

export function RentalContractsList({
  contracts,
  today,
  canDelete = true,
}: {
  contracts: Contract[];
  today: string;
  canDelete?: boolean;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("activo");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return contracts.filter((c) => {
      if (filter !== "todas" && c.status !== filter) return false;
      if (!term) return true;
      return [c.properties?.title, c.owner?.full_name, c.tenant?.full_name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [contracts, filter, query]);

  if (contracts.length === 0) {
    return <EmptyState text="Todavía no hay administraciones cargadas." bordered />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filtrar administraciones" className="flex gap-1.5">
          {FILTERS.map((f) => {
            const count = f.id === "todas" ? contracts.length : contracts.filter((c) => c.status === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors duration-150 ease-out",
                  filter === f.id
                    ? "bg-grafito text-blanco-roto"
                    : "bg-blanco-roto text-grafito/65 ring-1 ring-grafito/[0.08] hover:text-grafito",
                )}
              >
                {f.label}
                <span className={cn("text-xs tabular-nums", filter === f.id ? "text-blanco-roto/60" : "text-grafito/40")}>{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Buscar por propiedad, propietario o inquilino</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grafito/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar propiedad o persona…"
            className={cn(inputClass, "pl-9")}
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState text="No hay administraciones que coincidan." bordered />
      ) : (
        <ul className="space-y-3">
          {visible.map((contract) => (
            <li key={contract.id}>
              <ContractCard contract={contract} today={today} canDelete={canDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContractCard({ contract, today, canDelete }: { contract: Contract; today: string; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const active = contract.status === "activo";
  const daysToEnd = contract.end_date ? daysUntil(contract.end_date, today) : null;
  const daysToAdjustment = contract.adjustment_next_date ? daysUntil(contract.adjustment_next_date, today) : null;

  return (
    <div
      className={cn(
        "rounded-2xl bg-blanco-roto p-5 ring-1 ring-grafito/[0.07] transition-[opacity,box-shadow] duration-150 hover:shadow-[0_6px_20px_-12px_rgba(28,33,41,0.25)] sm:p-6",
        isPending && "opacity-50",
        !active && "bg-blanco-roto/70",
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
            Propietario: {contract.owner?.full_name ?? "—"} · Inquilino: {contract.tenant?.full_name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-grafito/50">
            {formatDateAR(contract.start_date)} → {contract.end_date ? formatDateAR(contract.end_date) : "sin fecha de fin"}
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
        {active && contract.adjustment_next_date && daysToAdjustment !== null ? (
          <span className={daysToAdjustment <= 15 ? pendingChipClass : chipClass}>
            Ajuste: {formatDateAR(contract.adjustment_next_date)}
            {daysToAdjustment <= 15 ? ` (${describeDaysUntil(daysToAdjustment).toLowerCase()})` : ""}
          </span>
        ) : null}
        {active && daysToEnd !== null && daysToEnd <= EXPIRY_WINDOW_DAYS ? (
          <span className="rounded-md bg-terracota/[0.1] px-2 py-1 text-xs text-terracota">
            {daysToEnd < 0 ? "Contrato vencido" : `Vence ${describeDaysUntil(daysToEnd).toLowerCase()}`}
          </span>
        ) : null}
      </div>

      <div className="-mx-2.5 mt-4 flex items-center gap-1 border-t border-grafito/[0.06] pt-3">
        <Link href={`/admin/administraciones/${contract.id}`} className={buttonClass("ghost", "sm")}>
          Ver ficha, pagos y ajustes
        </Link>
        {canDelete ? (
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "¿Eliminar esta administración?",
                description: "Se borran también sus pagos y ajustes. Si el contrato terminó, mejor marcalo como Finalizado.",
                confirmLabel: "Eliminar",
                destructive: true,
              });
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
