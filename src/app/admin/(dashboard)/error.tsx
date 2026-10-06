"use client";

import { useEffect } from "react";
import { buttonClass } from "@/components/admin/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-blanco-roto px-6 py-12 text-center ring-1 ring-grafito/[0.07]">
      <p className="font-utility text-[11px] uppercase tracking-[0.2em] text-terracota">Error</p>
      <h1 className="mt-3 font-display text-[22px] leading-tight text-grafito" style={{ fontWeight: 480 }}>No se pudo completar la operación</h1>
      <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-grafito/60">
        Hubo un problema al comunicarse con la base de datos. Podés reintentar; si el problema
        sigue, avisá al administrador del sistema.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className={buttonClass("primary", "md", "mt-6")}
      >
        Reintentar
      </button>
    </div>
  );
}
