"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PriceRangesByCurrency } from "@/lib/data/properties";
import { cn, formatPrice } from "@/lib/utils";
import { IconChevronDown } from "@/components/site/icons";

type Currency = "USD" | "ARS";
const CURRENCIES: Currency[] = ["USD", "ARS"];

type PriceRangeFilterProps = {
  ranges: PriceRangesByCurrency;
  defaultCurrency?: string;
  defaultMin?: number;
  defaultMax?: number;
  variant?: "hero" | "bar";
};

function isValidCurrency(value: string | undefined, ranges: PriceRangesByCurrency): value is Currency {
  return (value === "USD" || value === "ARS") && Boolean(ranges[value]);
}

/**
 * Dual-range price slider, currency-scoped. The currency starts UNSELECTED
 * (same "blank = no filter" convention as the other selects in this filter
 * bar) — that's what keeps the form's own default state from silently
 * turning into an active currency+price filter the first time someone hits
 * "Buscar"/"Filtrar" for an unrelated reason (e.g. just picking a zona).
 * Only once the admin — sorry, the visitor — actually picks USD/ARS does
 * `moneda` (and precioMin/precioMax) get submitted with a real value.
 *
 * The slider itself lives in a floating dropdown (closed by default) so this
 * field takes the same closed-state height as the other filters — the range
 * inputs stay mounted at all times (just visually hidden while closed) so
 * their value keeps being the one the form actually submits.
 */
