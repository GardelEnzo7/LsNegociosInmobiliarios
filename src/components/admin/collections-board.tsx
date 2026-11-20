"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { generateMonthlyRents, togglePaymentPaid } from "@/app/actions/rentals";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { IconCheck, IconWhatsapp } from "@/components/site/icons";
import { PAYMENT_TYPE_LABELS } from "@/lib/admin/constants";
import { whatsappHref } from "@/lib/admin/contact-links";
import type { CollectionRow, DebtRow } from "@/lib/data/admin";
import { formatDateAR, formatPeriod } from "@/lib/rental-reminders";
import { cn, formatPrice } from "@/lib/utils";

const money = (amount: number | null, currency: string) =>
  amount == null ? "—" : formatPrice(amount, currency as "USD" | "ARS");

function totals(rows: { amount: number; currency: string }[]) {
  const byCurrency = new Map<string, number>();
  for (const row of rows) byCurrency.set(row.currency, (byCurrency.get(row.currency) ?? 0) + row.amount);
  return Array.from(byCurrency.entries()).map(([currency, amount]) => money(amount, currency));
}

export function CollectionsBoard({ period, rows, debts }: { period: string; rows: CollectionRow[]; debts: DebtRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const paid = rows.filter((r) => r.rent?.paid);
  const pending = rows.filter((r) => r.rent && !r.rent.paid);
  const missing = rows.filter((r) => !r.rent);
  const amountOf = (r: CollectionRow) => ({ amount: r.rent?.amount ?? r.rentAmount, currency: r.rentCurrency });

  if (rows.length === 0 && debts.length === 0) {
    return <EmptyState bordered text="No hay contratos activos para este mes." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard tone="won" label="Cobrado" count={paid.length} amounts={totals(paid.map(amountOf))} />
        <SummaryCard tone="pending" label="Pendiente de cobro" count={pending.length} amounts={totals(pending.map(amountOf))} />
        <SummaryCard tone="neutral" label="Sin registrar" count={missing.length} amounts={totals(missing.map(amountOf))} />
      </div>

      {missing.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-petroleo/[0.06] px-5 py-4 ring-1 ring-inset ring-petroleo/15 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-grafito/75">
            {missing.length === 1 ? "1 contrato todavía no tiene" : `${missing.length} contratos todavía no tienen`} el
            alquiler de {formatPeriod(period).toLowerCase()} cargado. Generalo de una vez con el monto vigente de cada contrato.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await generateMonthlyRents(period);
                setNotice(result.error ?? `Listo: se cargaron ${result.created} alquileres como pendientes.`);
              })
            }
            className={buttonClass("primary", "md", "shrink-0")}
          >
            Cargar alquileres del mes
          </button>
        </div>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-petroleo">
          {notice}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <Panel padded={false} className="overflow-hidden">
          <ul className="divide-y divide-grafito/[0.06]">
            {rows.map((row) => (
              <CollectionItem key={row.contractId} row={row} period={period} />
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel
        title="Deudas de meses anteriores"
        description="Cargos registrados como pendientes en meses ya cerrados."
      >
        {debts.length === 0 ? (
          <EmptyState className="py-4" text="No hay deudas anteriores." />
        ) : (
          <ul className="-mx-2 divide-y divide-grafito/[0.06]">
            {debts.map((debt) => (
              <DebtItem key={debt.id} debt={debt} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function SummaryCard({
  tone,
  label,
  count,
  amounts,
}: {
  tone: "won" | "pending" | "neutral";
  label: string;
  count: number;
  amounts: string[];
}) {
  return (
    <div className="rounded-2xl bg-blanco-roto p-5 ring-1 ring-grafito/[0.07]">
      <p className="flex items-center gap-2 text-xs text-grafito/55">
        <span
          aria-hidden="true"
          className={cn(
            "h-2 w-2 rounded-full",
            tone === "won" && "bg-petroleo",
            tone === "pending" && "bg-bronce",
            tone === "neutral" && "bg-grafito/25",
          )}
        />
        {label}
      </p>
      <p className="mt-3 font-display text-[26px] leading-none tabular-nums text-grafito" style={{ fontWeight: 460 }}>
        {count}
      </p>
      <p className="mt-2 text-xs tabular-nums text-grafito/55">{amounts.length > 0 ? amounts.join(" + ") : "—"}</p>
    </div>
  );
}

function CollectionItem({ row, period }: { row: CollectionRow; period: string }) {
  const [isPending, startTransition] = useTransition();
  const reminder = whatsappHref(
    row.tenantPhone,
    `Hola ${row.tenantName?.split(" ")[0] ?? ""}, te recuerdo el alquiler de ${formatPeriod(period).toLowerCase()} de ${row.propertyTitle}. ¡Gracias!`,
  );
  const amount = money(row.rent?.amount ?? row.rentAmount, row.rentCurrency);

  return (
    <li className={cn("flex flex-col gap-4 px-5 py-4 transition-opacity duration-150 sm:flex-row sm:items-center sm:px-6", isPending && "opacity-50")}>
      <div className="min-w-0 flex-1">
        <Link
          href={`/admin/administraciones/${row.contractId}`}
          className="block truncate text-sm font-medium text-grafito transition-colors duration-150 hover:text-petroleo"
        >
          {row.propertyTitle}
        </Link>
        <p className="mt-0.5 text-xs text-grafito/55">
          {row.tenantName ? `Inquilino: ${row.tenantName}` : "Sin inquilino cargado"}
          {row.extras.length > 0
            ? ` · ${row.extras.map((e) => `${PAYMENT_TYPE_LABELS[e.payment_type] ?? e.payment_type}${e.paid ? " ✓" : " pendiente"}`).join(", ")}`
            : ""}
        </p>
      </div>

      <p className="text-sm tabular-nums text-grafito sm:w-32 sm:text-right">{amount}</p>

      <div className="flex flex-wrap items-center gap-2 sm:w-[300px] sm:justify-end">
        {row.rent?.paid ? (
          <>
            <StatusBadge tier="won" label={row.rent.paid_at ? `Cobrado ${formatDateAR(row.rent.paid_at)}` : "Cobrado"} />
            <button
              type="button"
              onClick={() => startTransition(() => togglePaymentPaid(row.rent!.id, row.contractId, false))}
              className={buttonClass("ghost", "sm")}
            >
              Deshacer
            </button>
          </>
        ) : (
          <>
            {row.rent ? <StatusBadge tier="pending" label="Pendiente" /> : <StatusBadge tier="neutral" label="Sin registrar" />}
            {reminder ? (
              <a
                href={reminder}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Recordarle el pago a ${row.tenantName ?? "el inquilino"} por WhatsApp`}
                title="Recordar por WhatsApp"
                className={buttonClass("ghost", "sm")}
              >
                <IconWhatsapp className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  if (row.rent) await togglePaymentPaid(row.rent.id, row.contractId, true);
                  else await generateMonthlyRents(period, row.contractId, true);
                })
              }
              className={buttonClass("secondary", "sm")}
            >
              <IconCheck className="h-3.5 w-3.5" />
              Marcar cobrado
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function DebtItem({ debt }: { debt: DebtRow }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className={cn("flex flex-wrap items-center gap-3 px-2 py-3 transition-opacity duration-150", isPending && "opacity-50")}>
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-terracota" />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/administraciones/${debt.contractId}`} className="block truncate text-sm font-medium text-grafito hover:text-petroleo">
          {debt.propertyTitle}
        </Link>
        <p className="mt-0.5 text-xs text-grafito/55">
          {PAYMENT_TYPE_LABELS[debt.payment_type] ?? debt.payment_type} de {formatPeriod(debt.period).toLowerCase()}
          {debt.tenantName ? ` · ${debt.tenantName}` : ""}
        </p>
      </div>
      <span className="text-sm tabular-nums text-terracota">{money(debt.amount, debt.currency)}</span>
      <button
        type="button"
        onClick={() => startTransition(() => togglePaymentPaid(debt.id, debt.contractId, true))}
        className={buttonClass("secondary", "sm")}
      >
        Marcar cobrado
      </button>
    </li>
  );
}
