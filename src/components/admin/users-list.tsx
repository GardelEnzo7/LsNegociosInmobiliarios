"use client";

import { useActionState, useTransition } from "react";
import { createProfile, deleteProfile, toggleProfileActive, type ProfileFormState } from "@/app/actions/admin-profiles";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
};

const initialState: ProfileFormState = {};

export function UsersList({ profiles }: { profiles: Profile[] }) {
  const [state, formAction, pending] = useActionState(createProfile, initialState);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Agregar miembro del equipo</h2>
        <form action={formAction} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_1.5fr_1fr_auto]">
          <input
            name="fullName"
            placeholder="Nombre completo"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition-colors duration-200 ease-out focus:border-petroleo"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition-colors duration-200 ease-out focus:border-petroleo"
          />
          <select
            name="role"
            defaultValue="agente"
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition-colors duration-200 ease-out focus:border-petroleo"
          >
            <option value="agente">Agente</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-grafito px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-out hover:bg-grafito-dark disabled:opacity-60"
          >
            {pending ? "..." : "Agregar"}
          </button>
        </form>
        {state.error ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}
        <p className="mt-3 text-xs text-zinc-400">
          Este registro es organizativo (a quién se le atribuyen leads y propiedades). El único
          acceso real de login al panel sigue siendo la cuenta demo.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {profiles.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500">Todavía no hay miembros cargados.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Activo</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {profiles.map((profile) => (
                <ProfileRow key={profile.id} profile={profile} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className={cn("transition-opacity duration-150", isPending && "opacity-50")}>
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-900">{profile.full_name}</p>
        <p className="text-xs text-zinc-500">{profile.email}</p>
      </td>
      <td className="px-4 py-3 capitalize text-zinc-700">{profile.role}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => startTransition(() => toggleProfileActive(profile.id, !profile.active))}
          role="switch"
          aria-checked={profile.active}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200 ease-out",
            profile.active ? "bg-petroleo" : "bg-zinc-200",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out",
              profile.active ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Quitar a "${profile.full_name}" del equipo?`)) {
              startTransition(() => deleteProfile(profile.id));
            }
          }}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Quitar
        </button>
      </td>
    </tr>
  );
}
