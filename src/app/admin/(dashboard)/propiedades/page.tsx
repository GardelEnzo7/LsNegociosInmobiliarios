import Link from "next/link";
import { PropertiesTable } from "@/components/admin/properties-table";
import { getAllProperties } from "@/lib/data/admin";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Propiedades</h1>
          <p className="mt-1 text-sm text-zinc-500">{properties.length} en total.</p>
        </div>
        <Link
          href="/admin/propiedades/nueva"
          className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-200 ease-out hover:bg-grafito-dark active:scale-[0.98]"
        >
          + Nueva propiedad
        </Link>
      </div>

      <div className="mt-6">
        <PropertiesTable properties={properties} />
      </div>
    </div>
  );
}
