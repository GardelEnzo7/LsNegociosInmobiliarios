"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/app/actions/messages";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm({
  propertyId,
  defaultMessage,
}: {
  propertyId?: string;
  defaultMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div className="animate-fade-up rounded-2xl bg-piedra/30 p-8">
        <p className="font-display text-xl text-grafito">Mensaje enviado</p>
        <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-grafito/65">
          Gracias por escribirnos. Te vamos a responder a la brevedad. Si preferís una
          respuesta inmediata, escribinos por WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      <Field label="Nombre" name="name" error={state.errors?.name}>
        <input id="name" name="name" type="text" autoComplete="name" className={inputClass} />
      </Field>
      <Field label="Teléfono o email" name="contact" error={state.errors?.contact}>
        <input id="contact" name="contact" type="text" autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Mensaje" name="message" error={state.errors?.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          defaultValue={defaultMessage}
          className={inputClass}
        />
      </Field>
      {state.status === "error" && !state.errors ? (
        <p className="font-body text-sm text-red-700">
          No pudimos enviar tu mensaje. Probá de nuevo en unos minutos.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-grafito px-8 py-3.5 font-utility text-[12px] font-medium uppercase tracking-[0.1em] text-blanco-roto transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
      >
        {pending ? "Enviando…" : "Enviar Mensaje"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-piedra bg-blanco-roto px-4 py-3 font-body text-sm text-grafito outline-none transition-colors duration-200 ease-out focus:border-petroleo";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-utility text-[11px] font-medium text-grafito/70">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 font-body text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
