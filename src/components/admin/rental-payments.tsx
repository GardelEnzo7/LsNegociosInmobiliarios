"use client";

import { useActionState, useTransition } from "react";
import { addPayment, deletePayment, togglePaymentPaid, type PaymentFormState } from "@/app/actions/rentals";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  alquiler: "Alquiler",
  expensas: "Expensas",
  luz: "Luz",
  gas: "Gas",
  agua: "Agua",
  otro: "Otro",
};

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

export function RentalPayments({ contractId, payments }: { contractId: string; payments: Payment[] }) {
  const [state, formAction, pending] = useActionState(addPayment, initialState);

  return (
    <div className="space-y-6">
      <Panel title="Registrar pago">
        <form action={formAction} className="grid gap-3 sm:grid-cols-5 sm:items-end">
          <input type="hidden" name="contractId" value={contractId} />
          <FormField label="Tipo" htmlFor="paymentType">
            <SelectShell>
              <select id="paymentType" name="paymentType" defaultValue="alquiler" className={selectClass}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Período" htmlFor="period">
            <input id="period" name="period" placeholder="2026-08" required className={inputClass} />
          </FormField>
          <FormField label="Monto" htmlFor="amount">
            <input id="amount" name="amount" type="number" min={0} className={inputClass} />
          </FormField>
          <div className="flex items-center gap-2 pb-2.5 sm:col-span-1">
            <input id="paid" name="paid" type="checkbox" className="h-4 w-4 rounded border-grafito/15" />
            <label htmlFor="paid" className="text-sm text-grafito/60">
              Pagado
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60 sm:col-span-1"
          >
            {pending ? "Guardando…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-2 text-sm text-terracota">{state.error}</p> : null}
      </Panel>

      <PaymentsTable contractId={contractId} payments={payments} />
    </div>
  );
}

function PaymentsTable({ contractId, payments }: { contractId: string; payments: Payment[] }) {
  if (payments.length === 0) {
    return <EmptyState text="Todavía no hay pagos registrados." bordered />;
  }

  return (
    <Panel padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-grafito/10 bg-piedra/30 text-left text-xs font-medium uppercase tracking-wide text-grafito/50">
            <tr>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Período</th>
              <th className="px-4 py-2.5">Monto</th>
              <th className="px-4 py-2.5">Estado</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grafito/[0.06]">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} contractId={contractId} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PaymentRow({ contractId, payment }: { contractId: string; payment: Payment }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <tr className={cn("transition-opacity duration-150", isPending && "opacity-50")}>
      <td className="px-4 py-2.5 text-grafito/70">{TYPE_LABELS[payment.payment_type] ?? payment.payment_type}</td>
      <td className="px-4 py-2.5 text-grafito/70">{payment.period}</td>
      <td className="px-4 py-2.5 text-grafito/70">{payment.amount ?? "—"}</td>
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={() =>
            startTransition(() => togglePaymentPaid(payment.id, contractId, !payment.paid))
          }
        >
          <StatusBadge
            tier={payment.paid ? "won" : "pending"}
            label={payment.paid ? `Pagado${payment.paid_at ? ` · ${payment.paid_at}` : ""}` : "Pendiente"}
          />
        </button>
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: "¿Eliminar este pago?", confirmLabel: "Eliminar", destructive: true });
            if (ok) startTransition(() => deletePayment(payment.id, contractId));
          }}
          className="text-xs font-medium text-terracota hover:underline"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

