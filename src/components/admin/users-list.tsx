"use client";

import { useActionState, useTransition } from "react";
import { createProfile, deleteProfile, toggleProfileActive, type ProfileFormState } from "@/app/actions/admin-profiles";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
  user_id: string | null;
};

const ROLE_LABELS: Record<string, string> = { admin: "Admin", agente: "Agente" };

const initialState: ProfileFormState = {};

export function UsersList({ profiles }: { profiles: Profile[] }) {
  const [state, formAction, pending] = useActionState(createProfile, initialState);

  return (
    <div className="space-y-6">
      <Panel title="Agregar miembro del equipo">
        <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_1.5fr_1fr_auto] sm:items-end">
          <FormField label="Nombre completo" htmlFor="fullName">
            <input id="fullName" name="fullName" placeholder="Nombre completo" required className={inputClass} />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <input id="email" name="email" type="email" placeholder="Email" required className={inputClass} />
          </FormField>
          <FormField label="Rol" htmlFor="role">
            <SelectShell>
              <select id="role" name="role" defaultValue="agente" className={selectClass}>
                <option value="agente">Agente</option>
                <option value="admin">Admin</option>
              </select>
            </SelectShell>
          </FormField>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-blanco-roto transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
          >
            {pending ? "…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-2 text-sm text-terracota">{state.error}</p> : null}
        <div className="mt-4 rounded-lg bg-bronce/[0.12] px-3 py-2 text-xs leading-relaxed text-bronce">
          Agregar acá a alguien solo crea su perfil (nombre, rol, a qué se le atribuyen propiedades y
          consultas). Para que pueda entrar de verdad al panel: 1) creá su cuenta en el{" "}
          <span className="font-medium">Dashboard de Supabase → Authentication → Users → Add user</span>{" "}
          con este mismo email, y 2) la primera vez que inicie sesión, su cuenta se vincula sola a este
          perfil. Un Administrador tiene acceso a todo; un Agente no puede gestionar otros usuarios ni
          eliminar propiedades o clientes.
        </div>
      </Panel>

      <Panel padded={false}>
        {profiles.length === 0 ? (
          <EmptyState text="Todavía no hay miembros cargados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-grafito/10 bg-piedra/30 text-xs uppercase tracking-wide text-grafito/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Acceso</th>
                  <th className="px-4 py-3 font-medium">Activo</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-grafito/[0.06]">
                {profiles.map((profile) => (
                  <ProfileRow key={profile.id} profile={profile} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function ProfileRow({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <tr className={cn("transition-opacity duration-150", isPending && "opacity-50")}>
      <td className="px-4 py-3">
        <p className="font-medium text-grafito">{profile.full_name}</p>
        <p className="text-xs text-grafito/50">{profile.email}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge label={ROLE_LABELS[profile.role] ?? profile.role} tier="role" />
      </td>
      <td className="px-4 py-3">
        {profile.user_id ? (
          <StatusBadge label="Cuenta vinculada" tier="won" />
        ) : (
          <StatusBadge label="Pendiente" tier="pending" />
        )}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => startTransition(() => toggleProfileActive(profile.id, !profile.active))}
          role="switch"
          aria-checked={profile.active}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200 ease-out",
            profile.active ? "bg-petroleo" : "bg-piedra/60",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-blanco-roto shadow transition-transform duration-200 ease-out",
              profile.active ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: `¿Quitar a "${profile.full_name}" del equipo?`, confirmLabel: "Quitar", destructive: true });
            if (ok) startTransition(() => deleteProfile(profile.id));
          }}
          className="text-xs font-medium text-terracota hover:underline"
        >
          Quitar
        </button>
      </td>
    </tr>
  );
}
