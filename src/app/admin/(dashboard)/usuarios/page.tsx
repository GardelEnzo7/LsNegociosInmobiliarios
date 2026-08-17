import { UsersList } from "@/components/admin/users-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { getAdminProfiles } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export default async function AdminUsersPage() {
  const role = await getCurrentAdminRole();

  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-dashed border-grafito/15 bg-blanco-roto p-10 text-center">
        <p className="text-sm text-grafito/50">
          Solo un Administrador puede gestionar los usuarios del panel.
        </p>
      </div>
    );
  }

  const profiles = await getAdminProfiles();

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Equipo con acceso a la gestión del negocio." />

      <div className="mt-6 max-w-3xl">
        <UsersList profiles={profiles} />
      </div>
    </div>
  );
}
