import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { PropertyInternalForm } from "@/components/admin/property-internal-form";
import { PropertyDocumentsPanel } from "@/components/admin/property-documents-panel";
import { PropertyListingsPanel } from "@/components/admin/property-listings-panel";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  getPropertyById,
  getPropertyInternal,
  getPropertyDocuments,
  getPropertyListings,
  getActivityForEntity,
  getContactsForSelect,
  getActiveAdminProfiles,
} from "@/lib/data/admin";
import { AVAILABILITY_LABELS, AVAILABILITY_TIERS, formatDateTime } from "@/lib/admin/constants";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

type Params = Promise<{ id: string }>;

export default async function EditPropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  const [internal, documents, listings, activity, contacts, admins, role] = await Promise.all([
    getPropertyInternal(id),
    getPropertyDocuments(id),
    getPropertyListings(id),
    getActivityForEntity("property", id),
    getContactsForSelect(),
    getActiveAdminProfiles(),
    getCurrentAdminRole(),
  ]);

  const cover = property.property_images?.[0];

  return (
    <div>
      <Link href="/admin/propiedades" className="text-xs font-medium text-petroleo hover:underline">
        ← Propiedades
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl bg-blanco-roto p-4 ring-1 ring-grafito/[0.06]">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-piedra">
          {cover ? <Image src={cover.url} alt="" fill sizes="80px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[19px] leading-[1.25] text-grafito" style={{ fontWeight: 480 }}>
              {property.title}
            </h1>
            {property.availability !== "disponible" ? (
              <StatusBadge tier={AVAILABILITY_TIERS[property.availability]} label={AVAILABILITY_LABELS[property.availability]} />
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-grafito/50">
            {OPERATION_LABELS[property.operation]} · {PROPERTY_TYPE_LABELS[property.property_type]} · {property.neighborhood}
          </p>
        </div>
        <p className="font-display text-2xl tabular-nums text-grafito" style={{ fontWeight: 460 }}>
          {formatPrice(property.price, property.currency as "USD" | "ARS")}
        </p>
      </div>

      <div className="mt-6">
        <PropertyTabs
          panels={{
            general: <PropertyForm property={property} />,
            interna: (
              <PropertyInternalForm propertyId={id} data={internal} contacts={contacts} admins={admins} />
            ),
            documentacion: (
              <PropertyDocumentsPanel propertyId={id} documents={documents} canDelete={role === "admin"} />
            ),
            difusion: (
              <PropertyListingsPanel propertyId={id} listings={listings} isPublished={property.status === "published"} />
            ),
            actividad: (
              <div>
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-2xl bg-blanco-roto p-4 ring-1 ring-grafito/[0.06] text-sm">
                  <div>
                    <p className="text-xs font-medium text-grafito/45">Fecha de ingreso</p>
                    <p className="mt-0.5 text-grafito">{formatDateTime(property.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-grafito/45">Última actualización</p>
                    <p className="mt-0.5 text-grafito">{formatDateTime(property.updated_at)}</p>
                  </div>
                </div>
                <ActivityTimeline events={activity} />
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
