"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteMessage, setMessageStatus } from "@/app/actions/site-messages";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { chipClass } from "@/components/admin/ui/chip";
import { StatusBadge } from "@/components/admin/status-badge";
import { IconMail, IconWhatsapp } from "@/components/site/icons";
import { splitContact, telHref, whatsappHref } from "@/lib/admin/contact-links";
import type { StatusTier } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  message: string;
  subject: string | null;
  status: string;
  properties: { title: string; slug: string } | null;
};

const FILTERS = [
  { id: "nueva", label: "Nuevas" },
  { id: "respondida", label: "Respondidas" },
  { id: "archivada", label: "Archivadas" },
  { id: "todas", label: "Todas" },
] as const;

const STATUS: Record<string, { label: string; tier: StatusTier }> = {
  nueva: { label: "Nueva", tier: "pending" },
  respondida: { label: "Respondida", tier: "info" },
  archivada: { label: "Archivada", tier: "neutral" },
};

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function MessagesInbox({ messages, canDelete }: { messages: Message[]; canDelete: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("nueva");
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, f.id === "todas" ? messages.length : messages.filter((m) => m.status === f.id).length]),
  );
  const visible = filter === "todas" ? messages : messages.filter((m) => m.status === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filtrar consultas" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-colors duration-150 ease-out",
              filter === f.id ? "bg-grafito text-blanco-roto" : "bg-blanco-roto text-grafito/65 ring-1 ring-grafito/[0.08] hover:text-grafito",
            )}
          >
            {f.label}
            <span className={cn("tabular-nums text-xs", filter === f.id ? "text-blanco-roto/60" : "text-grafito/40")}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {visible.length === 0 ? (
          <EmptyState
            bordered
            text={filter === "nueva" ? "No hay consultas nuevas. ¡Todo respondido!" : "No hay consultas en esta lista."}
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((message) => (
              <li key={message.id}>
                <MessageCard message={message} canDelete={canDelete} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MessageCard({ message, canDelete }: { message: Message; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const { phone, email } = splitContact(message.contact);
  const firstName = message.name.split(" ")[0];
  const reply = `Hola ${firstName}, te escribo de Laura Senmache Negocios Inmobiliarios por tu consulta${
    message.properties ? ` sobre "${message.properties.title}"` : ""
  }.`;
  const wa = whatsappHref(phone, reply);
  const status = STATUS[message.status] ?? STATUS.nueva;

  const update = (next: string) => startTransition(() => setMessageStatus(message.id, next));
  // Opening WhatsApp/email to reply also files the message as answered.
  const markAnswered = () => {
    if (message.status === "nueva") update("respondida");
  };

  return (
    <article
      className={cn(
        "rounded-2xl bg-blanco-roto p-5 ring-1 transition-opacity duration-150 sm:p-6",
        message.status === "nueva" ? "ring-bronce/30" : "ring-grafito/[0.07]",
        isPending && "opacity-50",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[17px] leading-snug text-grafito" style={{ fontWeight: 480 }}>
              {message.name}
            </h3>
            <StatusBadge tier={status.tier} label={status.label} />
          </div>
          <p className="mt-1 text-sm text-grafito/60">
            {phone ? (
              <a href={telHref(phone) ?? undefined} className="hover:text-petroleo">
                {phone}
              </a>
            ) : (
              <a href={`mailto:${email}`} className="hover:text-petroleo">
                {email}
              </a>
            )}
          </p>
        </div>
        <time dateTime={message.created_at} className="text-xs tabular-nums text-grafito/50">
          {dateFormat.format(new Date(message.created_at))}
        </time>
      </header>

      {message.subject || message.properties ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.subject ? <span className={chipClass}>{message.subject}</span> : null}
          {message.properties ? (
            <Link href={`/propiedades/${message.properties.slug}`} target="_blank" className={cn(chipClass, "hover:text-petroleo")}>
              Propiedad: {message.properties.title}
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-grafito/80">{message.message}</p>

      <footer className="-mx-2.5 mt-5 flex flex-wrap items-center gap-1 border-t border-grafito/[0.06] pt-3">
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={markAnswered} className={buttonClass("secondary", "sm")}>
            <IconWhatsapp className="h-3.5 w-3.5" />
            Responder por WhatsApp
          </a>
        ) : null}
        {email ? (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Tu consulta a Laura Senmache Negocios Inmobiliarios")}&body=${encodeURIComponent(reply)}`}
            onClick={markAnswered}
            className={buttonClass("secondary", "sm")}
          >
            <IconMail className="h-3.5 w-3.5" />
            Responder por email
          </a>
        ) : null}
        {message.status !== "respondida" ? (
          <button type="button" onClick={() => update("respondida")} className={buttonClass("ghost", "sm")}>
            Marcar respondida
          </button>
        ) : null}
        {message.status !== "archivada" ? (
          <button type="button" onClick={() => update("archivada")} className={buttonClass("ghost", "sm")}>
            Archivar
          </button>
        ) : (
          <button type="button" onClick={() => update("nueva")} className={buttonClass("ghost", "sm")}>
            Volver a nuevas
          </button>
        )}
        {canDelete ? (
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({ title: "¿Eliminar esta consulta?", confirmLabel: "Eliminar", destructive: true });
              if (ok) startTransition(() => deleteMessage(message.id));
            }}
            className={buttonClass("danger", "sm", "ml-auto")}
          >
            Eliminar
          </button>
        ) : null}
      </footer>
    </article>
  );
}
