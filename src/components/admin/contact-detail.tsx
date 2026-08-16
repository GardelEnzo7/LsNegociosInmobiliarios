"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  addContactRole,
  deleteContact,
  removeContactRole,
  updateContactNotes,
} from "@/app/actions/contacts";
import {
  CONTACT_ROLE_LABELS,
  CONTACT_ROLE_STYLES,
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_STYLES,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_STYLES,
  formatDateTime,
  formatRelativeDate,
} from "@/lib/admin/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ActivityTimeline } from "@/components/admin/activity-timeline";

const ALL_ROLES = Object.keys(CONTACT_ROLE_LABELS);

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

type Inquiry = {
  id: string;
  status: string;
  origin: string;
  created_at: string;
  internal_notes: string | null;
  property: { id: string; title: string; slug: string } | null;
  assigned: { id: string; full_name: string } | null;
};

type Visit = {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  property: { id: string; title: string; slug: string } | null;
  assigned: { id: string; full_name: string } | null;
};

type ActivityEvent = {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  actor: { full_name: string } | null;
};

export function ContactDetail({
  contact,
  inquiries,
  visits,
  activity,
}: {
  contact: Contact;
  inquiries: Inquiry[];
  visits: Visit[];
  activity: ActivityEvent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(contact.notes ?? "");
  const activeRoles = new Set(contact.contact_roles.map((r) => r.role));
  const properties = contact.contact_properties
    .map((cp) => cp.properties)
    .filter((p): p is { id: string; title: string; slug: string } => p !== null);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/clientes" className="text-xs font-medium text-petroleo hover:underline">
            ← Clientes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{contact.full_name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {[contact.contact_phone, contact.contact_email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
            {" · "}Origen: {contact.source}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Eliminar a "${contact.full_name}"? Esta acción no se puede deshacer.`)) {
              startTransition(async () => {
                await deleteContact(contact.id);
                router.push("/admin/clientes");
              });
            }
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Eliminar cliente
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Roles">
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => {
                const active = activeRoles.has(role);
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() =>
                        active ? removeContactRole(contact.id, role) : addContactRole(contact.id, role as never),
                      )
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out",
                      active
                        ? CONTACT_ROLE_STYLES[role]
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200",
                    )}
                  >
                    {CONTACT_ROLE_LABELS[role]} {active ? "✕" : "+"}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Notas">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => startTransition(() => updateContactNotes(contact.id, notes))}
              rows={3}
              placeholder="Notas internas sobre este cliente…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-200 ease-out focus:border-petroleo"
            />
          </Section>

          <Section title="Propiedades relacionadas">
            {properties.length === 0 ? (
              <EmptyState text="Sin propiedades relacionadas." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/admin/propiedades/${property.id}`}
                    className="rounded-full bg-piedra/50 px-2.5 py-1 text-xs text-grafito hover:bg-piedra"
                  >
                    {property.title}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          <Section title="Consultas">
            {inquiries.length === 0 ? (
              <EmptyState text="Sin consultas registradas." />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {inquiries.map((inquiry) => (
                  <li key={inquiry.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-800">
                        {inquiry.property?.title ?? "Consulta general"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatRelativeDate(inquiry.created_at)}
                        {inquiry.assigned ? ` · ${inquiry.assigned.full_name}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        INQUIRY_STATUS_STYLES[inquiry.status],
                      )}
                    >
                      {INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Visitas">
            {visits.length === 0 ? (
              <EmptyState text="Sin visitas registradas." />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {visits.map((visit) => (
                  <li key={visit.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-800">{visit.property?.title ?? "Propiedad"}</p>
                      <p className="text-xs text-zinc-500">{formatDateTime(visit.scheduled_at)}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        VISIT_STATUS_STYLES[visit.status],
                      )}
                    >
                      {VISIT_STATUS_LABELS[visit.status] ?? visit.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div>
          <Section title="Historial de actividad">
            <ActivityTimeline events={activity} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400">{text}</p>;
}
