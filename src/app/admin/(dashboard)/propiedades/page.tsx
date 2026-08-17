import Link from "next/link";
import { PropertiesTable } from "@/components/admin/properties-table";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAllProperties } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export default async function AdminPropertiesPage() {
  const [properties, role] = await Promise.all([getAllProperties(), getCurrentAdminRole()]);

  return (
    <div>
      <PageHeader
        title="Propiedades"
        subtitle={`${properties.length} en total.`}
        action={
          <Link
            href="/admin/propiedades/nueva"
            className="inline-flex items-center rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-150 ease-out hover:bg-grafito-dark active:scale-[0.98]"
          >
            Publicar propiedad
          </Link>
        }
      />

      <div className="mt-6">
        <PropertiesTable properties={properties} canDelete={role === "admin"} />
      </div>
    </div>
  );
}
