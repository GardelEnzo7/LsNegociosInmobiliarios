import { PropertyForm } from "@/components/admin/property-form";

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Nueva propiedad</h1>
      <p className="mt-1 text-sm text-zinc-500">Completá los datos para publicarla en el sitio.</p>

      <div className="mt-6 max-w-3xl">
        <PropertyForm />
      </div>
    </div>
  );
}
