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
import { Notice } from "@/components/admin/ui/notice";
import { buttonClass } from "@/components/admin/ui/button";

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
      <Notice>
        Los documentos se guardan en almacenamiento privado. Nunca quedan accesibles por una URL pública
        permanente — se generan enlaces temporales solo para el staff logueado.
      </Notice>

      <form
        action={formAction}
        className="mt-6 grid gap-4 rounded-xl bg-plata/60 p-4 ring-1 ring-inset ring-grafito/[0.05] sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-end"
      >
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
            className="block h-10 w-full text-sm text-grafito/70 file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border file:border-grafito/12 file:bg-blanco-roto file:px-3.5 file:text-sm file:font-medium file:text-grafito hover:file:bg-plata"
          />
        </FormField>
        <div className="sm:col-span-2 lg:col-span-1">
          <FormField label="Notas" htmlFor="notes">
            <input id="notes" name="notes" className={inputClass} />
          </FormField>
        </div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "sm:col-span-2 lg:col-span-1")}>
          {pending ? "Subiendo…" : "Subir documento"}
        </button>
      </form>
      {state.error ? <p className="mt-3 text-sm text-terracota">{state.error}</p> : null}

      {documents.length === 0 ? (
        <EmptyState text="Todavía no se cargaron documentos." className="mt-4" bordered />
      ) : (
        <ul className="mt-5 divide-y divide-grafito/[0.06] border-t border-grafito/[0.06]">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-grafito">
                  {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                </p>
                <p className="truncate text-xs text-grafito/50">
                  {doc.notes || doc.file_path.split("/").pop()}
                  {doc.uploaded_by_profile ? ` · ${doc.uploaded_by_profile.full_name}` : ""}
                </p>
              </div>
              <div className="-mr-2.5 flex shrink-0 items-center">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const url = await getDocumentSignedUrl(doc.file_path);
                      if (url) window.open(url, "_blank", "noopener,noreferrer");
                    })
                  }
                  className={buttonClass("ghost", "sm")}
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
                    className={buttonClass("danger", "sm")}
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
