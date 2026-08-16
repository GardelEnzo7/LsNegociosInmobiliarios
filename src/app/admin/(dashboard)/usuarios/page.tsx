import { UsersList } from "@/components/admin/users-list";
import { getAdminProfiles } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export default async function AdminUsersPage() {
  const role = await getCurrentAdminRole();

  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">
          Solo un Administrador puede gestionar los usuarios del panel.
        </p>
      </div>
    );
  }

  const profiles = await getAdminProfiles();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Usuarios del panel</h1>
      <p className="mt-1 text-sm text-zinc-500">Equipo con acceso a la gestión del negocio.</p>

      <div className="mt-6 max-w-3xl">
        <UsersList profiles={profiles} />
      </div>
    </div>
  );
}
