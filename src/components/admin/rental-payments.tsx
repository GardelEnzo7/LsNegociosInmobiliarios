"use client";

import { useActionState, useTransition } from "react";
import { addPayment, deletePayment, togglePaymentPaid, type PaymentFormState } from "@/app/actions/rentals";
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
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Registrar pago</h2>
        <form action={formAction} className="mt-3 grid gap-3 sm:grid-cols-5 sm:items-end">
          <input type="hidden" name="contractId" value={contractId} />
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Tipo</label>
            <select name="paymentType" defaultValue="alquiler" className={inputClass}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Período</label>
            <input name="period" placeholder="2026-08" required className={inputClass} />
          </div>
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Monto</label>
            <input name="amount" type="number" min={0} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pb-2.5 sm:col-span-1">
            <input id="paid" name="paid" type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
            <label htmlFor="paid" className="text-sm text-zinc-600">
              Pagado
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60 sm:col-span-1"
          >
            {pending ? "Guardando…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
      </div>

      <PaymentsTable contractId={contractId} payments={payments} />
    </div>
  );
}

function PaymentsTable({ contractId, payments }: { contractId: string; payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">Todavía no hay pagos registrados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-2.5">Tipo</th>
            <th className="px-4 py-2.5">Período</th>
            <th className="px-4 py-2.5">Monto</th>
            <th className="px-4 py-2.5">Estado</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} contractId={contractId} payment={payment} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentRow({ contractId, payment }: { contractId: string; payment: Payment }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className={cn("transition-opacity duration-150", isPending && "opacity-50")}>
      <td className="px-4 py-2.5 text-zinc-700">{TYPE_LABELS[payment.payment_type] ?? payment.payment_type}</td>
      <td className="px-4 py-2.5 text-zinc-700">{payment.period}</td>
      <td className="px-4 py-2.5 text-zinc-700">{payment.amount ?? "—"}</td>
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={() =>
            startTransition(() => togglePaymentPaid(payment.id, contractId, !payment.paid))
          }
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            payment.paid ? "bg-petroleo/10 text-petroleo" : "bg-amber-50 text-amber-700",
          )}
        >
          {payment.paid ? `Pagado${payment.paid_at ? ` · ${payment.paid_at}` : ""}` : "Pendiente"}
        </button>
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Eliminar este pago?")) {
              startTransition(() => deletePayment(payment.id, contractId));
            }
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo";
