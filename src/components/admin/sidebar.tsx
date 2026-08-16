"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/propiedades", label: "Propiedades" },
  { href: "/admin/visitas", label: "Visitas" },
  { href: "/admin/administraciones", label: "Administraciones" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/mensajes", label: "Consultas" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
  { href: "/admin/usuarios", label: "Usuarios", adminOnly: true },
];

export function Sidebar({ unreadCount = 0, role }: { unreadCount?: number; role?: string | null }) {
  const pathname = usePathname();
  const visibleLinks = LINKS.filter((link) => !link.adminOnly || role === "admin");

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-zinc-200 px-5 py-5">
        <Image src="/Logo-3.webp" alt="" width={24} height={24} className="h-6 w-6" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-petroleo">LS</p>
          <p className="text-sm font-semibold text-zinc-900">Panel de administración</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out",
                active ? "bg-petroleo/10 font-medium text-petroleo" : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {link.label}
              {link.href === "/admin/mensajes" && unreadCount > 0 ? (
                <span className="rounded-full bg-petroleo px-2 py-0.5 text-[11px] font-medium text-white">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <Link
          href="/"
          target="_blank"
          className="block rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors duration-150 ease-out hover:bg-zinc-100"
        >
          Ver sitio público ↗
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition-colors duration-150 ease-out hover:bg-zinc-100"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
