"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconBell,
  IconCalendar,
  IconBuilding,
  IconUsers,
  IconKey,
  IconChart,
  IconPortrait,
} from "@/components/site/icons";

const OPERATIVE_LINKS = [
  { href: "/admin", label: "Resumen", icon: IconHome, exact: true },
  { href: "/admin/mensajes", label: "Consultas", icon: IconBell, badge: true },
  { href: "/admin/visitas", label: "Visitas", icon: IconCalendar },
  { href: "/admin/propiedades", label: "Propiedades", icon: IconBuilding },
  { href: "/admin/clientes", label: "Clientes", icon: IconUsers },
];

const MANAGEMENT_LINKS = [
  { href: "/admin/administraciones", label: "Administraciones", icon: IconKey },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: IconChart },
  { href: "/admin/usuarios", label: "Usuarios", icon: IconPortrait, adminOnly: true },
];

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", agente: "Asesor" };

export function Sidebar({
  unreadCount = 0,
  role,
  profileName,
}: {
  unreadCount?: number;
  role?: string | null;
  profileName?: string | null;
}) {
  const pathname = usePathname();
  const managementLinks = MANAGEMENT_LINKS.filter((link) => !link.adminOnly || role === "admin");

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-grafito-dark lg:sticky lg:top-0 lg:flex">
      <div className="flex items-center gap-2.5 border-b border-blanco-roto/10 px-5 py-5">
        <Image src="/Logo-3.webp" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
        <div>
          <p className="font-display text-[15px] leading-tight text-blanco-roto" style={{ fontWeight: 480 }}>
            LS Gestión
          </p>
          <p className="font-utility text-[9px] uppercase tracking-[0.14em] text-petroleo-claro">
            Panel inmobiliario
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-0.5">
          {OPERATIVE_LINKS.map((link) => (
            <NavLink key={link.href} link={link} active={isActive(link.href, link.exact)} unreadCount={unreadCount} />
          ))}
        </div>

        <div>
          <p className="px-3 font-utility text-[10px] font-medium uppercase tracking-[0.12em] text-blanco-roto/35">
            Gestión
          </p>
          <div className="mt-2 space-y-0.5">
            {managementLinks.map((link) => (
              <NavLink key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-blanco-roto/10 p-3">
        {profileName ? (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blanco-roto/10 font-display text-sm text-petroleo-claro">
              {profileName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-blanco-roto/90">{profileName}</p>
              <p className="text-[11px] text-blanco-roto/40">{role ? ROLE_LABELS[role] ?? role : ""}</p>
            </div>
          </div>
        ) : null}
        <Link
          href="/"
          target="_blank"
          className="block rounded-lg px-3 py-2 text-sm text-blanco-roto/50 transition-colors duration-150 ease-out hover:bg-blanco-roto/[0.06] hover:text-blanco-roto/80"
        >
          Ver sitio público ↗
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-blanco-roto/50 transition-colors duration-150 ease-out hover:bg-blanco-roto/[0.06] hover:text-blanco-roto/80"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  link,
  active,
  unreadCount,
}: {
  link: { href: string; label: string; icon: (props: { className?: string }) => React.ReactElement; badge?: boolean };
  active: boolean;
  unreadCount?: number;
}) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ease-out",
        active ? "bg-blanco-roto/10 text-blanco-roto" : "text-blanco-roto/55 hover:bg-blanco-roto/[0.06] hover:text-blanco-roto/85",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-petroleo-claro" : "text-blanco-roto/40")} />
      <span className="flex-1">{link.label}</span>
      {link.badge && unreadCount ? (
        <span className="rounded-full bg-petroleo-claro px-2 py-0.5 font-utility text-[10px] font-medium text-grafito-dark">
          {unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

export { OPERATIVE_LINKS, MANAGEMENT_LINKS };
