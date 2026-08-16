import { UsersList } from "@/components/admin/users-list";
import { getAdminProfiles } from "@/lib/data/admin";

export default async function AdminUsersPage() {
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
