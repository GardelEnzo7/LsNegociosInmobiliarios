"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteMessage, markMessageRead } from "@/app/actions/messages";
import { convertMessageToLead } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

type MessageRow = {
  id: string;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  created_at: string;
  properties: { title: string; slug: string } | null;
};

export function MessagesList({ messages }: { messages: MessageRow[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Todavía no llegaron consultas desde el sitio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageCard({ message }: { message: MessageRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-opacity duration-150",
        message.read ? "border-zinc-200" : "border-petroleo/30 bg-petroleo/[0.03]",
        isPending && "opacity-50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-zinc-900">{message.name}</p>
            {!message.read ? (
              <span className="rounded-full bg-petroleo/10 px-2 py-0.5 text-[11px] font-medium text-petroleo">
                Pendiente
              </span>
            ) : (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                Atendida
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">{message.contact}</p>
          {message.properties ? (
            <Link
              href={`/propiedades/${message.properties.slug}`}
              target="_blank"
              className="mt-1 inline-block text-xs text-petroleo hover:underline"
            >
              Sobre: {message.properties.title}
            </Link>
          ) : null}
        </div>
        <p className="text-xs text-zinc-400">
          {new Date(message.created_at).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-700">{message.message}</p>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => startTransition(() => markMessageRead(message.id, !message.read))}
          className="text-xs font-medium text-petroleo hover:underline"
        >
          {message.read ? "Marcar como pendiente" : "Marcar como atendida"}
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => convertMessageToLead(message.id))}
          className="text-xs font-medium text-grafito hover:underline"
        >
          Convertir a cliente
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Eliminar este mensaje?")) {
              startTransition(() => deleteMessage(message.id));
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
