"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PropertyImage } from "@/components/site/property-image";

type GalleryImage = { id: string; url: string; alt: string | null };

function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!start.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.current.x;
    const deltaY = touch.clientY - start.current.y;
    start.current = null;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX < 0) onLeft();
    else onRight();
  };

  return { onTouchStart, onTouchEnd };
}

export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const prev = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    setLightboxIndex((current) => (current === null ? null : (current + 1) % images.length));
  }, [images.length]);
  const close = useCallback(() => setLightboxIndex(null), []);
  const mobileSwipe = useSwipe(
    () => setMobileIndex((i) => (i + 1) % images.length),
    () => setMobileIndex((i) => (i - 1 + images.length) % images.length),
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, close, prev, next]);

  if (images.length === 0) return null;

  // Fixed mosaic shape: 1 large + 1 medium + 2 small, regardless of how many
  // total photos exist — extra photos live behind "Ver todas las fotos".
  const secondary = images.slice(1, 4);

  return (
    <>
      {/* Mobile: single swipeable hero image with dot progress */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setLightboxIndex(mobileIndex)}
          onTouchStart={mobileSwipe.onTouchStart}
          onTouchEnd={mobileSwipe.onTouchEnd}
          className="relative block aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-piedra"
          aria-label="Ampliar foto"
        >
          <PropertyImage
            src={images[mobileIndex].url}
            alt={images[mobileIndex].alt || title}
            fill
            sizes="calc(100vw - 48px)"
            className="object-cover"
            priority
          />
        </button>
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((image, i) => (
              <span
                key={image.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 ease-out",
                  i === mobileIndex ? "w-5 bg-petroleo" : "w-1.5 bg-piedra",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: 1 large + 1 medium + 2 small mosaic */}
      <div className="hidden gap-2 overflow-hidden rounded-2xl sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:aspect-[16/8]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className={cn(
            "group relative col-span-4 row-span-2 overflow-hidden bg-piedra",
            secondary.length > 0 && "sm:col-span-2",
          )}
          aria-label="Ampliar foto principal"
        >
          <PropertyImage
            src={images[0].url}
            alt={images[0].alt || title}
            fill
            sizes="(min-width: 1280px) 620px, (min-width: 640px) 48vw, calc(100vw - 48px)"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            priority
          />
        </button>

        {secondary.map((image, i) => {
          const isMedium = i === 0;
          const isLast = i === secondary.length - 1;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightboxIndex(i + 1)}
              className={cn(
                "group relative overflow-hidden bg-piedra",
                secondary.length === 1 && "col-span-2 row-span-2",
                secondary.length >= 2 && isMedium && "col-span-1 row-span-2",
                secondary.length === 2 && !isMedium && "col-span-1 row-span-2",
                secondary.length === 3 && !isMedium && "col-span-1 row-span-1",
              )}
              aria-label={`Ver foto ${i + 2}`}
            >
              <PropertyImage
                src={image.url}
                alt={image.alt || title}
                fill
                sizes="(min-width: 1280px) 310px, (min-width: 640px) 24vw, calc(100vw - 48px)"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              {isLast ? (
                <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-grafito-dark/70 px-2.5 py-1.5 font-utility text-[10px] font-medium uppercase tracking-[0.05em] text-blanco-roto backdrop-blur-sm transition-colors duration-200 ease-out group-hover:bg-grafito-dark/90">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  Ver todas las fotos
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          title={title}
          index={lightboxIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
          onSelect={setLightboxIndex}
        />
      ) : null}
    </>
  );
}

function Lightbox({
  images,
  title,
  index,
  onClose,
  onPrev,
  onNext,
  onSelect,
}: {
  images: GalleryImage[];
  title: string;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  const image = images[index];
  const swipe = useSwipe(onNext, onPrev);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  return (
    <div
      className="animate-fade-up fixed inset-0 z-50 flex flex-col bg-grafito-dark/95 backdrop-blur-sm"
      style={{ animationDuration: "200ms" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de fotos de ${title}`}
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-utility text-[12px] uppercase tracking-[0.14em] text-blanco-roto/60">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="font-utility text-[12px] uppercase tracking-[0.14em] text-blanco-roto/80 transition-colors duration-200 ease-out hover:text-petroleo-claro"
        >
          Cerrar ✕
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1 px-4 sm:px-16"
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Foto anterior"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-blanco-roto/70 transition-colors duration-200 ease-out hover:text-petroleo-claro sm:left-6"
        >
          ←
        </button>

        <div
          className="relative mx-auto h-full max-w-4xl select-none touch-pan-y"
          onClick={(event) => event.stopPropagation()}
        >
          <PropertyImage
            src={image.url}
            alt={image.alt || title}
            fill
            sizes="(min-width: 896px) 896px, calc(100vw - 32px)"
            className="object-contain"
            priority
          />
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Foto siguiente"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-blanco-roto/70 transition-colors duration-200 ease-out hover:text-petroleo-claro sm:right-6"
        >
          →
        </button>
      </div>

      {images.length > 1 ? (
        <div
          className="shrink-0 overflow-x-auto px-4 pb-6 pt-4 sm:px-10"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto flex max-w-4xl gap-2">
            {images.map((thumb, i) => (
              <button
                key={thumb.id}
                ref={i === index ? activeThumbRef : undefined}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Ir a la foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity duration-200 ease-out sm:h-16 sm:w-24",
                  i === index ? "opacity-100 ring-2 ring-petroleo-claro" : "opacity-40 hover:opacity-80",
                )}
              >
                <PropertyImage src={thumb.url} alt="" fill sizes="(min-width: 640px) 96px, 80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
