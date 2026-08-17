"use client";

import { useActionState, useState } from "react";
import { createVisit, type VisitFormState } from "@/app/actions/visits";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";

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
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Programar visita
      </button>
    );
  }

  return (
    <Panel
      title="Nueva visita"
      action={
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-grafito/45 hover:text-grafito/70">
          Cerrar
        </button>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Propiedad" htmlFor="propertyId">
            <SelectShell>
              <select id="propertyId" name="propertyId" required defaultValue="" className={selectClass}>
                <option value="">Elegí una propiedad…</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Cliente" htmlFor="contactId">
            <SelectShell>
              <select id="contactId" name="contactId" required defaultValue="" className={selectClass}>
                <option value="">Elegí un cliente…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Fecha y hora" htmlFor="scheduledAt">
            <input id="scheduledAt" type="datetime-local" name="scheduledAt" required className={inputClass} />
          </FormField>
          <FormField label="Asesor" htmlFor="assignedTo">
            <SelectShell>
              <select id="assignedTo" name="assignedTo" defaultValue="" className={selectClass}>
                <option value="">Sin asignar</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
        </div>

        <FormField label="Observaciones" htmlFor="notes">
          <textarea id="notes" name="notes" rows={2} className={inputClass} />
        </FormField>

        {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Programar visita"}
        </button>
      </form>
    </Panel>
  );
}
