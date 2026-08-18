"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-blanco-roto p-10 text-center ring-1 ring-grafito/[0.06]">
      <p className="font-utility text-[11px] uppercase tracking-[0.2em] text-terracota">Error</p>
      <h1 className="mt-3 font-display text-xl text-grafito">No se pudo completar la operación</h1>
      <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-grafito/60">
        Hubo un problema al comunicarse con la base de datos. Podés reintentar; si el problema
        sigue, avisá al administrador del sistema.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 rounded-lg bg-grafito px-5 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark"
      >
        Reintentar
      </button>
    </div>
  );
}
