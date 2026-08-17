"use client";

import { useActionState, useState } from "react";
import { createContract, type ContractFormState } from "@/app/actions/rentals";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";

type PropertyOption = { id: string; title: string; neighborhood: string };

const initialState: ContractFormState = {};

export function RentalContractForm({ properties }: { properties: PropertyOption[] }) {
  const [state, formAction, pending] = useActionState(createContract, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Nueva administración
      </button>
    );
  }

  return (
    <Panel
      title="Nueva administración"
      action={
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-grafito/45 hover:text-grafito/70">
          Cerrar
        </button>
      }
    >
      <form action={formAction} className="space-y-5">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <p className="col-span-full font-utility text-[10px] font-medium uppercase tracking-[0.08em] text-grafito/45">
            Propietario / cliente
          </p>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <p className="col-span-full font-utility text-[10px] font-medium uppercase tracking-[0.08em] text-grafito/45">
            Inquilino
          </p>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <p className="col-span-full font-utility text-[10px] font-medium uppercase tracking-[0.08em] text-grafito/45">
            Contrato
          </p>
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

        <FormField label="Notas" htmlFor="notes">
          <textarea id="notes" name="notes" rows={2} className={inputClass} />
        </FormField>

        {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Crear administración"}
        </button>
      </form>
    </Panel>
  );
}
