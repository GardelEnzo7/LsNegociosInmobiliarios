"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const transparentCapable = pathname === "/";

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!transparentCapable) return;

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentCapable]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = !transparentCapable || scrolled || menuOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-[background-color,box-shadow] duration-300 ease-out",
          solid ? "bg-grafito shadow-[0_4px_20px_-4px_rgba(28,33,41,0.35)]" : "bg-grafito-dark/25",
        )}
      >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <Image src="/Logo.webp" alt="" width={34} height={34} className="h-8 w-8" priority />
          <span className="leading-tight text-blanco-roto">
            <span className="block font-display text-base">{SITE.displayName}</span>
            <span className="block font-utility text-[10px] uppercase tracking-[0.2em] text-blanco-roto/60">
              Negocios Inmobiliarios
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-utility text-[12px] uppercase tracking-[0.14em] text-blanco-roto/85 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative py-1 transition-colors duration-200 ease-out hover:text-blanco-roto",
                isActive(link.href) && "text-blanco-roto",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-petroleo-claro transition-transform duration-200 ease-out group-hover:scale-x-100",
                  isActive(link.href) && "scale-x-100",
                )}
              />
            </Link>
          ))}
        </nav>

        <a
          href={`https://wa.me/${SITE.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 font-utility text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-[background-color,transform] duration-200 ease-out hover:bg-whatsapp-dark active:scale-[0.97] md:inline-flex"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.1c-1.62 0-3.13-.47-4.4-1.28l-.32-.2-3 .79.8-2.93-.21-.3a8.1 8.1 0 0 1-1.27-4.18c0-4.48 3.65-8.12 8.4-8.12 4.74 0 8.4 3.64 8.4 8.12s-3.66 8.1-8.4 8.1Zm4.6-6.08c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.8.98-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.02-.38.11-.51.12-.12.25-.29.38-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.44.06-.67.31s-.88.86-.88 2.1.9 2.44 1.03 2.6c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
          </svg>
          WhatsApp
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className="relative z-10 flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span
            className={cn(
              "absolute h-[1.5px] w-5 bg-blanco-roto transition-transform duration-200 ease-out",
              menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px] rotate-0",
            )}
          />
          <span
            className={cn(
              "absolute h-[1.5px] w-5 bg-blanco-roto transition-[opacity,transform] duration-200 ease-out",
              menuOpen ? "scale-x-0 opacity-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute h-[1.5px] w-5 bg-blanco-roto transition-transform duration-200 ease-out",
              menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px] rotate-0",
            )}
          />
        </button>
      </div>
      </header>

      <div
        className={cn(
          "fixed inset-x-0 top-20 bottom-0 z-30 flex flex-col overflow-hidden bg-grafito transition-[opacity,visibility] duration-300 ease-out md:hidden",
          menuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <Image
          src="/Logo.webp"
          alt=""
          width={420}
          height={420}
          className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 opacity-[0.05]"
        />

        <nav className="relative flex flex-1 flex-col justify-center gap-2 overflow-y-auto px-8">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-baseline gap-4 border-b border-blanco-roto/10 py-6 transition-[opacity,transform] duration-300 ease-out",
                menuOpen ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
              )}
              style={{ transitionDelay: menuOpen ? `${90 + index * 60}ms` : "0ms" }}
            >
              <span className="font-utility text-xs tabular-nums text-petroleo-claro">
                0{index + 1}
              </span>
              <span
                className={cn(
                  "font-display text-4xl transition-transform duration-300 ease-out group-hover:translate-x-2",
                  isActive(link.href) ? "text-petroleo-claro" : "text-blanco-roto",
                )}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div
          className={cn(
            "relative flex flex-col gap-5 border-t border-blanco-roto/10 px-8 pb-10 pt-8 transition-[opacity,transform] duration-300 ease-out",
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
          style={{ transitionDelay: menuOpen ? "320ms" : "0ms" }}
        >
          <a
            href={`https://wa.me/${SITE.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-4 font-utility text-[12px] font-medium uppercase tracking-[0.08em] text-white transition-[background-color,transform] duration-200 ease-out active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.1c-1.62 0-3.13-.47-4.4-1.28l-.32-.2-3 .79.8-2.93-.21-.3a8.1 8.1 0 0 1-1.27-4.18c0-4.48 3.65-8.12 8.4-8.12 4.74 0 8.4 3.64 8.4 8.12s-3.66 8.1-8.4 8.1Z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={`tel:${SITE.phoneDisplay.replace(/[^\d+]/g, "")}`}
            className="block text-center font-body text-sm text-blanco-roto/60"
          >
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    </>
  );
}
