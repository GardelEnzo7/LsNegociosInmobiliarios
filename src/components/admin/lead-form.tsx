"use client";

import { useActionState, useState } from "react";
import { createLead, type LeadFormState } from "@/app/actions/leads";

type PropertyOption = { id: string; title: string; neighborhood: string };

const initialState: LeadFormState = {};

export function LeadForm({ properties }: { properties: PropertyOption[] }) {
  const [state, formAction, pending] = useActionState(createLead, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Nuevo cliente
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Nuevo cliente</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-600">
          Cerrar
        </button>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Origen">
            <select name="source" defaultValue="web" className={inputClass}>
              <option value="web">Sitio web</option>
              <option value="telefono">Teléfono</option>
              <option value="recomendacion">Recomendación</option>
              <option value="otro">Otro</option>
            </select>
          </Field>
          <Field label="Teléfono">
            <input name="contactPhone" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="contactEmail" type="email" className={inputClass} />
          </Field>
        </div>

        <Field label="Notas">
          <textarea name="notes" rows={2} className={inputClass} />
        </Field>

        {properties.length > 0 ? (
          <Field label="Propiedades de interés">
            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-zinc-200 p-3">
              {properties.map((property) => (
                <label key={property.id} className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    name="propertyIds"
                    value={property.id}
                    className="h-4 w-4 rounded border-zinc-300 text-petroleo focus:ring-petroleo"
                  />
                  {property.title}
                </label>
              ))}
            </div>
          </Field>
        ) : null}

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Crear cliente"}
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
