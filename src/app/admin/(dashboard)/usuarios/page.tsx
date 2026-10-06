import { UsersList } from "@/components/admin/users-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { getAdminProfiles } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export default async function AdminUsersPage() {
  const role = await getCurrentAdminRole();

  if (role !== "admin") {
    return (
      <div>
        <PageHeader title="Usuarios" />
        <EmptyState className="mt-8" bordered text="Solo un Administrador puede gestionar los usuarios del panel." />
      </div>
    );
  }

  const profiles = await getAdminProfiles();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Usuarios" subtitle="Equipo con acceso a la gestión del negocio." />

      <div className="mt-8">
        <UsersList profiles={profiles} />
      </div>
    </div>
  );
}
