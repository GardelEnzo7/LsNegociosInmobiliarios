"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteVisit, rescheduleVisit, updateVisitStatus } from "@/app/actions/visits";
import { VISIT_STATUS_LABELS, VISIT_STATUS_TIERS, VISIT_STATUS_ORDER, isToday, isTomorrow } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { cn } from "@/lib/utils";

const VISIT_STATUS_OPTIONS = VISIT_STATUS_ORDER.map((status) => ({
  value: status,
  label: VISIT_STATUS_LABELS[status],
}));

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
  const [showPast, setShowPast] = useState(false);

  const groups = useMemo(() => {
    const upcoming = visits.filter((v) => v.status === "programada" || v.status === "reprogramada");
    const past = visits.filter((v) => v.status === "realizada" || v.status === "cancelada");

    return {
      hoy: upcoming.filter((v) => isToday(v.scheduled_at)),
      manana: upcoming.filter((v) => isTomorrow(v.scheduled_at)),
      proximas: upcoming.filter((v) => !isToday(v.scheduled_at) && !isTomorrow(v.scheduled_at)),
      pasadas: past,
    };
  }, [visits]);

  if (visits.length === 0) {
    return <EmptyState bordered text="Todavía no hay visitas programadas." />;
  }

  return (
    <div className="space-y-6">
      <VisitGroup title="Hoy" visits={groups.hoy} emphasized />
      <VisitGroup title="Mañana" visits={groups.manana} />
      <VisitGroup title="Próximas" visits={groups.proximas} />

      {groups.pasadas.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="text-xs font-medium text-grafito/45 hover:text-grafito/70"
          >
            {showPast ? "Ocultar" : "Ver"} historial ({groups.pasadas.length})
          </button>
          {showPast ? <VisitGroup title="" visits={groups.pasadas} className="mt-3" /> : null}
        </div>
      ) : null}
    </div>
  );
}

function VisitGroup({
  title,
  visits,
  emphasized,
  warn,
  className,
}: {
  title: string;
  visits: Visit[];
  emphasized?: boolean;
  warn?: boolean;
  className?: string;
}) {
  if (visits.length === 0 && !emphasized) return null;

  return (
    <div className={className}>
      {title ? (
        <h2 className={cn("font-utility text-[11px] font-medium uppercase tracking-[0.1em]", warn ? "text-terracota" : "text-grafito/40")}>
          {title}
        </h2>
      ) : null}
      {visits.length === 0 ? (
        <p className="mt-2 text-sm text-grafito/35">Nada programado.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      )}
    </div>
  );
}

function VisitCard({ visit }: { visit: Visit }) {
  const [isPending, startTransition] = useTransition();
  const [reschedule, setReschedule] = useState(false);
  const confirm = useConfirm();

  return (
    <div
      className={cn(
        "rounded-2xl bg-blanco-roto p-4 ring-1 ring-grafito/[0.06] transition-opacity duration-150",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-piedra/50 px-2.5 py-1.5 text-center">
            <p className="font-display text-lg leading-none text-grafito" style={{ fontWeight: 480 }}>
              {new Date(visit.scheduled_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-grafito">
              {visit.property ? (
                <Link href={`/admin/propiedades/${visit.property.id}`} className="hover:underline">
                  {visit.property.title}
                </Link>
              ) : (
                "Propiedad eliminada"
              )}
            </p>
            <p className="mt-0.5 text-xs text-grafito/50">
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
        </div>
        <StatusSelect
          value={visit.status}
          tier={VISIT_STATUS_TIERS[visit.status]}
          options={VISIT_STATUS_OPTIONS}
          disabled={isPending}
          onChange={(value) => startTransition(() => updateVisitStatus(visit.id, value))}
        />
      </div>

      {visit.notes ? <p className="mt-3 text-sm leading-relaxed text-grafito/70">{visit.notes}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {visit.status === "programada" || visit.status === "reprogramada" ? (
          <button
            type="button"
            onClick={() => startTransition(() => updateVisitStatus(visit.id, "realizada"))}
            className="rounded-full bg-petroleo/10 px-3 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] text-petroleo transition-colors duration-150 ease-out hover:bg-petroleo/20"
          >
            Marcar realizada
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setReschedule((v) => !v)}
          className="text-xs font-medium text-petroleo hover:underline"
        >
          Reprogramar
        </button>
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: "¿Eliminar esta visita?", confirmLabel: "Eliminar", destructive: true });
            if (ok) startTransition(() => deleteVisit(visit.id));
          }}
          className="text-xs font-medium text-terracota hover:underline"
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
            className="rounded-lg border border-grafito/10 px-2.5 py-1.5 text-sm text-grafito outline-none focus:border-petroleo"
          />
          <button type="submit" className="rounded-lg bg-grafito px-3 py-1.5 text-xs font-medium text-blanco-roto">
            Guardar
          </button>
        </form>
      ) : null}
    </div>
  );
}
