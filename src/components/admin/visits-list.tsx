"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteVisit, rescheduleVisit, updateVisitStatus } from "@/app/actions/visits";
import { VISIT_STATUS_LABELS, VISIT_STATUS_STYLES, VISIT_STATUS_ORDER, formatDateTime } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

type Visit = {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  property: { id: string; title: string; slug: string } | null;
  contact: { id: string; full_name: string } | null;
  assigned: { id: string; full_name: string } | null;
};

export function VisitsList({ visits }: { visits: Visit[] }) {
  const [filter, setFilter] = useState<string>("proximas");

  const filtered = visits.filter((v) => {
    if (filter === "todas") return true;
    if (filter === "proximas") return v.status === "programada";
    return v.status === filter;
  });

  if (visits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no hay visitas programadas.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <FilterPill active={filter === "proximas"} onClick={() => setFilter("proximas")}>
          Próximas
        </FilterPill>
        {VISIT_STATUS_ORDER.map((status) => (
          <FilterPill key={status} active={filter === status} onClick={() => setFilter(status)}>
            {VISIT_STATUS_LABELS[status]}
          </FilterPill>
        ))}
        <FilterPill active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas
        </FilterPill>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-400">No hay visitas en esta vista.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease-out",
        active ? "bg-grafito text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
      )}
    >
      {children}
    </button>
  );
}

function VisitCard({ visit }: { visit: Visit }) {
  const [isPending, startTransition] = useTransition();
  const [reschedule, setReschedule] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 transition-opacity duration-150",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900">{formatDateTime(visit.scheduled_at)}</p>
          <p className="mt-0.5 text-sm text-zinc-700">
            {visit.property ? (
              <Link href={`/admin/propiedades/${visit.property.id}`} className="hover:underline">
                {visit.property.title}
              </Link>
            ) : (
              "Propiedad eliminada"
            )}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {visit.contact ? (
              <Link href={`/admin/clientes/${visit.contact.id}`} className="hover:underline">
                {visit.contact.full_name}
              </Link>
            ) : (
              "Cliente eliminado"
            )}
            {visit.assigned ? ` · ${visit.assigned.full_name}` : ""}
          </p>
        </div>
        <select
          value={visit.status}
          onChange={(event) => startTransition(() => updateVisitStatus(visit.id, event.target.value))}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
            VISIT_STATUS_STYLES[visit.status],
          )}
        >
          {VISIT_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {VISIT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {visit.notes ? <p className="mt-3 text-sm leading-relaxed text-zinc-700">{visit.notes}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setReschedule((v) => !v)}
          className="text-xs font-medium text-petroleo hover:underline"
        >
          Reprogramar
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Eliminar esta visita?")) startTransition(() => deleteVisit(visit.id));
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>

      {reschedule ? (
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const value = formData.get("newDate") as string;
            if (value) {
              startTransition(() => rescheduleVisit(visit.id, value));
              setReschedule(false);
            }
          }}
        >
          <input
            type="datetime-local"
            name="newDate"
            required
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-petroleo"
          />
          <button type="submit" className="rounded-lg bg-grafito px-3 py-1.5 text-xs font-medium text-white">
            Guardar
          </button>
        </form>
      ) : null}
    </div>
  );
}
