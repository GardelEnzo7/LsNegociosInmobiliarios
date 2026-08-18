"use client";

import { useEffect } from "react";
import { whatsappLink } from "@/lib/constants";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-utility text-[11px] uppercase tracking-[0.2em] text-terracota">Ups</p>
      <h1 className="mt-3 font-display text-2xl text-grafito">Algo no funcionó como esperábamos</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-grafito/60">
        Tuvimos un problema momentáneo para cargar esta página. Podés reintentar, o escribirnos
        directamente por WhatsApp mientras tanto.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-grafito px-6 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.08em] text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark"
        >
          Reintentar
        </button>
        <a
          href={whatsappLink("Hola, tuve un problema al navegar el sitio.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-piedra px-6 py-3 font-utility text-[12px] font-medium uppercase tracking-[0.08em] text-grafito transition-colors duration-200 ease-out hover:bg-piedra/40"
        >
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}
