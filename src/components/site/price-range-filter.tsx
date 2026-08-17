"use client";

import { useMemo, useState } from "react";
import type { PriceRangesByCurrency } from "@/lib/data/properties";
import { cn, formatPrice } from "@/lib/utils";

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

  const wrapperClass = isHero
    ? "flex flex-[1.4] flex-col gap-2 px-5 py-4"
    : "w-full rounded-xl border border-piedra bg-blanco-roto px-4 py-3 sm:w-80";

  if (!bounds || !displayCurrency) {
    return (
      <div className={wrapperClass}>
        {label}
        <p className="font-body text-sm text-grafito/40">Todavía no hay propiedades con precio cargado.</p>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between gap-3">
        {label}
        {currencyToggle}
      </div>

      {/* Solo se manda al filtro cuando el visitante eligió una moneda de
          verdad — value="" no filtra nada, igual que el resto de los selects. */}
      <input type="hidden" name="moneda" value={currency ?? ""} />

      {bounds.min === bounds.max ? (
        <>
          <input type="hidden" name="precioMin" value={bounds.min} />
          <input type="hidden" name="precioMax" value={bounds.max} />
          <button
            type="button"
            onClick={() => handleCurrencyPick(displayCurrency)}
            className={cn(
              "text-left font-body text-sm transition-colors duration-150 ease-out",
              currency ? "text-grafito" : "text-grafito/45 hover:text-grafito/70",
            )}
          >
            {formatPrice(bounds.min, displayCurrency)}
            {!currency ? " (tocá para filtrar)" : ""}
          </button>
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center justify-between gap-2 font-body text-sm transition-colors duration-150 ease-out",
              currency ? "text-grafito" : "text-grafito/40",
            )}
          >
            <span className="tabular-nums">{formatPrice(minVal, displayCurrency)}</span>
            <span className="tabular-nums">{formatPrice(maxVal, displayCurrency)}</span>
          </div>

          <div className="relative h-7">
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
              className="price-range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2 appearance-none bg-transparent"
            />
          </div>
        </>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
