"use client";

import { useActionState, useTransition } from "react";
import {
  deletePropertyDocument,
  getDocumentSignedUrl,
  uploadPropertyDocument,
  type DocumentFormState,
} from "@/app/actions/property-documents";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";

const DOC_TYPE_LABELS: Record<string, string> = {
  escritura: "Escritura",
  planos: "Planos",
  contrato: "Contrato",
  autorizacion: "Autorización",
  impuestos: "Impuestos",
  otro: "Otro",
};

type Document = {
  id: string;
  doc_type: string;
  file_path: string;
  notes: string | null;
  created_at: string;
  uploaded_by_profile: { full_name: string } | null;
};

const initialState: DocumentFormState = {};

export function PropertyDocumentsPanel({
  propertyId,
  documents,
  canDelete,
}: {
  propertyId: string;
  documents: Document[];
  canDelete: boolean;
}) {
  const action = uploadPropertyDocument.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <Panel>
      <div className="rounded-lg bg-bronce/[0.12] px-4 py-3 text-xs text-bronce">
        Los documentos se guardan en almacenamiento privado. Nunca quedan accesibles por una URL pública
        permanente — se generan enlaces temporales solo para el staff logueado.
      </div>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-grafito/10 p-4">
        <FormField label="Tipo" htmlFor="docType">
          <SelectShell>
            <select id="docType" name="docType" defaultValue="otro" className={selectClass}>
              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </SelectShell>
        </FormField>
        <FormField label="Archivo" htmlFor="file">
          <input
            id="file"
            type="file"
            name="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            required
            className="block text-sm"
          />
        </FormField>
        <div className="min-w-[160px] flex-1">
          <FormField label="Notas" htmlFor="notes">
            <input id="notes" name="notes" className={inputClass} />
          </FormField>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Subir documento"}
        </button>
      </form>
      {state.error ? <p className="mt-2 text-sm text-terracota">{state.error}</p> : null}

      {documents.length === 0 ? (
        <EmptyState text="Todavía no se cargaron documentos." className="mt-4" />
      ) : (
        <ul className="mt-4 divide-y divide-grafito/[0.06] rounded-xl border border-grafito/10 bg-blanco-roto">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-grafito/80">
                  {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                </p>
                <p className="truncate text-xs text-grafito/50">
                  {doc.notes || doc.file_path.split("/").pop()}
                  {doc.uploaded_by_profile ? ` · ${doc.uploaded_by_profile.full_name}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const url = await getDocumentSignedUrl(doc.file_path);
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    })
                  }
                  className="text-xs font-medium text-petroleo hover:underline"
                >
                  Ver
                </button>
                {canDelete ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={async () => {
                      const ok = await confirm({ title: "¿Eliminar este documento?", confirmLabel: "Eliminar", destructive: true });
                      if (ok) startTransition(() => void deletePropertyDocument(doc.id, propertyId, doc.file_path));
                    }}
                    className="text-xs font-medium text-terracota hover:underline"
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
