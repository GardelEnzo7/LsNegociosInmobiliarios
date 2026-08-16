"use client";

import { useActionState, useTransition } from "react";
import {
  deletePropertyDocument,
  getDocumentSignedUrl,
  uploadPropertyDocument,
  type DocumentFormState,
} from "@/app/actions/property-documents";

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

export function PropertyDocumentsPanel({ propertyId, documents }: { propertyId: string; documents: Document[] }) {
  const action = uploadPropertyDocument.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Los documentos se guardan en almacenamiento privado. Nunca quedan accesibles por una URL pública
        permanente — se generan enlaces temporales solo para el staff logueado.
      </div>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 p-4">
        <div>
          <label className="text-xs font-medium text-zinc-600">Tipo</label>
          <select name="docType" defaultValue="otro" className="mt-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Archivo</label>
          <input type="file" name="file" required className="mt-1 block text-sm" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-zinc-600">Notas</label>
          <input name="notes" className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-grafito px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Subir documento"}
        </button>
      </form>
      {state.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}

      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">Todavía no se cargaron documentos.</p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800">
                  {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                </p>
                <p className="truncate text-xs text-zinc-500">
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
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("¿Eliminar este documento?")) {
                      startTransition(() => deletePropertyDocument(doc.id, propertyId, doc.file_path));
                    }
                  }}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
