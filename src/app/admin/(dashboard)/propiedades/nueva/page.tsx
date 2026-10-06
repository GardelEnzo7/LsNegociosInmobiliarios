import { PropertyForm } from "@/components/admin/property-form";
import { PageHeader } from "@/components/admin/ui/page-header";

export default function NewPropertyPage() {
  return (
    // Same column as the edit page, so creating and editing read as one form.
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Publicar propiedad"
        subtitle="Completá los datos para publicarla en el sitio."
        back={{ href: "/admin/propiedades", label: "Propiedades" }}
      />

      <div className="mt-8">
        <PropertyForm />
      </div>
    </div>
  );
}
