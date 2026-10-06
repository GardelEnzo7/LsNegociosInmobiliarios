import Image from "next/image";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { PropertyInternalForm } from "@/components/admin/property-internal-form";
import { PropertyDocumentsPanel } from "@/components/admin/property-documents-panel";
import { PropertyListingsPanel } from "@/components/admin/property-listings-panel";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { Panel } from "@/components/admin/ui/panel";
import { labelClass } from "@/components/admin/ui/form-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { BackLink } from "@/components/admin/ui/page-header";
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
    // Same column as /nueva, so creating and editing read as one form.
    <div className="mx-auto max-w-4xl">
      <BackLink href="/admin/propiedades" label="Propiedades" />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-blanco-roto p-4 ring-1 ring-grafito/[0.07] sm:p-5">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-piedra sm:h-[72px] sm:w-24">
          {cover ? <Image src={cover.url} alt="" fill sizes="96px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[20px] leading-[1.25] text-grafito sm:text-[22px]" style={{ fontWeight: 480 }}>
              {property.title}
            </h1>
            {property.status === "draft" ? <StatusBadge tier="pending" label="Borrador" /> : null}
            {property.availability !== "disponible" ? (
              <StatusBadge tier={AVAILABILITY_TIERS[property.availability]} label={AVAILABILITY_LABELS[property.availability]} />
            ) : null}
          </div>
          <p className="mt-1 text-sm text-grafito/55">
            {OPERATION_LABELS[property.operation]} · {PROPERTY_TYPE_LABELS[property.property_type]} · {property.neighborhood}
          </p>
        </div>
        <p className="w-full font-display text-2xl tabular-nums text-grafito sm:w-auto" style={{ fontWeight: 460 }}>
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
                <Panel>
                  <dl className="grid grid-cols-2 gap-4 border-b border-grafito/[0.06] pb-5 text-sm">
                    <div>
                      <dt className={labelClass}>Fecha de ingreso</dt>
                      <dd className="mt-1 text-grafito">{formatDateTime(property.created_at)}</dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Última actualización</dt>
                      <dd className="mt-1 text-grafito">{formatDateTime(property.updated_at)}</dd>
                    </div>
                  </dl>
                  <div className="pt-5">
                    <ActivityTimeline events={activity} />
                  </div>
                </Panel>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
