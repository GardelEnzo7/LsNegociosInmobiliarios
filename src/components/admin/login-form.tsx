"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { buttonClass } from "@/components/admin/ui/button";
import { inputClass, labelClass } from "@/components/admin/ui/form-field";
import { IconEye, IconEyeOff } from "@/components/admin/ui/icons";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={cn(inputClass, "mt-1.5 h-11")}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={cn(inputClass, "h-11 pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-grafito/40 transition-colors duration-150 ease-out hover:text-grafito/70"
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
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
        className={buttonClass("primary", "md", "h-11 w-full")}
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
