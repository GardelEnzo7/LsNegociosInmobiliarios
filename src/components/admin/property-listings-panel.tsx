"use client";

import { useTransition } from "react";
import { upsertPropertyListing } from "@/app/actions/property-listings";
import { cn } from "@/lib/utils";

const CHANNEL_LABELS: Record<string, string> = {
  web_ls: "Sitio web LS",
  zonaprop: "Zonaprop",
  mercadolibre: "Mercado Libre Inmuebles",
  otro: "Otro portal",
};

const STATUS_LABELS: Record<string, string> = {
  publicada: "Publicada",
  no_publicada: "No publicada",
  pendiente: "Pendiente",
  error: "Error",
};

const STATUS_STYLES: Record<string, string> = {
  publicada: "bg-emerald-50 text-emerald-700",
  no_publicada: "bg-zinc-100 text-zinc-500",
  pendiente: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-600",
};

const INTEGRATION_NOTES: Record<string, string> = {
  zonaprop:
    "Requiere una cuenta partner de Zonaprop y acceso a su feed/API oficial. Hasta tener esas credenciales, el estado se actualiza manualmente acá.",
  mercadolibre:
    "Requiere alta como publicador en la API de Mercado Libre Inmuebles (credenciales OAuth). Hasta tener esas credenciales, el estado se actualiza manualmente acá.",
};

type Listing = {
  channel: string;
  status: string;
  external_url: string | null;
  notes: string | null;
};

export function PropertyListingsPanel({
  propertyId,
  listings,
  isPublished,
}: {
  propertyId: string;
  listings: Listing[];
  isPublished: boolean;
}) {
  const byChannel = new Map(listings.map((l) => [l.channel, l]));

  return (
    <div>
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
        No hay integraciones automáticas activas todavía. Esta sección es un panel de seguimiento manual,
        preparado para conectarse a APIs oficiales cuando estén disponibles las credenciales.
      </div>

      <div className="mt-4 space-y-3">
        <ListingRow
          channel="web_ls"
          label={CHANNEL_LABELS.web_ls}
          status={isPublished ? "publicada" : "no_publicada"}
          externalUrl={null}
          notes={null}
          readOnly
        />
        {(["zonaprop", "mercadolibre", "otro"] as const).map((channel) => {
          const listing = byChannel.get(channel);
          return (
            <ListingRow
              key={channel}
              propertyId={propertyId}
              channel={channel}
              label={CHANNEL_LABELS[channel]}
              status={listing?.status ?? "no_publicada"}
              externalUrl={listing?.external_url ?? null}
              notes={listing?.notes ?? null}
              integrationNote={INTEGRATION_NOTES[channel]}
            />
          );
        })}
      </div>
    </div>
  );
}

function ListingRow({
  propertyId,
  channel,
  label,
  status,
  externalUrl,
  notes,
  readOnly,
  integrationNote,
}: {
  propertyId?: string;
  channel?: string;
  label: string;
  status: string;
  externalUrl: string | null;
  notes: string | null;
  readOnly?: boolean;
  integrationNote?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {readOnly ? (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[status])}>
            {STATUS_LABELS[status]}
          </span>
        ) : (
          <select
            defaultValue={status}
            disabled={isPending}
            onChange={(event) =>
              startTransition(() =>
                upsertPropertyListing(propertyId!, channel!, {
                  status: event.target.value,
                  externalUrl: externalUrl ?? undefined,
                  notes: notes ?? undefined,
                }),
              )
            }
            className={cn(
              "rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none",
              STATUS_STYLES[status],
            )}
          >
            {Object.entries(STATUS_LABELS).map(([value, l]) => (
              <option key={value} value={value}>
                {l}
              </option>
            ))}
          </select>
        )}
      </div>
      {readOnly ? (
        <p className="mt-2 text-xs text-zinc-400">
          Se actualiza automáticamente según el estado de publicación del sitio.
        </p>
      ) : integrationNote ? (
        <p className="mt-2 text-xs text-zinc-400">{integrationNote}</p>
      ) : null}
    </div>
  );
}
