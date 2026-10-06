"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AdminNav, SidebarFooter } from "@/components/admin/sidebar";
import { IconClose, IconMenu } from "@/components/admin/ui/icons";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function MobileNav({ role, profileName }: { role?: string | null; profileName?: string | null }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="sticky top-0 z-30 lg:hidden">
      <div className="flex h-14 items-center justify-between bg-grafito-dark pl-4 pr-1.5">
        <div className="flex items-center gap-2.5">
          <Image src="/Logo-3.webp" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
          <p className="font-display text-[15px] text-blanco-roto" style={{ fontWeight: 480 }}>
            LS Gestión
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-blanco-roto/80 transition-colors duration-150 ease-out hover:bg-blanco-roto/10"
        >
          <IconMenu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-grafito-dark/60 animate-[fade-up_180ms_var(--ease-out)]" onClick={() => setOpen(false)} />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="absolute inset-y-0 left-0 flex w-[82vw] max-w-xs flex-col bg-grafito-dark shadow-[16px_0_40px_-20px_rgba(0,0,0,0.5)]"
          >
            <div className="flex h-14 items-center justify-between pl-5 pr-1.5">
              <div className="flex items-center gap-2.5">
                <Image src="/Logo-3.webp" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                <p className="font-display text-[15px] text-blanco-roto" style={{ fontWeight: 480 }}>
                  LS Gestión
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-blanco-roto/70 transition-colors duration-150 ease-out hover:bg-blanco-roto/10"
              >
                <IconClose className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col pt-4">
              <AdminNav role={role} size="lg" onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter role={role} profileName={profileName} size="lg" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
