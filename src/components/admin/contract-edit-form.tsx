"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { updateContract, type ContractEditState } from "@/app/actions/rentals";
import { Panel } from "@/components/admin/ui/panel";
import { buttonClass } from "@/components/admin/ui/button";
import {
  FieldGroupLabel,
  FormField,
  SelectShell,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/ui/form-field";

type Person = { full_name: string; contact_phone: string | null; contact_email: string | null } | null;

export type EditableContract = {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  rent_currency: string;
  expensas_amount: number | null;
  notes: string | null;
  owner: Person;
  tenant: Person;
};

const initialState: ContractEditState = {};

/** "Editar" on the contract detail: opens an inline panel with the same
 * fields as the creation form, prefilled. */
export function ContractEditForm({ contract, rentLocked }: { contract: EditableContract; rentLocked: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateContract, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  // Close once a save succeeds (the page re-renders with the new data).
  // Adjusted during render — each action result is a new object, so this
  // runs once per successful save.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.saved) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary")}>
        Editar datos
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-grafito-dark/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contract-edit-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl"
      >
        <Panel
          title={<span id="contract-edit-title">Editar administración</span>}
          action={
            <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "sm")}>
              Cancelar
            </button>
          }
        >
          <form action={formAction} className="space-y-7">
            <input type="hidden" name="contractId" value={contract.id} />

            <PersonFields prefix="owner" label="Propietario / cliente" person={contract.owner} />
            <PersonFields prefix="tenant" label="Inquilino" person={contract.tenant} />

            <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 sm:grid-cols-2">
              <FieldGroupLabel>Contrato</FieldGroupLabel>
              <FormField label="Fecha de inicio" htmlFor="edit-startDate">
                <input id="edit-startDate" name="startDate" type="date" required defaultValue={contract.start_date} className={inputClass} />
              </FormField>
              <FormField label="Fecha de fin" htmlFor="edit-endDate">
                <input id="edit-endDate" name="endDate" type="date" defaultValue={contract.end_date ?? ""} className={inputClass} />
              </FormField>
              <FormField label="Monto de alquiler" htmlFor="edit-rentAmount">
                <input
                  id="edit-rentAmount"
                  name="rentAmount"
                  type="number"
                  min={0}
                  defaultValue={contract.rent_amount}
                  disabled={rentLocked}
                  className={inputClass}
                />
                {rentLocked ? (
                  <p className="mt-1.5 text-xs text-grafito/55">
                    Ya tiene ajustes registrados: el monto cambia con “Registrar ajuste”, así el historial queda correcto.
                  </p>
                ) : null}
              </FormField>
              <FormField label="Moneda" htmlFor="edit-rentCurrency">
                <SelectShell>
                  <select id="edit-rentCurrency" name="rentCurrency" defaultValue={contract.rent_currency} className={selectClass}>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </SelectShell>
              </FormField>
              <FormField label="Expensas (opcional)" htmlFor="edit-expensasAmount">
                <input
                  id="edit-expensasAmount"
                  name="expensasAmount"
                  type="number"
                  min={0}
                  defaultValue={contract.expensas_amount ?? ""}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="border-t border-grafito/[0.06] pt-6">
              <FormField label="Notas" htmlFor="edit-notes">
                <textarea id="edit-notes" name="notes" rows={3} defaultValue={contract.notes ?? ""} className={textareaClass} />
              </FormField>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="status" className="text-sm text-terracota">
                {state.error ? <p>{state.error}</p> : null}
              </div>
              <button type="submit" disabled={pending} className={buttonClass("primary")}>
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}

function PersonFields({ prefix, label, person }: { prefix: "owner" | "tenant"; label: string; person: Person }) {
  return (
    <div className="grid gap-x-4 gap-y-5 border-t border-grafito/[0.06] pt-6 first-of-type:border-0 first-of-type:pt-0 sm:grid-cols-3">
      <FieldGroupLabel>{label}</FieldGroupLabel>
      <FormField label="Nombre" htmlFor={`edit-${prefix}Name`}>
        <input id={`edit-${prefix}Name`} name={`${prefix}Name`} required defaultValue={person?.full_name ?? ""} className={inputClass} />
      </FormField>
      <FormField label="Teléfono" htmlFor={`edit-${prefix}Phone`}>
        <input id={`edit-${prefix}Phone`} name={`${prefix}Phone`} type="tel" defaultValue={person?.contact_phone ?? ""} className={inputClass} />
      </FormField>
      <FormField label="Email" htmlFor={`edit-${prefix}Email`}>
        <input id={`edit-${prefix}Email`} name={`${prefix}Email`} type="email" defaultValue={person?.contact_email ?? ""} className={inputClass} />
      </FormField>
    </div>
  );
}
