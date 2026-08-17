"use client";

import { useActionState } from "react";
import { upsertPropertyInternal, type PropertyInternalFormState } from "@/app/actions/property-internal";
import { Panel } from "@/components/admin/ui/panel";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";

type ContactOption = { id: string; full_name: string };
type AdminOption = { id: string; full_name: string };

type PropertyInternal = {
  owner_contact_id: string | null;
  assigned_to: string | null;
  internal_notes: string | null;
  commission: number | null;
  keys_location: string | null;
  visit_instructions: string | null;
  initial_price: number | null;
} | null;

const initialState: PropertyInternalFormState = {};

export function PropertyInternalForm({
  propertyId,
  data,
  contacts,
  admins,
}: {
  propertyId: string;
  data: PropertyInternal;
  contacts: ContactOption[];
  admins: AdminOption[];
}) {
  const action = upsertPropertyInternal.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Panel>
      <div className="rounded-lg bg-bronce/[0.12] px-4 py-3 text-xs text-bronce">
        Esta información es privada: nunca se muestra en el sitio público, sin importar el estado de la
        propiedad.
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Propietario" htmlFor="ownerContactId">
            <SelectShell>
              <select id="ownerContactId" name="ownerContactId" defaultValue={data?.owner_contact_id ?? ""} className={selectClass}>
                <option value="">Sin asignar</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Asesor responsable" htmlFor="assignedTo">
            <SelectShell>
              <select id="assignedTo" name="assignedTo" defaultValue={data?.assigned_to ?? ""} className={selectClass}>
                <option value="">Sin asignar</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
              </select>
            </SelectShell>
          </FormField>
          <FormField label="Comisión (%)" htmlFor="commission">
            <input
              id="commission"
              name="commission"
              type="number"
              min={0}
              step="0.1"
              defaultValue={data?.commission ?? ""}
              className={inputClass}
            />
          </FormField>
          <FormField label="Precio inicial de publicación" htmlFor="initialPrice">
            <input
              id="initialPrice"
              name="initialPrice"
              type="number"
              min={0}
              defaultValue={data?.initial_price ?? ""}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Ubicación de llaves" htmlFor="keysLocation">
          <input id="keysLocation" name="keysLocation" defaultValue={data?.keys_location ?? ""} className={inputClass} />
        </FormField>

        <FormField label="Instrucciones para visitas" htmlFor="visitInstructions">
          <textarea
            id="visitInstructions"
            name="visitInstructions"
            rows={2}
            defaultValue={data?.visit_instructions ?? ""}
            className={inputClass}
          />
        </FormField>

        <FormField label="Observaciones internas" htmlFor="internalNotes">
          <textarea id="internalNotes" name="internalNotes" rows={3} defaultValue={data?.internal_notes ?? ""} className={inputClass} />
        </FormField>

        {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-petroleo">Guardado.</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar información interna"}
        </button>
      </form>
    </Panel>
  );
}
