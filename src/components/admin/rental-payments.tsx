"use client";

import { useActionState, useState, useTransition } from "react";
import { addPayment, deletePayment, generateMonthlyRents, togglePaymentPaid, type PaymentFormState } from "@/app/actions/rentals";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { FormField, SelectShell, checkboxClass, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { PAYMENT_TYPE_LABELS } from "@/lib/admin/constants";
import { formatDateAR, formatPeriod } from "@/lib/rental-reminders";
import { cn, formatPrice } from "@/lib/utils";

type Payment = {
  id: string;
  payment_type: string;
  period: string;
  amount: number | null;
  paid: boolean;
  paid_at: string | null;
  notes: string | null;
};

const initialState: PaymentFormState = {};

/**
 * Payments of one contract. The period is a month picker (stored as
 * YYYY-MM); rent defaults to the contract's current amount, and the most
 * common action — this month's rent — is one button.
 */
export function RentalPayments({
  contractId,
  payments,
  rentAmount,
  rentCurrency,
  currentPeriod,
  active,
}: {
  contractId: string;
  payments: Payment[];
  rentAmount: number;
  rentCurrency: string;
  currentPeriod: string;
  active: boolean;
}) {
  const [state, formAction, pending] = useActionState(addPayment, initialState);
  const [type, setType] = useState("alquiler");
  const [isGenerating, startTransition] = useTransition();
  const hasCurrentRent = payments.some((p) => p.period === currentPeriod && p.payment_type === "alquiler");

  return (
    <div className="space-y-4">
      {active && !hasCurrentRent ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-petroleo/[0.06] px-5 py-4 ring-1 ring-inset ring-petroleo/15 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-grafito/75">
            Todavía no está cargado el alquiler de <strong className="font-medium">{formatPeriod(currentPeriod).toLowerCase()}</strong>{" "}
            ({formatPrice(rentAmount, rentCurrency as "USD" | "ARS")}).
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => startTransition(async () => void (await generateMonthlyRents(currentPeriod, contractId, false)))}
              className={buttonClass("secondary", "sm")}
            >
              Cargar pendiente
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => startTransition(async () => void (await generateMonthlyRents(currentPeriod, contractId, true)))}
              className={buttonClass("primary", "sm")}
            >
              Ya se cobró
            </button>
          </div>
        </div>
      ) : null}

      <Panel title="Registrar otro pago" description="Expensas, servicios o un alquiler de otro mes.">
        <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end">
          <input type="hidden" name="contractId" value={contractId} />
          <FormField label="Concepto" htmlFor="paymentType">
            <SelectShell>
              <select
                id="paymentType"
                name="paymentType"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className={selectClass}
              >
                {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Mes" htmlFor="period">
            <input id="period" name="period" type="month" required defaultValue={currentPeriod} className={inputClass} />
          </FormField>
          <FormField label={type === "alquiler" ? `Monto (${rentCurrency})` : "Monto (ARS)"} htmlFor="amount">
            <input
              key={type}
              id="amount"
              name="amount"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={type === "alquiler" ? rentAmount : undefined}
              className={inputClass}
            />
          </FormField>
          <label htmlFor="paid" className="flex h-10 cursor-pointer items-center gap-2.5 text-sm text-grafito/75">
            <input id="paid" name="paid" type="checkbox" className={checkboxClass} />
            Ya se cobró
          </label>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending ? "Guardando…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-3 text-sm text-terracota">{state.error}</p> : null}
      </Panel>

      <PaymentsTable contractId={contractId} payments={payments} rentCurrency={rentCurrency} />
    </div>
  );
}

function PaymentsTable({ contractId, payments, rentCurrency }: { contractId: string; payments: Payment[]; rentCurrency: string }) {
  if (payments.length === 0) {
    return <EmptyState text="Todavía no hay pagos registrados." bordered />;
  }

  // Newest month first; YYYY-MM sorts chronologically as text.
  const sorted = [...payments].sort((a, b) => b.period.localeCompare(a.period));

  return (
    <Panel padded={false} className="overflow-hidden">
      <TableShell minWidth={560}>
        <thead className={theadClass}>
          <tr>
            <th className={thClass}>Mes</th>
            <th className={thClass}>Concepto</th>
            <th className={thClass}>Monto</th>
            <th className={thClass}>Estado</th>
            <th className={thClass}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className={tbodyClass}>
          {sorted.map((payment) => (
            <PaymentRow key={payment.id} contractId={contractId} payment={payment} rentCurrency={rentCurrency} />
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function PaymentRow({ contractId, payment, rentCurrency }: { contractId: string; payment: Payment; rentCurrency: string }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const currency = payment.payment_type === "alquiler" ? rentCurrency : "ARS";

  return (
    <tr className={cn(trClass, "transition-opacity duration-150", isPending && "opacity-50")}>
      <Td className="whitespace-nowrap">{formatPeriod(payment.period)}</Td>
      <Td>{PAYMENT_TYPE_LABELS[payment.payment_type] ?? payment.payment_type}</Td>
      <Td className="whitespace-nowrap tabular-nums">
        {payment.amount != null ? formatPrice(payment.amount, currency as "USD" | "ARS") : "—"}
      </Td>
      <Td>
        <button
          type="button"
          onClick={() => startTransition(() => togglePaymentPaid(payment.id, contractId, !payment.paid))}
          aria-label={`${payment.paid ? "Cobrado" : "Pendiente"}. Tocá para marcarlo como ${payment.paid ? "pendiente" : "cobrado"}`}
          title={`Tocá para marcarlo como ${payment.paid ? "pendiente" : "cobrado"}`}
          className="rounded-full"
        >
          <StatusBadge
            tier={payment.paid ? "won" : "pending"}
            label={payment.paid ? `Cobrado${payment.paid_at ? ` · ${formatDateAR(payment.paid_at)}` : ""}` : "Pendiente"}
          />
        </button>
      </Td>
      <Td className="text-right">
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: "¿Eliminar este pago?", confirmLabel: "Eliminar", destructive: true });
            if (ok) startTransition(() => deletePayment(payment.id, contractId));
          }}
          className={buttonClass("danger", "sm", "-mr-2.5")}
        >
          Eliminar
        </button>
      </Td>
    </tr>
  );
}
