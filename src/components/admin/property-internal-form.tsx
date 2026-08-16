"use client";

import { useActionState } from "react";
import { upsertPropertyInternal, type PropertyInternalFormState } from "@/app/actions/property-internal";

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
    <div>
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Esta información es privada: nunca se muestra en el sitio público, sin importar el estado de la
        propiedad.
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Propietario">
            <select name="ownerContactId" defaultValue={data?.owner_contact_id ?? ""} className={inputClass}>
              <option value="">Sin asignar</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Asesor responsable">
            <select name="assignedTo" defaultValue={data?.assigned_to ?? ""} className={inputClass}>
              <option value="">Sin asignar</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Comisión (%)">
            <input
              name="commission"
              type="number"
              min={0}
              step="0.1"
              defaultValue={data?.commission ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Precio inicial de publicación">
            <input
              name="initialPrice"
              type="number"
              min={0}
              defaultValue={data?.initial_price ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Ubicación de llaves">
          <input name="keysLocation" defaultValue={data?.keys_location ?? ""} className={inputClass} />
        </Field>

        <Field label="Instrucciones para visitas">
          <textarea
            name="visitInstructions"
            rows={2}
            defaultValue={data?.visit_instructions ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Observaciones internas">
          <textarea name="internalNotes" rows={3} defaultValue={data?.internal_notes ?? ""} className={inputClass} />
        </Field>

        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-600">Guardado.</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar información interna"}
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
