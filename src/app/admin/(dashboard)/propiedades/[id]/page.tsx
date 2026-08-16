import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { PropertyInternalForm } from "@/components/admin/property-internal-form";
import { PropertyDocumentsPanel } from "@/components/admin/property-documents-panel";
import { PropertyListingsPanel } from "@/components/admin/property-listings-panel";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import {
  getPropertyById,
  getPropertyInternal,
  getPropertyDocuments,
  getPropertyListings,
  getActivityForEntity,
  getContactsForSelect,
  getActiveAdminProfiles,
} from "@/lib/data/admin";
import { formatDateTime } from "@/lib/admin/constants";

type Params = Promise<{ id: string }>;

export default async function EditPropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  const [internal, documents, listings, activity, contacts, admins] = await Promise.all([
    getPropertyInternal(id),
    getPropertyDocuments(id),
    getPropertyListings(id),
    getActivityForEntity("property", id),
    getContactsForSelect(),
    getActiveAdminProfiles(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Editar propiedad</h1>
      <p className="mt-1 text-sm text-zinc-500">{property.title}</p>

      <div className="mt-6 max-w-3xl">
        <PropertyTabs
          panels={{
            general: <PropertyForm property={property} />,
            interna: (
              <PropertyInternalForm propertyId={id} data={internal} contacts={contacts} admins={admins} />
            ),
            documentacion: <PropertyDocumentsPanel propertyId={id} documents={documents} />,
            difusion: (
              <PropertyListingsPanel propertyId={id} listings={listings} isPublished={property.status === "published"} />
            ),
            actividad: (
              <div>
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Fecha de ingreso</p>
                    <p className="mt-0.5 text-zinc-800">{formatDateTime(property.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Última actualización</p>
                    <p className="mt-0.5 text-zinc-800">{formatDateTime(property.updated_at)}</p>
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
