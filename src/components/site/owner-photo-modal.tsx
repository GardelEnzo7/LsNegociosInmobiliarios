"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PropertyImage } from "@/components/site/property-image";
import { IconExpand, IconPortrait } from "@/components/site/icons";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { splitParagraphs } from "@/lib/utils";

type OwnerPhotoModalProps = {
  photoUrl: string | null;
  photoAlt: string | null;
  name: string;
  license: string;
  bio: string;
  quote: string | null;
};

/**
 * The portrait doubles as the trigger for an editorial modal — deliberately
 * not the property gallery's Lightbox (dark full-bleed viewer with
 * prev/next arrows and a thumbnail strip, built for browsing many photos).
 * This is a single expansion of the section itself: same light background,
 * same eyebrow/name/license/bio/quote treatment as the inline copy, just
 * larger, so it reads as "more of this section" rather than a different UI.
 */
export function OwnerPhotoModal({ photoUrl, photoAlt, name, license, bio, quote }: OwnerPhotoModalProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          // Safari doesn't always move focus to a <button> on click (unlike
          // Chrome/Firefox) — focus it explicitly so useFocusTrap captures
          // the right element to restore focus to once the modal closes.
          triggerRef.current?.focus();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`Ver más sobre ${name}`}
        className="group relative aspect-[4/5] w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-piedra/50 outline-none focus-visible:ring-2 focus-visible:ring-petroleo-claro sm:max-w-md lg:max-w-md"
      >
        {photoUrl ? (
          <>
            <PropertyImage
              src={photoUrl}
              alt={photoAlt || name}
              fill
              sizes="(min-width: 1024px) 448px, 90vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              priority
            />
            <span className="absolute inset-0 flex items-center justify-center bg-grafito-dark/0 transition-colors duration-300 ease-out group-hover:bg-grafito-dark/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blanco-roto/95 text-grafito opacity-0 shadow-[0_8px_24px_rgba(28,33,41,0.25)] transition-opacity duration-300 ease-out group-hover:opacity-100">
                <IconExpand className="h-4 w-4" />
              </span>
            </span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-grafito/30">
            <IconPortrait className="h-20 w-20" />
          </div>
        )}
      </button>

      {open
        ? createPortal(
            // Portalled straight to <body>: the trigger sits inside a Reveal
            // wrapper, and Reveal's scroll-in transform (translateY, even at
            // rest) creates a CSS containing block for `position: fixed`
            // descendants — without the portal this dialog would be clipped
            // to the Reveal element's box instead of covering the viewport.
            <div
              className="animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-grafito-dark/70 backdrop-blur-sm sm:p-6"
              style={{ animationDuration: "200ms" }}
              onClick={() => setOpen(false)}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="owner-modal-name"
                onClick={(event) => event.stopPropagation()}
                className="relative flex h-full w-full flex-col overflow-y-auto bg-blanco-roto sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:flex-row sm:overflow-hidden sm:rounded-[28px] sm:shadow-[0_32px_80px_-16px_rgba(28,33,41,0.45)]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-blanco-roto/90 text-grafito shadow-sm transition-colors duration-200 ease-out hover:bg-piedra/60 sm:right-6 sm:top-6"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>

                <div className="relative h-[42vh] w-full shrink-0 bg-piedra/50 sm:h-auto sm:w-[46%]">
                  {photoUrl ? (
                    <PropertyImage
                      src={photoUrl}
                      alt={photoAlt || name}
                      fill
                      sizes="(min-width: 640px) 46vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-grafito/30">
                      <IconPortrait className="h-20 w-20" />
                    </div>
                  )}
                </div>

                <div className="flex-1 px-7 py-10 sm:px-12 sm:py-14 lg:px-16">
                  <p className="font-utility text-[11px] uppercase tracking-[0.24em] text-petroleo">
                    Quién te acompaña
                  </p>
                  <p id="owner-modal-name" className="mt-4 font-display text-4xl leading-[1.05] text-grafito sm:text-5xl">
                    {name}
                  </p>
                  <p className="mt-3 font-utility text-[12px] uppercase tracking-[0.16em] text-petroleo">
                    Fundadora · {license}
                  </p>
                  <div className="mt-7 max-w-md space-y-3">
                    {splitParagraphs(bio).map((paragraph, index) => (
                      <p key={index} className="font-body text-base leading-relaxed text-grafito/70 sm:text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {quote ? (
                    <p className="mt-8 max-w-md border-l-2 border-petroleo/40 pl-5 font-display text-lg italic leading-snug text-grafito/80">
                      &ldquo;{quote}&rdquo;
                    </p>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
