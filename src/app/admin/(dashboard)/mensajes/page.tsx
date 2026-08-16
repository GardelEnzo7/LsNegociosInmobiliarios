import { InquiriesList } from "@/components/admin/inquiries-list";
import { getAllInquiries, getActiveAdminProfiles } from "@/lib/data/admin";

export default async function AdminMessagesPage() {
  const [inquiries, admins] = await Promise.all([getAllInquiries(), getActiveAdminProfiles()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Consultas</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Seguimiento comercial de las consultas recibidas desde el sitio y cargadas manualmente.
      </p>

      <div className="mt-6 max-w-3xl">
        <InquiriesList inquiries={inquiries} admins={admins} />
      </div>
    </div>
  );
}
