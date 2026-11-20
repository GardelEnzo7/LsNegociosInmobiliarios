"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { updateContact, type ContactEditState } from "@/app/actions/contacts";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { FormField, inputClass, textareaClass } from "@/components/admin/ui/form-field";
import { IconMail, IconSearch, IconWhatsapp } from "@/components/site/icons";
import { telHref, whatsappHref } from "@/lib/admin/contact-links";
import type { DirectoryContact } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  propietario: "Propietario",
  inquilino: "Inquilino",
  interesado: "Interesado",
  comprador: "Comprador",
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "propietario", label: "Propietarios" },
  { id: "inquilino", label: "Inquilinos" },
] as const;

export function ContactsDirectory({ contacts }: { contacts: DirectoryContact[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter !== "todos" && !c.roles.includes(filter)) return false;
      if (!term) return true;
      return [c.full_name, c.contact_phone, c.contact_email, ...c.contracts.map((x) => x.propertyTitle)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [contacts, filter, query]);

  if (contacts.length === 0) {
    return (
      <EmptyState
        bordered
        text="Todavía no hay contactos. Se crean solos al cargar una administración."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filtrar contactos" className="flex gap-1.5">
          {FILTERS.map((f) => {
            const count = f.id === "todos" ? contacts.length : contacts.filter((c) => c.roles.includes(f.id)).length;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors duration-150 ease-out",
                  filter === f.id
                    ? "bg-grafito text-blanco-roto"
                    : "bg-blanco-roto text-grafito/65 ring-1 ring-grafito/[0.08] hover:text-grafito",
                )}
              >
                {f.label}
                <span className={cn("text-xs tabular-nums", filter === f.id ? "text-blanco-roto/60" : "text-grafito/40")}>{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Buscar contacto</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grafito/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, teléfono, email o propiedad…"
            className={cn(inputClass, "pl-9")}
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState bordered text="No hay contactos que coincidan." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visible.map((contact) => (
            <li key={contact.id}>
              <ContactCard contact={contact} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const initialState: ContactEditState = {};

function ContactCard({ contact }: { contact: DirectoryContact }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateContact, initialState);
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.saved) setEditing(false);
  }

  const wa = whatsappHref(contact.contact_phone);
  const tel = telHref(contact.contact_phone);
  const initials = contact.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <article className="flex h-full flex-col rounded-2xl bg-blanco-roto p-5 ring-1 ring-grafito/[0.07]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-petroleo/[0.1] font-display text-[15px] text-petroleo"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[17px] leading-snug text-grafito" style={{ fontWeight: 480 }}>
            {contact.full_name}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {contact.roles.map((role) => (
              <span key={role} className="rounded-full bg-plata px-2 py-0.5 text-[11px] text-grafito/65 ring-1 ring-inset ring-grafito/[0.06]">
                {ROLE_LABELS[role] ?? role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {editing ? (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={contact.id} />
          <FormField label="Nombre" htmlFor={`c-name-${contact.id}`}>
            <input id={`c-name-${contact.id}`} name="fullName" required defaultValue={contact.full_name} className={inputClass} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Teléfono" htmlFor={`c-phone-${contact.id}`}>
              <input id={`c-phone-${contact.id}`} name="phone" type="tel" defaultValue={contact.contact_phone ?? ""} className={inputClass} />
            </FormField>
            <FormField label="Email" htmlFor={`c-email-${contact.id}`}>
              <input id={`c-email-${contact.id}`} name="email" type="email" defaultValue={contact.contact_email ?? ""} className={inputClass} />
            </FormField>
          </div>
          <FormField label="Notas" htmlFor={`c-notes-${contact.id}`}>
            <textarea id={`c-notes-${contact.id}`} name="notes" rows={2} defaultValue={contact.notes ?? ""} className={textareaClass} />
          </FormField>
          {state.error ? <p className="text-sm text-terracota">{state.error}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className={buttonClass("ghost")}>
              Cancelar
            </button>
            <button type="submit" disabled={pending} className={buttonClass("primary")}>
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="sr-only">Teléfono</dt>
              <dd className="text-grafito/70">
                {tel ? (
                  <a href={tel} className="hover:text-petroleo">
                    {contact.contact_phone}
                  </a>
                ) : (
                  <span className="text-grafito/40">Sin teléfono</span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Email</dt>
              <dd className="min-w-0 break-all text-grafito/70">
                {contact.contact_email ? (
                  <a href={`mailto:${contact.contact_email}`} className="hover:text-petroleo">
                    {contact.contact_email}
                  </a>
                ) : (
                  <span className="text-grafito/40">Sin email</span>
                )}
              </dd>
            </div>
          </dl>

          {contact.notes ? <p className="mt-3 text-sm leading-relaxed text-grafito/60">{contact.notes}</p> : null}

          {contact.contracts.length > 0 ? (
            <ul className="mt-4 space-y-1.5 border-t border-grafito/[0.06] pt-3">
              {contact.contracts.map((c) => (
                <li key={c.id} className="text-sm">
                  <Link href={`/admin/administraciones/${c.id}`} className="group flex items-center gap-2 text-grafito/75 hover:text-petroleo">
                    <span
                      aria-hidden="true"
                      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", c.status === "activo" ? "bg-petroleo" : "bg-grafito/25")}
                    />
                    <span className="truncate">{c.propertyTitle}</span>
                    <span className="shrink-0 text-xs text-grafito/45">
                      {c.as === "propietario" ? "propietario" : "inquilino"}
                      {c.status === "activo" ? "" : " · finalizado"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="-mx-2.5 mt-auto flex flex-wrap gap-1 pt-4">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "sm")}>
                <IconWhatsapp className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            ) : null}
            {contact.contact_email ? (
              <a href={`mailto:${contact.contact_email}`} className={buttonClass("ghost", "sm")}>
                <IconMail className="h-3.5 w-3.5" />
                Email
              </a>
            ) : null}
            <button type="button" onClick={() => setEditing(true)} className={buttonClass("ghost", "sm", "ml-auto")}>
              Editar
            </button>
          </div>
        </>
      )}
    </article>
  );
}
