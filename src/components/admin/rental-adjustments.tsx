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
import { buttonClass } from "@/components/admin/ui/button";
import { FormField, SelectShell, inputClass, labelClass, selectClass } from "@/components/admin/ui/form-field";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";
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
    <div className="space-y-4">
      <Panel title="Configuración de ajuste">
        <dl className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-plata px-4 py-3.5 text-sm ring-1 ring-inset ring-grafito/[0.05]">
          <div>
            <dt className={labelClass}>Valor actual</dt>
            <dd className="mt-1 font-medium tabular-nums text-grafito">
              {formatPrice(contract.rent_amount, contract.rent_currency as "USD" | "ARS")}
            </dd>
          </div>
          <div>
            <dt className={labelClass}>Próximo ajuste</dt>
            <dd className="mt-1 font-medium tabular-nums text-grafito">{contract.adjustment_next_date ?? "Sin definir"}</dd>
          </div>
        </dl>

        <form action={settingsAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
          <button type="submit" disabled={settingsPending} className={buttonClass("primary")}>
            {settingsPending ? "Guardando…" : "Guardar configuración"}
          </button>
        </form>
        {settingsState.error ? <p className="mt-3 text-sm text-terracota">{settingsState.error}</p> : null}
      </Panel>

      <Panel title="Registrar ajuste">
        <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr_auto] lg:items-end">
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
          <button type="submit" disabled={pending} className={buttonClass("primary", "md", "sm:col-span-2 lg:col-span-1")}>
            {pending ? "Guardando…" : "Registrar"}
          </button>
        </form>
        {formState.error ? <p className="mt-3 text-sm text-terracota">{formState.error}</p> : null}
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
    <Panel padded={false} className="overflow-hidden">
      <TableShell>
        <thead className={theadClass}>
          <tr>
            <th className={thClass}>Fecha</th>
            <th className={thClass}>Tipo</th>
            <th className={thClass}>Valor anterior</th>
            <th className={thClass}>%</th>
            <th className={thClass}>Nuevo valor</th>
            <th className={thClass}>Notas</th>
          </tr>
        </thead>
        <tbody className={tbodyClass}>
          {adjustments.map((adj) => (
            <AdjustmentRow key={adj.id} adjustment={adj} currency={currency} />
          ))}
        </tbody>
      </TableShell>
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
    <tr className={trClass}>
      <Td className="tabular-nums">{adjustment.effective_date}</Td>
      <Td>
        {adjustment.adjustment_type
          ? ADJUSTMENT_TYPE_LABELS[adjustment.adjustment_type] ?? adjustment.adjustment_type
          : "—"}
      </Td>
      <Td className="tabular-nums">{formatPrice(adjustment.previous_amount, currency as "USD" | "ARS")}</Td>
      <Td className="tabular-nums">{adjustment.percentage != null ? `${adjustment.percentage}%` : "—"}</Td>
      <Td className="font-medium tabular-nums text-grafito">{formatPrice(adjustment.new_amount, currency as "USD" | "ARS")}</Td>
      <Td className="max-w-64 text-grafito/60">{adjustment.notes || "—"}</Td>
    </tr>
  );
}
