import { InquiriesList } from "@/components/admin/inquiries-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAllInquiries, getActiveAdminProfiles } from "@/lib/data/admin";

export default async function AdminMessagesPage() {
  const [inquiries, admins] = await Promise.all([getAllInquiries(), getActiveAdminProfiles()]);

  return (
    <div>
      <PageHeader title="Consultas" subtitle="Seguimiento de las consultas recibidas desde el sitio y cargadas a mano." />

      <div className="mt-6 max-w-3xl">
        <InquiriesList inquiries={inquiries} admins={admins} />
      </div>
    </div>
  );
}
