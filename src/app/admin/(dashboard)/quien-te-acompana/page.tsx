import { AgencyProfileForm } from "@/components/admin/agency-profile-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAgencyProfileAdmin } from "@/lib/data/admin";

export default async function AdminOwnerShowcasePage() {
  const profile = await getAgencyProfileAdmin();

  return (
    <div>
      <PageHeader title="Quién te acompaña" subtitle="Foto y datos de la fundadora en la home." />

      <div className="mt-6 max-w-2xl">
        <AgencyProfileForm profile={profile} />
      </div>
    </div>
  );
}
