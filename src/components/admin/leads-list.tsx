"use client";

import { useTransition } from "react";
import { deleteLead, updateLeadStatus } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
};

const STATUS_STYLES: Record<string, string> = {
  nuevo: "bg-petroleo/10 text-petroleo",
  contactado: "bg-amber-50 text-amber-700",
  en_proceso: "bg-blue-50 text-blue-700",
  cerrado: "bg-zinc-100 text-zinc-500",
};

type Lead = {
  id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
  source: string;
  status: string;
  notes: string | null;
  lead_properties: { properties: { id: string; title: string; slug: string } | null }[];
};

export function LeadsList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no hay clientes cargados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const interestedProperties = lead.lead_properties
    .map((lp) => lp.properties)
    .filter((p): p is { id: string; title: string; slug: string } => p !== null);

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 transition-opacity duration-150",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900">{lead.name}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {[lead.contact_phone, lead.contact_email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">Origen: {lead.source}</p>
        </div>
        <select
          defaultValue={lead.status}
          onChange={(event) => startTransition(() => updateLeadStatus(lead.id, event.target.value))}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
            STATUS_STYLES[lead.status],
          )}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {lead.notes ? <p className="mt-3 text-sm leading-relaxed text-zinc-700">{lead.notes}</p> : null}

      {interestedProperties.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {interestedProperties.map((property) => (
            <span key={property.id} className="rounded-full bg-piedra/50 px-2.5 py-1 text-xs text-grafito">
              {property.title}
            </span>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (confirm(`¿Eliminar a "${lead.name}"?`)) {
            startTransition(() => deleteLead(lead.id));
          }
        }}
        className="mt-4 text-xs font-medium text-red-600 hover:underline"
      >
        Eliminar
      </button>
    </div>
  );
}
