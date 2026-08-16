import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/property-form";
import { getPropertyById } from "@/lib/data/admin";

type Params = Promise<{ id: string }>;

export default async function EditPropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Editar propiedad</h1>
      <p className="mt-1 text-sm text-zinc-500">{property.title}</p>

      <div className="mt-6 max-w-3xl">
        <PropertyForm property={property} />
      </div>
    </div>
  );
}