export function PriceRangeFilter({
  ranges,
  defaultCurrency,
  defaultMin,
  defaultMax,
  variant = "hero",
}: PriceRangeFilterProps) {
  const initialCurrency = isValidCurrency(defaultCurrency, ranges) ? defaultCurrency : null;
  const [currency, setCurrency] = useState<Currency | null>(initialCurrency);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Bounds to *display* — falls back to whichever currency has data so the
  // slider isn't empty before the visitor picks one explicitly.
  const displayCurrency = currency ?? CURRENCIES.find((c) => ranges[c]) ?? null;
  const bounds = displayCurrency ? ranges[displayCurrency] : null;

  const [minVal, setMinVal] = useState(() => {
    if (!bounds) return 0;
    return currency && defaultMin != null ? clamp(defaultMin, bounds.min, bounds.max) : bounds.min;
  });
  const [maxVal, setMaxVal] = useState(() => {
    if (!bounds) return 0;
    return currency && defaultMax != null ? clamp(defaultMax, bounds.min, bounds.max) : bounds.max;
  });

  const step = useMemo(() => {
    if (!bounds) return 1;
    return Math.max(1, Math.round((bounds.max - bounds.min) / 100));
  }, [bounds]);

  function handleCurrencyPick(next: Currency) {
    const nextBounds = ranges[next];
    if (!nextBounds) return;
    setCurrency(next);
    setMinVal(nextBounds.min);
    setMaxVal(nextBounds.max);
  }

  // Dragging is itself a clear signal of intent — it implicitly "picks" the
  // currency currently on display, so the value actually gets submitted.
  function handleMinChange(value: number) {
    if (!bounds || !displayCurrency) return;
    if (!currency) setCurrency(displayCurrency);
    setMinVal(Math.min(value, maxVal));
  }
  function handleMaxChange(value: number) {
    if (!bounds || !displayCurrency) return;
    if (!currency) setCurrency(displayCurrency);
    setMaxVal(Math.max(value, minVal));
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isHero = variant === "hero";
  const label = (
    <span className="whitespace-nowrap font-utility text-[10px] uppercase tracking-[0.14em] text-grafito/45">
      Precio
    </span>
  );

  const currencyToggle = (
    <div className="flex gap-1" role="group" aria-label="Moneda">
      {CURRENCIES.map((c) => {
        const available = Boolean(ranges[c]);
        return (
          <button
            key={c}
            type="button"
            disabled={!available}
            tabIndex={open ? 0 : -1}
            onClick={() => handleCurrencyPick(c)}
            aria-pressed={currency === c}
            className={cn(
              "rounded-full px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ease-out",
              currency === c
                ? "bg-grafito text-blanco-roto"
                : available
                  ? "bg-piedra/50 text-grafito/60 hover:bg-piedra/70"
                  : "cursor-not-allowed bg-piedra/20 text-grafito/25",
            )}
          >
            {c}
          </button>
        );
      })}
    </div>
  );

  if (!bounds || !displayCurrency) {
    // No hay slider que mostrar: mismo alto de línea que Tipo/Operación/Zona
    // (flex-1, no flex-[1.4] — ese ancho extra es solo para cuando el
    // dropdown realmente aparece) y el mismo tratamiento visual de "valor
    // vacío" que usan esos otros campos (CustomSelect), en una sola línea.
    return (
      <div className={isHero ? "flex flex-1 flex-col gap-1 px-5 py-4" : "w-full sm:w-36"}>
        {label}
        <span className="truncate font-body text-sm text-grafito/45">Sin precios</span>
      </div>
    );
  }

  const summary = currency
    ? bounds.min === bounds.max
      ? formatPrice(bounds.min, displayCurrency)
      : `${formatPrice(minVal, displayCurrency)} — ${formatPrice(maxVal, displayCurrency)}`
    : null;

  return (
    <div ref={rootRef} className={cn("relative", isHero ? "flex flex-1" : "w-full sm:w-44")}>
      {/* Solo se manda al filtro cuando el visitante eligió una moneda de
          verdad — value="" no filtra nada, igual que el resto de los selects. */}
      <input type="hidden" name="moneda" value={currency ?? ""} />

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left transition-colors duration-200 ease-out",
          isHero
            ? "flex-col items-start gap-1 px-5 py-4 hover:bg-plata/60"
            : "rounded-xl border border-piedra bg-blanco-roto px-4 py-2.5",
        )}
      >
        {isHero ? label : null}
        <span className="flex w-full items-center justify-between gap-2">
          <span className={cn("truncate font-body text-sm", summary ? "text-grafito" : "text-grafito/45")}>
            {summary ?? "Cualquier precio"}
          </span>
          <IconChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-grafito/40 transition-transform duration-200 ease-out",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      <div
        className={cn(
          "absolute left-0 top-full z-30 mt-2 w-[min(22rem,90vw)] origin-top rounded-xl bg-blanco-roto p-4 shadow-[0_16px_40px_-12px_rgba(28,33,41,0.35)] ring-1 ring-piedra transition-[opacity,transform] duration-150 ease-out",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {label}
          {currencyToggle}
        </div>

        {bounds.min === bounds.max ? (
          <>
            <input type="hidden" name="precioMin" value={bounds.min} />
            <input type="hidden" name="precioMax" value={bounds.max} />
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => handleCurrencyPick(displayCurrency)}
              aria-pressed={Boolean(currency)}
              className={cn(
                "mt-3 inline-flex w-fit items-center rounded-full px-3 py-1.5 font-body text-sm tabular-nums transition-colors duration-150 ease-out",
                currency
                  ? "bg-petroleo/[0.12] text-petroleo"
                  : "bg-piedra/50 text-grafito/60 hover:bg-piedra/70",
              )}
            >
              {formatPrice(bounds.min, displayCurrency)}
            </button>
          </>
        ) : (
          <>
            <div
              className={cn(
                "mt-3 flex items-center justify-between gap-2 font-body text-sm transition-colors duration-150 ease-out",
                currency ? "text-grafito" : "text-grafito/40",
              )}
            >
              <span className="tabular-nums">{formatPrice(minVal, displayCurrency)}</span>
              <span className="tabular-nums">{formatPrice(maxVal, displayCurrency)}</span>
            </div>

            <div className="relative mt-1 h-7">
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-piedra" />
              <div
                className={cn(
                  "absolute top-1/2 h-1 -translate-y-1/2 rounded-full transition-colors duration-150 ease-out",
                  currency ? "bg-petroleo" : "bg-grafito/25",
                )}
                style={{
                  left: `${((minVal - bounds.min) / (bounds.max - bounds.min)) * 100}%`,
                  right: `${100 - ((maxVal - bounds.min) / (bounds.max - bounds.min)) * 100}%`,
                }}
              />
              <input
                type="range"
                name="precioMin"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={minVal}
                onChange={(event) => handleMinChange(Number(event.target.value))}
                aria-label="Precio mínimo"
                tabIndex={open ? 0 : -1}
                className="price-range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2 appearance-none bg-transparent"
              />
              <input
                type="range"
                name="precioMax"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={maxVal}
                onChange={(event) => handleMaxChange(Number(event.target.value))}
                aria-label="Precio máximo"
                tabIndex={open ? 0 : -1}
                className="price-range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2 appearance-none bg-transparent"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
