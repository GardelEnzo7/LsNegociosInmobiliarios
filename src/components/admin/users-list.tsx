"use client";

import { useActionState, useTransition } from "react";
import { createProfile, deleteProfile, toggleProfileActive, type ProfileFormState } from "@/app/actions/admin-profiles";
import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Notice } from "@/components/admin/ui/notice";
import { Switch } from "@/components/admin/ui/switch";
import { buttonClass } from "@/components/admin/ui/button";
import { FormField, SelectShell, inputClass, selectClass } from "@/components/admin/ui/form-field";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";
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
    <div className="space-y-5">
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
          <button type="submit" disabled={pending} className={buttonClass("primary")}>
            {pending ? "…" : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-3 text-sm text-terracota">{state.error}</p> : null}
        <Notice className="mt-5">
          Agregar acá a alguien solo crea su perfil (nombre, rol, a qué se le atribuyen propiedades y
          consultas). Para que pueda entrar de verdad al panel: 1) creá su cuenta en el{" "}
          <span className="font-medium text-grafito/80">Dashboard de Supabase → Authentication → Users → Add user</span>{" "}
          con este mismo email, y 2) la primera vez que inicie sesión, su cuenta se vincula sola a este
          perfil. Un Administrador tiene acceso a todo; un Agente no puede gestionar otros usuarios ni
          eliminar propiedades o administraciones.
        </Notice>
      </Panel>

      <Panel padded={false} className="overflow-hidden">
        {profiles.length === 0 ? (
          <EmptyState text="Todavía no hay miembros cargados." />
        ) : (
          <TableShell>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Rol</th>
                <th className={thClass}>Acceso</th>
                <th className={thClass}>Activo</th>
                <th className={thClass}>
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {profiles.map((profile) => (
                <ProfileRow key={profile.id} profile={profile} />
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}

function ProfileRow({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <tr className={cn(trClass, "transition-opacity duration-150", isPending && "opacity-50")}>
      <Td>
        <p className="font-medium text-grafito">{profile.full_name}</p>
        <p className="mt-0.5 text-xs text-grafito/50">{profile.email}</p>
      </Td>
      <Td>
        <StatusBadge label={ROLE_LABELS[profile.role] ?? profile.role} tier="role" />
      </Td>
      <Td>
        {profile.user_id ? (
          <StatusBadge label="Cuenta vinculada" tier="won" />
        ) : (
          <StatusBadge label="Pendiente" tier="pending" />
        )}
      </Td>
      <Td>
        <Switch
          checked={profile.active}
          onClick={() => startTransition(() => toggleProfileActive(profile.id, !profile.active))}
          ariaLabel={`${profile.active ? "Desactivar" : "Activar"} a ${profile.full_name}`}
        />
      </Td>
      <Td className="text-right">
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: `¿Quitar a "${profile.full_name}" del equipo?`, confirmLabel: "Quitar", destructive: true });
            if (ok) startTransition(() => deleteProfile(profile.id));
          }}
          className={buttonClass("danger", "sm", "-mr-2.5")}
        >
          Quitar
        </button>
      </Td>
    </tr>
  );
}
