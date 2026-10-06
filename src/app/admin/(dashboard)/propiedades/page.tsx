import Link from "next/link";
import { PropertiesTable } from "@/components/admin/properties-table";
import { PageHeader } from "@/components/admin/ui/page-header";
import { buttonClass } from "@/components/admin/ui/button";
import { IconPlus } from "@/components/admin/ui/icons";
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
            className={buttonClass("primary")}
          >
            <IconPlus className="h-4 w-4" />
            Publicar propiedad
          </Link>
        }
      />

      <div className="mt-8">
        <PropertiesTable properties={properties} canDelete={role === "admin"} />
      </div>
    </div>
  );
}
