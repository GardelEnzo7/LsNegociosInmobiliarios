"use client";

import { useActionState, useState } from "react";
import { createContract, type ContractFormState } from "@/app/actions/rentals";

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
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Nueva administración
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Nueva administración</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-600">
          Cerrar
        </button>
      </div>

      <form action={formAction} className="mt-4 space-y-5">
        <Field label="Propiedad">
          <select name="propertyId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elegí una propiedad
            </option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title} — {property.neighborhood}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <p className="col-span-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Propietario / cliente
          </p>
          <Field label="Nombre">
            <input name="ownerName" required className={inputClass} />
          </Field>
          <Field label="Teléfono">
            <input name="ownerPhone" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="ownerEmail" type="email" className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <p className="col-span-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Inquilino</p>
          <Field label="Nombre">
            <input name="tenantName" required className={inputClass} />
          </Field>
          <Field label="Teléfono">
            <input name="tenantPhone" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="tenantEmail" type="email" className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <p className="col-span-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Contrato</p>
          <Field label="Fecha de inicio">
            <input name="startDate" type="date" required className={inputClass} />
          </Field>
          <Field label="Fecha de fin (opcional)">
            <input name="endDate" type="date" className={inputClass} />
          </Field>
          <Field label="Monto de alquiler">
            <input name="rentAmount" type="number" min={0} required className={inputClass} />
          </Field>
          <Field label="Moneda">
            <select name="rentCurrency" defaultValue="ARS" className={inputClass}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Expensas (opcional)">
            <input name="expensasAmount" type="number" min={0} className={inputClass} />
          </Field>
        </div>

        <Field label="Notas">
          <textarea name="notes" rows={2} className={inputClass} />
        </Field>

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Crear administración"}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
