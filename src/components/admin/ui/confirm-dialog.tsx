"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/admin/ui/button";
import { useFocusTrap } from "@/lib/use-focus-trap";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, Boolean(state), { autoFocusFirst: false });

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
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={state.options.description ? "confirm-dialog-description" : undefined}
            className="relative w-full max-w-sm rounded-2xl bg-blanco-roto p-6 shadow-[0_16px_40px_-12px_rgba(28,33,41,0.35)] animate-[fade-up_180ms_var(--ease-out)]"
          >
            <h2 id="confirm-dialog-title" className="font-display text-[19px] leading-[1.25] text-grafito" style={{ fontWeight: 480 }}>
              {state.options.title}
            </h2>
            {state.options.description ? (
              <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-grafito/60">
                {state.options.description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => close(false)} className={buttonClass("secondary")}>
                {state.options.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={buttonClass(state.options.destructive ? "dangerSolid" : "primary")}
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
