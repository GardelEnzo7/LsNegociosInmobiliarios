"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-xs font-medium text-zinc-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="admin@lsnegocios.com.ar"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-medium text-zinc-600">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="LSNegocios2026"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo"
        />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
