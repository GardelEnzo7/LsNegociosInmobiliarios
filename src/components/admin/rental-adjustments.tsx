"use client";

import { useActionState } from "react";
import {
  registerAdjustment,
  updateAdjustmentSettings,
  type AdjustmentFormState,
  type AdjustmentSettingsFormState,
} from "@/app/actions/rentals";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { ADJUSTMENT_FREQUENCY_OPTIONS, ADJUSTMENT_TYPE_LABELS } from "@/lib/admin/constants";
import { formatPrice } from "@/lib/utils";

type Adjustment = {
  id: string;
  effective_date: string;
  adjustment_type: string | null;
  previous_amount: number;
  percentage: number | null;
  new_amount: number;
  notes: string | null;
};

type ContractAdjustmentInfo = {
  id: string;
  rent_amount: number;
  rent_currency: string;
  adjustment_type: string | null;
  adjustment_frequency_months: number | null;
  adjustment_next_date: string | null;
};

const settingsInitialState: AdjustmentSettingsFormState = {};
const adjustmentInitialState: AdjustmentFormState = {};

export function RentalAdjustments({
  contract,
  adjustments,
}: {
  contract: ContractAdjustmentInfo;
  adjustments: Adjustment[];
}) {
  const [settingsState, settingsAction, settingsPending] = useActionState(
    updateAdjustmentSettings,
    settingsInitialState,
  );
  const [formState, formAction, pending] = useActionState(registerAdjustment, adjustmentInitialState);

  return (
    <div className="space-y-6">
      <Panel title="Configuración de ajuste">
        <form action={settingsAction} className="grid gap-4 sm:grid-cols-3 sm:items-end">
          <input type="hidden" name="contractId" value={contract.id} />
          <FormField label="Tipo de ajuste" htmlFor="adjustmentType">
            <SelectShell>
              <select
                id="adjustmentType"
                name="adjustmentType"
                defaultValue={contract.adjustment_type ?? ""}
                className={selectClass}
              >
                <option value="">Sin definir</option>
                {Object.entries(ADJUSTMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Periodicidad" htmlFor="adjustmentFrequencyMonths">
            <SelectShell>
              <select
                id="adjustmentFrequencyMonths"
                name="adjustmentFrequencyMonths"
                defaultValue={contract.adjustment_frequency_months ?? ""}
                className={selectClass}
              >
                <option value="">Sin definir</option>
                {ADJUSTMENT_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <button
            type="submit"
            disabled={settingsPending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
          >
            {settingsPending ? "Guardando…" : "Guardar configuración"}
          </button>
        </form>
        {settingsState.error ? <p className="mt-2 text-sm text-terracota">{settingsState.error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-piedra/30 px-4 py-3 text-sm">
          <div>
            <p className="text-xs text-grafito/45">Valor actual</p>
            <p className="mt-0.5 font-medium text-grafito">
              {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
            </p>
          </div>
          <div>
            <p className="text-xs text-grafito/45">Próximo ajuste</p>
            <p className="mt-0.5 font-medium text-grafito">{contract.adjustment_next_date ?? "Sin definir"}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Registrar ajuste">
        <form action={formAction} className="grid gap-3 sm:grid-cols-5 sm:items-end">
          <input type="hidden" name="contractId" value={contract.id} />
          <FormField label="Fecha" htmlFor="effectiveDate">
            <input id="effectiveDate" name="effectiveDate" type="date" required className={inputClass} />
          </FormField>
          <FormField label="% / índice aplicado" htmlFor="percentage">
            <input id="percentage" name="percentage" type="number" step="0.01" className={inputClass} />
          </FormField>
          <FormField label="Nuevo valor" htmlFor="newAmount">
            <input id="newAmount" name="newAmount" type="number" min={0} required className={inputClass} />
          </FormField>
          <FormField label="Notas" htmlFor="adjNotes">
            <input id="adjNotes" name="notes" className={inputClass} />
          </FormField>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Registrar"}
          </button>
        </form>
        {formState.error ? <p className="mt-2 text-sm text-terracota">{formState.error}</p> : null}
      </Panel>

      <AdjustmentsTable adjustments={adjustments} currency={contract.rent_currency} />
    </div>
  );
}

function AdjustmentsTable({ adjustments, currency }: { adjustments: Adjustment[]; currency: string }) {
  if (adjustments.length === 0) {
    return <EmptyState text="Todavía no se registraron ajustes." bordered />;
  }

  return (
    <Panel padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-grafito/10 bg-piedra/30 text-left text-xs font-medium uppercase tracking-wide text-grafito/50">
            <tr>
              <th className="px-4 py-2.5">Fecha</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Valor anterior</th>
              <th className="px-4 py-2.5">%</th>
              <th className="px-4 py-2.5">Nuevo valor</th>
              <th className="px-4 py-2.5">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grafito/[0.06]">
            {adjustments.map((adj) => (
              <AdjustmentRow key={adj.id} adjustment={adj} currency={currency} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AdjustmentRow({
  adjustment,
  currency,
}: {
  adjustment: Adjustment;
  currency: string;
}) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-grafito/70">{adjustment.effective_date}</td>
      <td className="px-4 py-2.5 text-grafito/70">
        {adjustment.adjustment_type
          ? ADJUSTMENT_TYPE_LABELS[adjustment.adjustment_type] ?? adjustment.adjustment_type
          : "—"}
      </td>
      <td className="px-4 py-2.5 text-grafito/70">
        {formatPrice(adjustment.previous_amount, currency as "USD" | "ARS")}
      </td>
      <td className="px-4 py-2.5 text-grafito/70">{adjustment.percentage != null ? `${adjustment.percentage}%` : "—"}</td>
      <td className="px-4 py-2.5 font-medium text-grafito">
        {formatPrice(adjustment.new_amount, currency as "USD" | "ARS")}
      </td>
      <td className="max-w-64 px-4 py-2.5 text-grafito/60">{adjustment.notes || "—"}</td>
    </tr>
  );
}
