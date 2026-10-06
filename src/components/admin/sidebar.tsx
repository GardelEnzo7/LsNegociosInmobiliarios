"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconBuilding,
  IconKey,
  IconChart,
  IconPortrait,
  IconStar,
} from "@/components/site/icons";
import { IconExternal, IconLogout } from "@/components/admin/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  exact?: boolean;
  adminOnly?: boolean;
};

const OPERATIVE_LINKS: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: IconHome, exact: true },
  { href: "/admin/propiedades", label: "Propiedades", icon: IconBuilding },
];

const MANAGEMENT_LINKS: NavItem[] = [
  { href: "/admin/administraciones", label: "Administraciones", icon: IconKey },
  { href: "/admin/quien-te-acompana", label: "Quién te acompaña", icon: IconStar },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: IconChart },
  { href: "/admin/usuarios", label: "Usuarios", icon: IconPortrait, adminOnly: true },
];

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", agente: "Asesor" };

export function isNavActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({
  role,
  profileName,
}: {
  role?: string | null;
  profileName?: string | null;
}) {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col bg-grafito-dark lg:sticky lg:top-0 lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <Image src="/Logo-3.webp" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
        <div>
          <p className="font-display text-[15px] leading-tight text-blanco-roto" style={{ fontWeight: 480 }}>
            LS Gestión
          </p>
          <p className="mt-0.5 font-utility text-[9px] uppercase tracking-[0.14em] text-petroleo-claro/80">
            Panel inmobiliario
          </p>
        </div>
      </div>

      <AdminNav role={role} />

      <SidebarFooter role={role} profileName={profileName} />
    </aside>
  );
}

/** Link groups shared by the desktop sidebar and the mobile drawer. */
export function AdminNav({
  role,
  size = "md",
  onNavigate,
}: {
  role?: string | null;
  size?: "md" | "lg";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const managementLinks = MANAGEMENT_LINKS.filter((link) => !link.adminOnly || role === "admin");

  return (
    <nav aria-label="Panel" className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
      <ul className="space-y-0.5">
        {OPERATIVE_LINKS.map((link) => (
          <li key={link.href}>
            <NavLink link={link} size={size} active={isNavActive(pathname, link.href, link.exact)} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div>
        <p className="px-3 font-utility text-[10px] font-medium uppercase tracking-[0.12em] text-blanco-roto/35">
          Gestión
        </p>
        <ul className="mt-2 space-y-0.5">
          {managementLinks.map((link) => (
            <li key={link.href}>
              <NavLink link={link} size={size} active={isNavActive(pathname, link.href)} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function NavLink({
  link,
  active,
  size,
  onNavigate,
}: {
  link: NavItem;
  active: boolean;
  size: "md" | "lg";
  onNavigate?: () => void;
}) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 transition-colors duration-150 ease-out",
        size === "lg" ? "min-h-11 text-[15px]" : "h-9 text-sm",
        active
          ? "bg-blanco-roto/[0.08] text-blanco-roto before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:rounded-full before:bg-petroleo-claro"
          : "text-blanco-roto/55 hover:bg-blanco-roto/[0.05] hover:text-blanco-roto/90",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-petroleo-claro" : "text-blanco-roto/40")} />
      <span className="flex-1 truncate">{link.label}</span>
    </Link>
  );
}

export function SidebarFooter({
  role,
  profileName,
  size = "md",
}: {
  role?: string | null;
  profileName?: string | null;
  size?: "md" | "lg";
}) {
  const itemClass = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 text-left text-blanco-roto/55 transition-colors duration-150 ease-out hover:bg-blanco-roto/[0.05] hover:text-blanco-roto/90",
    size === "lg" ? "min-h-11 text-[15px]" : "h-9 text-sm",
  );

  return (
    <div className="border-t border-blanco-roto/[0.08] p-3">
      {profileName ? (
        <div className="mb-1 flex items-center gap-3 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blanco-roto/10 font-display text-sm text-petroleo-claro">
            {profileName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-blanco-roto/90">{profileName}</p>
            <p className="text-[11px] text-blanco-roto/45">{role ? ROLE_LABELS[role] ?? role : ""}</p>
          </div>
        </div>
      ) : null}
      <Link href="/" target="_blank" className={itemClass}>
        <IconExternal className="h-4 w-4 shrink-0 text-blanco-roto/40" />
        Ver sitio público
        <span className="sr-only">(se abre en una pestaña nueva)</span>
      </Link>
      <form action={logout}>
        <button type="submit" className={itemClass}>
          <IconLogout className="h-4 w-4 shrink-0 text-blanco-roto/40" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
