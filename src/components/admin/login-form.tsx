"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="font-utility text-[11px] font-medium uppercase tracking-[0.06em] text-grafito/55">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue="admin@lsnegocios.com.ar"
          className="mt-1.5 w-full rounded-lg border border-grafito/10 px-3 py-2.5 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo"
        />
      </div>
      <div>
        <label htmlFor="password" className="font-utility text-[11px] font-medium uppercase tracking-[0.06em] text-grafito/55">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            defaultValue="LSNegocios2026"
            className="w-full rounded-lg border border-grafito/10 px-3 py-2.5 pr-10 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-grafito/40 transition-colors duration-150 ease-out hover:text-grafito/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petroleo-claro"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.5 6.7C4.3 8.2 2.7 10.3 2 12c1.5 3.5 5.3 7 10 7 1.7 0 3.3-.4 4.7-1.1M9.9 4.2A10.6 10.6 0 0 1 12 4c4.7 0 8.5 3.5 10 7-.4 1-1 2-1.7 2.9" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M2 12c1.5-3.5 5.3-7 10-7s8.5 3.5 10 7c-1.5 3.5-5.3 7-10 7s-8.5-3.5-10-7Z" />
                <circle cx={12} cy={12} r={2.8} />
              </svg>
            )}
          </button>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-terracota/[0.08] px-3 py-2 text-sm text-terracota">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
