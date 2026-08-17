"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTACT_ROLE_LABELS } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";

type Contact = {
  id: string;
  full_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  source: string;
  notes: string | null;
  contact_roles: { role: string }[];
  contact_properties: { properties: { id: string; title: string; slug: string } | null }[];
};

export function ContactsList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) =>
      [c.full_name, c.contact_phone, c.contact_email].filter(Boolean).some((v) => v!.toLowerCase().includes(term)),
    );
  }, [contacts, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre, teléfono o email…"
        className="w-full rounded-lg border border-grafito/10 px-3 py-2.5 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo"
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          bordered
          text={contacts.length === 0 ? "Todavía no hay clientes cargados." : "Ningún cliente coincide con la búsqueda."}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((contact) => {
            const properties = contact.contact_properties
              .map((cp) => cp.properties)
              .filter((p): p is { id: string; title: string; slug: string } => p !== null);

            return (
              <Link
                key={contact.id}
                href={`/admin/clientes/${contact.id}`}
                className="block rounded-2xl bg-blanco-roto p-5 ring-1 ring-grafito/[0.06] transition-shadow duration-200 ease-out hover:shadow-[0_12px_24px_-10px_rgba(28,33,41,0.22)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[16px] text-grafito" style={{ fontWeight: 480 }}>{contact.full_name}</p>
                    <p className="mt-0.5 text-xs text-grafito/50">
                      {[contact.contact_phone, contact.contact_email].filter(Boolean).join(" · ") ||
                        "Sin datos de contacto"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.contact_roles.map((r) => (
                      <StatusBadge key={r.role} tier="role" label={CONTACT_ROLE_LABELS[r.role] ?? r.role} />
                    ))}
                  </div>
                </div>
                {properties.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {properties.slice(0, 4).map((property) => (
                      <span key={property.id} className="rounded-full bg-piedra/50 px-2.5 py-1 text-xs text-grafito">
                        {property.title}
                      </span>
                    ))}
                    {properties.length > 4 ? (
                      <span className="rounded-full bg-piedra/30 px-2.5 py-1 text-xs text-grafito/60">
                        +{properties.length - 4}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
