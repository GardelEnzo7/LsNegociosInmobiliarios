"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { OPERATIVE_LINKS, MANAGEMENT_LINKS } from "@/components/admin/sidebar";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function MobileNav({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const managementLinks = MANAGEMENT_LINKS.filter((link) => !link.adminOnly || role === "admin");
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, open);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-30 flex items-center justify-between bg-grafito-dark px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/Logo-3.webp" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
          <p className="font-display text-sm text-blanco-roto" style={{ fontWeight: 480 }}>
            LS Gestión
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-blanco-roto/80 transition-colors duration-150 ease-out hover:bg-blanco-roto/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-grafito-dark/60" onClick={() => setOpen(false)} />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="absolute inset-y-0 left-0 flex w-[82vw] max-w-xs flex-col bg-grafito-dark"
          >
            <div className="flex items-center justify-between border-b border-blanco-roto/10 px-5 py-4">
              <p className="font-display text-[15px] text-blanco-roto" style={{ fontWeight: 480 }}>
                LS Gestión
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-blanco-roto/70 hover:bg-blanco-roto/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
              <div className="space-y-0.5">
                {OPERATIVE_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href, link.exact);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors duration-150 ease-out",
                        active ? "bg-blanco-roto/10 text-blanco-roto" : "text-blanco-roto/60",
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-petroleo-claro" : "text-blanco-roto/40")} />
                      <span className="flex-1">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div>
                <p className="px-3 font-utility text-[10px] font-medium uppercase tracking-[0.12em] text-blanco-roto/35">
                  Gestión
                </p>
                <div className="mt-2 space-y-0.5">
                  {managementLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors duration-150 ease-out",
                          active ? "bg-blanco-roto/10 text-blanco-roto" : "text-blanco-roto/60",
                        )}
                      >
                        <Icon className={cn("h-5 w-5 shrink-0", active ? "text-petroleo-claro" : "text-blanco-roto/40")} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
            <div className="border-t border-blanco-roto/10 p-3">
              <Link
                href="/"
                target="_blank"
                className="block min-h-[44px] rounded-lg px-3 py-2.5 text-[15px] leading-[1.6] text-blanco-roto/50"
              >
                Ver sitio público ↗
              </Link>
              <form action={logout}>
                <button type="submit" className="w-full min-h-[44px] rounded-lg px-3 py-2.5 text-left text-[15px] text-blanco-roto/50">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
