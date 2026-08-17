"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  assignInquiry,
  convertInquiryToContact,
  deleteInquiry,
  updateInquiryNotes,
  updateInquiryStatus,
} from "@/app/actions/inquiries";
import { deleteMessage } from "@/app/actions/messages";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TIERS, INQUIRY_STATUS_ORDER, formatDateTime } from "@/lib/admin/constants";
import { StatusSelect } from "@/components/admin/status-badge";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { cn } from "@/lib/utils";

const INQUIRY_STATUS_OPTIONS = INQUIRY_STATUS_ORDER.map((status) => ({
  value: status,
  label: INQUIRY_STATUS_LABELS[status],
}));

const CLOSED_STATUSES = ["cerrado", "perdido"];

type Inquiry = {
  id: string;
  status: string;
  origin: string;
  created_at: string;
  internal_notes: string | null;
  message: { id: string; name: string; contact: string; message: string; read: boolean } | null;
  property: { id: string; title: string; slug: string } | null;
  contact: { id: string; full_name: string } | null;
  assigned: { id: string; full_name: string } | null;
};

type AdminOption = { id: string; full_name: string };

export function InquiriesList({ inquiries, admins }: { inquiries: Inquiry[]; admins: AdminOption[] }) {
  const [filter, setFilter] = useState<string>("pendientes");

  const pendingCount = useMemo(() => inquiries.filter((i) => !CLOSED_STATUSES.includes(i.status)).length, [inquiries]);

  const filtered =
    filter === "todas"
      ? inquiries
      : filter === "pendientes"
        ? inquiries.filter((i) => !CLOSED_STATUSES.includes(i.status))
        : inquiries.filter((i) => i.status === filter);

  if (inquiries.length === 0) {
    return <EmptyState bordered text="Todavía no llegaron consultas desde el sitio." />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <FilterPill active={filter === "pendientes"} onClick={() => setFilter("pendientes")}>
          En seguimiento ({pendingCount})
        </FilterPill>
        {INQUIRY_STATUS_ORDER.map((status) => {
          const count = inquiries.filter((i) => i.status === status).length;
          if (count === 0) return null;
          return (
            <FilterPill key={status} active={filter === status} onClick={() => setFilter(status)}>
              {INQUIRY_STATUS_LABELS[status]} ({count})
            </FilterPill>
          );
        })}
        <FilterPill active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas ({inquiries.length})
        </FilterPill>
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-6" text="No hay consultas en esta vista." />
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} admins={admins} />
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
        "rounded-full px-3 py-1.5 font-utility text-[11px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ease-out",
        active ? "bg-grafito text-blanco-roto" : "bg-piedra/40 text-grafito/55 hover:bg-piedra/60",
      )}
    >
      {children}
    </button>
  );
}

function InquiryCard({ inquiry, admins }: { inquiry: Inquiry; admins: AdminOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(inquiry.internal_notes ?? "");
  const confirm = useConfirm();
  const clientName = inquiry.contact?.full_name ?? inquiry.message?.name ?? "Sin identificar";

  return (
    <div
      className={cn(
        "rounded-2xl bg-blanco-roto p-5 ring-1 transition-opacity duration-150",
        inquiry.status === "nuevo" ? "ring-petroleo/25 bg-petroleo/[0.02]" : "ring-grafito/[0.06]",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {inquiry.contact ? (
              <Link href={`/admin/clientes/${inquiry.contact.id}`} className="font-medium text-grafito hover:underline">
                {clientName}
              </Link>
            ) : (
              <p className="font-medium text-grafito">{clientName}</p>
            )}
          </div>
          {inquiry.message ? <p className="mt-0.5 text-xs text-grafito/50">{inquiry.message.contact}</p> : null}
          {inquiry.property ? (
            <Link
              href={`/admin/propiedades/${inquiry.property.id}`}
              className="mt-1 inline-block text-xs text-petroleo hover:underline"
            >
              Sobre: {inquiry.property.title}
            </Link>
          ) : null}
          <p className="mt-1 text-xs text-grafito/40">
            {inquiry.origin} · {formatDateTime(inquiry.created_at)}
          </p>
        </div>

        <StatusSelect
          value={inquiry.status}
          tier={INQUIRY_STATUS_TIERS[inquiry.status]}
          options={INQUIRY_STATUS_OPTIONS}
          disabled={isPending}
          onChange={(value) => startTransition(() => updateInquiryStatus(inquiry.id, value))}
        />
      </div>

      {inquiry.message ? (
        <p className="mt-3 text-sm leading-relaxed text-grafito/70">{inquiry.message.message}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-grafito/50">Responsable</label>
          <select
            defaultValue={inquiry.assigned?.id ?? ""}
            onChange={(event) => startTransition(() => assignInquiry(inquiry.id, event.target.value || null))}
            className="mt-1 w-full rounded-lg border border-grafito/10 px-2.5 py-1.5 text-sm text-grafito outline-none focus:border-petroleo"
          >
            <option value="">Sin asignar</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-grafito/50">Notas internas</label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => startTransition(() => updateInquiryNotes(inquiry.id, notes))}
            placeholder="Agregar nota…"
            className="mt-1 w-full rounded-lg border border-grafito/10 px-2.5 py-1.5 text-sm text-grafito outline-none focus:border-petroleo"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {!inquiry.contact && inquiry.message ? (
          <button
            type="button"
            onClick={() => startTransition(() => convertInquiryToContact(inquiry.id))}
            className="text-xs font-medium text-grafito hover:underline"
          >
            Crear cliente
          </button>
        ) : null}
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: "¿Eliminar esta consulta?", confirmLabel: "Eliminar", destructive: true });
            if (ok) {
              startTransition(() =>
                inquiry.message ? deleteMessage(inquiry.message.id) : deleteInquiry(inquiry.id),
              );
            }
          }}
          className="text-xs font-medium text-terracota hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
