"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => setState({ options, resolve }));
  }, []);

  const close = useCallback(
    (result: boolean) => {
      state?.resolve(result);
      setState(null);
    },
    [state],
  );

  useEffect(() => {
    if (!state) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-grafito-dark/40 animate-[fade-up_180ms_var(--ease-out)]" onClick={() => close(false)} />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-sm rounded-2xl bg-blanco-roto p-6 shadow-[0_16px_40px_-12px_rgba(28,33,41,0.35)]"
          >
            <h2 id="confirm-dialog-title" className="font-display text-[19px] leading-[1.25] text-grafito" style={{ fontWeight: 480 }}>
              {state.options.title}
            </h2>
            {state.options.description ? (
              <p className="mt-2 text-sm leading-relaxed text-grafito/60">{state.options.description}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-grafito/55 transition-colors duration-150 ease-out hover:bg-piedra/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petroleo-claro"
              >
                {state.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-blanco-roto transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petroleo-claro",
                  state.options.destructive ? "bg-terracota hover:bg-terracota/90" : "bg-grafito hover:bg-grafito-dark",
                )}
              >
                {state.options.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}
