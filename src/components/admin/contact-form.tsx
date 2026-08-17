"use client";

import { useActionState, useState } from "react";
import { createContact, type ContactFormState } from "@/app/actions/contacts";
import { CONTACT_ROLE_LABELS } from "@/lib/admin/constants";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";

type PropertyOption = { id: string; title: string; neighborhood: string };

const initialState: ContactFormState = {};
const ROLE_VALUES = Object.keys(CONTACT_ROLE_LABELS);

export function ContactForm({ properties }: { properties: PropertyOption[] }) {
  const [state, formAction, pending] = useActionState(createContact, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
      >
        + Nuevo cliente
      </button>
    );
  }

  return (
    <Panel
      title="Nuevo cliente"
      action={
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-grafito/45 hover:text-grafito/70">
          Cerrar
        </button>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="fullName">
            <input id="fullName" name="fullName" required className={inputClass} />
          </FormField>
          <FormField label="Origen" htmlFor="source">
            <SelectShell>
              <select id="source" name="source" defaultValue="web" className={selectClass}>
                <option value="web">Sitio web</option>
                <option value="telefono">Teléfono</option>
                <option value="recomendacion">Recomendación</option>
                <option value="otro">Otro</option>
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Teléfono" htmlFor="contactPhone">
            <input id="contactPhone" name="contactPhone" className={inputClass} />
          </FormField>
          <FormField label="Email" htmlFor="contactEmail">
            <input id="contactEmail" name="contactEmail" type="email" className={inputClass} />
          </FormField>
        </div>

        <FormField label="Rol" htmlFor="roles">
          <div id="roles" className="flex flex-wrap gap-3">
            {ROLE_VALUES.map((role) => (
              <label key={role} className="flex items-center gap-1.5 text-sm text-grafito/70">
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
                />
                {CONTACT_ROLE_LABELS[role]}
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Notas" htmlFor="notes">
          <textarea id="notes" name="notes" rows={2} className={inputClass} />
        </FormField>

        {properties.length > 0 ? (
          <FormField label="Propiedades relacionadas" htmlFor="propertyIds">
            <div id="propertyIds" className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-grafito/10 p-3">
              {properties.map((property) => (
                <label key={property.id} className="flex items-center gap-2 text-sm text-grafito/70">
                  <input
                    type="checkbox"
                    name="propertyIds"
                    value={property.id}
                    className="h-4 w-4 rounded border-grafito/15 text-petroleo focus:ring-petroleo"
                  />
                  {property.title}
                </label>
              ))}
            </div>
          </FormField>
        ) : null}

        {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Crear cliente"}
        </button>
      </form>
    </Panel>
  );
}
