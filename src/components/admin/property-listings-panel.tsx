"use client";

import { useTransition } from "react";
import { upsertPropertyListing } from "@/app/actions/property-listings";
import { LISTING_STATUS_LABELS, LISTING_STATUS_TIERS } from "@/lib/admin/constants";
import { StatusBadge, StatusSelect } from "@/components/admin/status-badge";
import { Panel } from "@/components/admin/ui/panel";

const CHANNEL_LABELS: Record<string, string> = {
  web_ls: "Sitio web LS",
  zonaprop: "Zonaprop",
  mercadolibre: "Mercado Libre Inmuebles",
  otro: "Otro portal",
};

const LISTING_STATUS_OPTIONS = Object.entries(LISTING_STATUS_LABELS).map(([value, label]) => ({ value, label }));

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
    <Panel>
      <div className="rounded-lg bg-bronce/[0.12] px-4 py-3 text-xs text-bronce">
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
    </Panel>
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
    <div className="rounded-xl border border-grafito/10 bg-blanco-roto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-grafito/80">{label}</p>
        {readOnly ? (
          <StatusBadge tier={LISTING_STATUS_TIERS[status]} label={LISTING_STATUS_LABELS[status]} />
        ) : (
          <StatusSelect
            value={status}
            tier={LISTING_STATUS_TIERS[status]}
            options={LISTING_STATUS_OPTIONS}
            disabled={isPending}
            ariaLabel={`Estado de la publicación en ${label}`}
            onChange={(value) =>
              startTransition(() =>
                void upsertPropertyListing(propertyId!, channel!, {
                  status: value,
                  externalUrl: externalUrl ?? undefined,
                  notes: notes ?? undefined,
                }),
              )
            }
          />
        )}
      </div>
      {readOnly ? (
        <p className="mt-2 text-xs text-grafito/40">
          Se actualiza automáticamente según el estado de publicación del sitio.
        </p>
      ) : integrationNote ? (
        <p className="mt-2 text-xs text-grafito/40">{integrationNote}</p>
      ) : null}
    </div>
  );
}
