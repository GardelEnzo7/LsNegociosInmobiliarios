"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  assignInquiry,
  convertInquiryToContact,
  deleteInquiry,
  updateInquiryNotes,
  updateInquiryStatus,
} from "@/app/actions/inquiries";
import { deleteMessage } from "@/app/actions/messages";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_STYLES, INQUIRY_STATUS_ORDER, formatDateTime } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

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
  const [filter, setFilter] = useState<string>("todas");

  const filtered = filter === "todas" ? inquiries : inquiries.filter((i) => i.status === filter);

  if (inquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no llegaron consultas desde el sitio.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <FilterPill active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas ({inquiries.length})
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
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((inquiry) => (
          <InquiryCard key={inquiry.id} inquiry={inquiry} admins={admins} />
        ))}
      </div>
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

function InquiryCard({ inquiry, admins }: { inquiry: Inquiry; admins: AdminOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(inquiry.internal_notes ?? "");
  const clientName = inquiry.contact?.full_name ?? inquiry.message?.name ?? "Sin identificar";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-opacity duration-150",
        inquiry.status === "nuevo" ? "border-petroleo/30 bg-petroleo/[0.03]" : "border-zinc-200",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {inquiry.contact ? (
              <Link href={`/admin/clientes/${inquiry.contact.id}`} className="font-medium text-zinc-900 hover:underline">
                {clientName}
              </Link>
            ) : (
              <p className="font-medium text-zinc-900">{clientName}</p>
            )}
          </div>
          {inquiry.message ? <p className="mt-0.5 text-xs text-zinc-500">{inquiry.message.contact}</p> : null}
          {inquiry.property ? (
            <Link
              href={`/admin/propiedades/${inquiry.property.id}`}
              className="mt-1 inline-block text-xs text-petroleo hover:underline"
            >
              Sobre: {inquiry.property.title}
            </Link>
          ) : null}
          <p className="mt-1 text-xs text-zinc-400">
            {inquiry.origin} · {formatDateTime(inquiry.created_at)}
          </p>
        </div>

        <select
          value={inquiry.status}
          onChange={(event) => startTransition(() => updateInquiryStatus(inquiry.id, event.target.value))}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
            INQUIRY_STATUS_STYLES[inquiry.status],
          )}
        >
          {INQUIRY_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {INQUIRY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {inquiry.message ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">{inquiry.message.message}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-zinc-500">Responsable</label>
          <select
            defaultValue={inquiry.assigned?.id ?? ""}
            onChange={(event) => startTransition(() => assignInquiry(inquiry.id, event.target.value || null))}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-petroleo"
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
          <label className="text-xs font-medium text-zinc-500">Notas internas</label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={() => startTransition(() => updateInquiryNotes(inquiry.id, notes))}
            placeholder="Agregar nota…"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-petroleo"
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
            Convertir a cliente
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Eliminar esta consulta?")) {
              startTransition(() =>
                inquiry.message ? deleteMessage(inquiry.message.id) : deleteInquiry(inquiry.id),
              );
            }
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
