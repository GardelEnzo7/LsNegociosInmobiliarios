"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addContactRole,
  deleteContact,
  removeContactRole,
  updateContactNotes,
} from "@/app/actions/contacts";
import { updateInquiryStatus } from "@/app/actions/inquiries";
import { updateVisitStatus } from "@/app/actions/visits";
import {
  CONTACT_ROLE_LABELS,
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_TIERS,
  INQUIRY_STATUS_ORDER,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_TIERS,
  VISIT_STATUS_ORDER,
  TIER_STYLES,
  formatDateTime,
  formatRelativeDate,
} from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { cn } from "@/lib/utils";

const ALL_ROLES = Object.keys(CONTACT_ROLE_LABELS);
const INQUIRY_STATUS_OPTIONS = INQUIRY_STATUS_ORDER.map((s) => ({ value: s, label: INQUIRY_STATUS_LABELS[s] }));
const VISIT_STATUS_OPTIONS = VISIT_STATUS_ORDER.map((s) => ({ value: s, label: VISIT_STATUS_LABELS[s] }));

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
  const confirm = useConfirm();
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
          <h1 className="mt-2 font-display text-[24px] leading-tight text-grafito" style={{ fontWeight: 480 }}>
            {contact.full_name}
          </h1>
          <p className="mt-1 text-sm text-grafito/50">
            {[contact.contact_phone, contact.contact_email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({
              title: `¿Eliminar a "${contact.full_name}"?`,
              description: "Esta acción no se puede deshacer.",
              confirmLabel: "Eliminar",
              destructive: true,
            });
            if (ok) {
              startTransition(async () => {
                await deleteContact(contact.id);
                router.push("/admin/clientes");
              });
            }
          }}
          className="text-xs font-medium text-terracota hover:underline"
        >
          Eliminar cliente
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Roles">
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
                      "rounded-full px-3 py-1.5 font-utility text-[10px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ease-out",
                      active ? TIER_STYLES.role : "text-grafito/30 ring-1 ring-inset ring-grafito/10 hover:text-grafito/50",
                    )}
                  >
                    {CONTACT_ROLE_LABELS[role]} {active ? "✕" : "+"}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Notas">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => startTransition(() => updateContactNotes(contact.id, notes))}
              rows={3}
              placeholder="Notas internas sobre este cliente…"
              className="w-full rounded-lg border border-grafito/10 px-3 py-2.5 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo"
            />
          </Panel>

          <Panel title="Propiedades relacionadas">
            {properties.length === 0 ? (
              <EmptyState text="Sin propiedades relacionadas." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/admin/propiedades/${property.id}`}
                    className="rounded-full bg-piedra/40 px-2.5 py-1 text-xs text-grafito hover:bg-piedra/70"
                  >
                    {property.title}
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Consultas">
            {inquiries.length === 0 ? (
              <EmptyState text="Sin consultas registradas." />
            ) : (
              <ul className="divide-y divide-grafito/[0.06]">
                {inquiries.map((inquiry) => (
                  <InquiryRow key={inquiry.id} inquiry={inquiry} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Visitas">
            {visits.length === 0 ? (
              <EmptyState text="Sin visitas registradas." />
            ) : (
              <ul className="divide-y divide-grafito/[0.06]">
                {visits.map((visit) => (
                  <VisitRow key={visit.id} visit={visit} />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div>
          <Panel title="Historial de actividad">
            <ActivityTimeline events={activity} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className={cn("flex items-center justify-between gap-3 py-3 transition-opacity duration-150", isPending && "opacity-50")}>
      <div className="min-w-0">
        <p className="truncate text-sm text-grafito">{inquiry.property?.title ?? "Consulta general"}</p>
        <p className="text-xs text-grafito/45">
          {formatRelativeDate(inquiry.created_at)}
          {inquiry.assigned ? ` · ${inquiry.assigned.full_name}` : ""}
        </p>
      </div>
      <StatusSelect
        value={inquiry.status}
        tier={INQUIRY_STATUS_TIERS[inquiry.status]}
        options={INQUIRY_STATUS_OPTIONS}
        disabled={isPending}
        onChange={(value) => startTransition(() => updateInquiryStatus(inquiry.id, value))}
      />
    </li>
  );
}

function VisitRow({ visit }: { visit: Visit }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className={cn("flex items-center justify-between gap-3 py-3 transition-opacity duration-150", isPending && "opacity-50")}>
      <div className="min-w-0">
        <p className="truncate text-sm text-grafito">{visit.property?.title ?? "Propiedad"}</p>
        <p className="text-xs text-grafito/45">{formatDateTime(visit.scheduled_at)}</p>
      </div>
      <StatusSelect
        value={visit.status}
        tier={VISIT_STATUS_TIERS[visit.status]}
        options={VISIT_STATUS_OPTIONS}
        disabled={isPending}
        onChange={(value) => startTransition(() => updateVisitStatus(visit.id, value))}
      />
    </li>
  );
}
