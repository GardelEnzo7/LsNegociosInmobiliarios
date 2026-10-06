"use client";

import { useActionState, useTransition } from "react";
import { addPayment, deletePayment, togglePaymentPaid, type PaymentFormState } from "@/app/actions/rentals";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { FormField, SelectShell, checkboxClass, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";
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
    <div className="space-y-4">
      <Panel title="Registrar pago">
        <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end">
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
          <label htmlFor="paid" className="flex h-10 cursor-pointer items-center gap-2.5 text-sm text-grafito/75">
            <input id="paid" name="paid" type="checkbox" className={checkboxClass} />
            Pagado
          </label>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending ? "Guardando…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-3 text-sm text-terracota">{state.error}</p> : null}
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
    <Panel padded={false} className="overflow-hidden">
      <TableShell minWidth={520}>
        <thead className={theadClass}>
          <tr>
            <th className={thClass}>Tipo</th>
            <th className={thClass}>Período</th>
            <th className={thClass}>Monto</th>
            <th className={thClass}>Estado</th>
            <th className={thClass}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className={tbodyClass}>
          {payments.map((payment) => (
            <PaymentRow key={payment.id} contractId={contractId} payment={payment} />
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function PaymentRow({ contractId, payment }: { contractId: string; payment: Payment }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <tr className={cn(trClass, "transition-opacity duration-150", isPending && "opacity-50")}>
      <Td>{TYPE_LABELS[payment.payment_type] ?? payment.payment_type}</Td>
      <Td className="tabular-nums">{payment.period}</Td>
      <Td className="tabular-nums">{payment.amount ?? "—"}</Td>
      <Td>
        <button
          type="button"
          onClick={() =>
            startTransition(() => togglePaymentPaid(payment.id, contractId, !payment.paid))
          }
          aria-label={`${payment.paid ? "Pagado" : "Pendiente"}. Marcar como ${payment.paid ? "pendiente" : "pagado"}`}
          className="rounded-full"
        >
          <StatusBadge
            tier={payment.paid ? "won" : "pending"}
            label={payment.paid ? `Pagado${payment.paid_at ? ` · ${payment.paid_at}` : ""}` : "Pendiente"}
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
