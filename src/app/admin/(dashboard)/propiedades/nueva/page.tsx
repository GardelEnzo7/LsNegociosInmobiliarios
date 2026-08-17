import { PropertyForm } from "@/components/admin/property-form";
import { PageHeader } from "@/components/admin/ui/page-header";

export default function NewPropertyPage() {
  return (
    <div>
      <PageHeader title="Publicar propiedad" subtitle="Completá los datos para publicarla en el sitio." />

      <div className="mt-6 max-w-3xl">
        <PropertyForm />
      </div>
    </div>
  );
}
