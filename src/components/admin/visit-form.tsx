"use client";

import { useActionState, useState } from "react";
import { createVisit, type VisitFormState } from "@/app/actions/visits";

type PropertyOption = { id: string; title: string };
type ContactOption = { id: string; full_name: string };
type AdminOption = { id: string; full_name: string };

const initialState: VisitFormState = {};

export function VisitForm({
  properties,
  contacts,
  admins,
}: {
  properties: PropertyOption[];
  contacts: ContactOption[];
  admins: AdminOption[];
}) {
  const [state, formAction, pending] = useActionState(createVisit, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Programar visita
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Nueva visita</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-600">
          Cerrar
        </button>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Propiedad">
            <select name="propertyId" required className={inputClass}>
              <option value="">Elegí una propiedad…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cliente">
            <select name="contactId" required className={inputClass}>
              <option value="">Elegí un cliente…</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha y hora">
            <input type="datetime-local" name="scheduledAt" required className={inputClass} />
          </Field>
          <Field label="Asesor">
            <select name="assignedTo" className={inputClass}>
              <option value="">Sin asignar</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Observaciones">
          <textarea name="notes" rows={2} className={inputClass} />
        </Field>

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Programar visita"}
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
