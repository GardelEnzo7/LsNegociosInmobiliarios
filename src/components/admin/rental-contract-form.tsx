"use client";

import { useActionState, useState } from "react";
import { createContract, type ContractFormState } from "@/app/actions/rentals";
import { Panel } from "@/components/admin/ui/panel";
import { buttonClass } from "@/components/admin/ui/button";
import { IconPlus } from "@/components/admin/ui/icons";
import {
  FieldGroupLabel,
  FormField,
  SelectShell,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/ui/form-field";
import { ADJUSTMENT_FREQUENCY_OPTIONS, ADJUSTMENT_TYPE_LABELS } from "@/lib/admin/constants";

type PropertyOption = { id: string; title: string; neighborhood: string };

const initialState: ContractFormState = {};

export function RentalContractForm({ properties }: { properties: PropertyOption[] }) {
  const [state, formAction, pending] = useActionState(createContract, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary")}>
        <IconPlus className="h-4 w-4" />
        Nueva administración
      </button>
    );
  }

  return (
    <Panel
      title="Nueva administración"
      action={
        <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
          Cerrar
        </button>
      }
    >
      <form action={formAction} className="space-y-7">
        <FormField label="Propiedad" htmlFor="propertyId">
          <SelectShell>
            <select id="propertyId" name="propertyId" required defaultValue="" className={selectClass}>
              <option value="" disabled>
                Elegí una propiedad
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} — {property.neighborhood}
                </option>
              ))}
            </select>
          </SelectShell>
        </FormField>

        <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 sm:grid-cols-3">
          <FieldGroupLabel>Propietario / cliente</FieldGroupLabel>
          <FormField label="Nombre" htmlFor="ownerName">
            <input id="ownerName" name="ownerName" required className={inputClass} />
          </FormField>
          <FormField label="Teléfono" htmlFor="ownerPhone">
            <input id="ownerPhone" name="ownerPhone" className={inputClass} />
          </FormField>
          <FormField label="Email" htmlFor="ownerEmail">
            <input id="ownerEmail" name="ownerEmail" type="email" className={inputClass} />
          </FormField>
        </div>

        <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 sm:grid-cols-3">
          <FieldGroupLabel>Inquilino</FieldGroupLabel>
          <FormField label="Nombre" htmlFor="tenantName">
            <input id="tenantName" name="tenantName" required className={inputClass} />
          </FormField>
          <FormField label="Teléfono" htmlFor="tenantPhone">
            <input id="tenantPhone" name="tenantPhone" className={inputClass} />
          </FormField>
          <FormField label="Email" htmlFor="tenantEmail">
            <input id="tenantEmail" name="tenantEmail" type="email" className={inputClass} />
          </FormField>
        </div>

        <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 sm:grid-cols-2">
          <FieldGroupLabel>Contrato</FieldGroupLabel>
          <FormField label="Fecha de inicio" htmlFor="startDate">
            <input id="startDate" name="startDate" type="date" required className={inputClass} />
          </FormField>
          <FormField label="Fecha de fin (opcional)" htmlFor="endDate">
            <input id="endDate" name="endDate" type="date" className={inputClass} />
          </FormField>
          <FormField label="Monto de alquiler" htmlFor="rentAmount">
            <input id="rentAmount" name="rentAmount" type="number" min={0} required className={inputClass} />
          </FormField>
          <FormField label="Moneda" htmlFor="rentCurrency">
            <SelectShell>
              <select id="rentCurrency" name="rentCurrency" defaultValue="ARS" className={selectClass}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Expensas (opcional)" htmlFor="expensasAmount">
            <input id="expensasAmount" name="expensasAmount" type="number" min={0} className={inputClass} />
          </FormField>
        </div>

        <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 sm:grid-cols-2">
          <FieldGroupLabel>Ajuste de alquiler (opcional)</FieldGroupLabel>
          <FormField label="Tipo de ajuste" htmlFor="adjustmentType">
            <SelectShell>
              <select id="adjustmentType" name="adjustmentType" defaultValue="" className={selectClass}>
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
              <select id="adjustmentFrequencyMonths" name="adjustmentFrequencyMonths" defaultValue="" className={selectClass}>
                <option value="">Sin definir</option>
                {ADJUSTMENT_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
        </div>

        <div className="border-t border-grafito/[0.06] pt-6">
          <FormField label="Notas" htmlFor="notes">
            <textarea id="notes" name="notes" rows={2} className={textareaClass} />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="status" className="text-sm text-terracota">
            {state.error ? <p>{state.error}</p> : null}
          </div>
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending ? "Guardando…" : "Crear administración"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
