"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "@/components/site/icons";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type CustomSelectProps = {
  name: string;
  label?: string;
  placeholder: string;
  options: Option[];
  defaultValue?: string;
  variant?: "hero" | "bar";
};

export function CustomSelect({
  name,
  label,
  placeholder,
  options,
  defaultValue = "",
  variant = "hero",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  const selected = options.find((option) => option.value === value);
  const isHero = variant === "hero";

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left transition-colors duration-200 ease-out",
          isHero ? "flex-col items-start gap-1" : "rounded-xl border border-piedra bg-blanco-roto px-4 py-2.5",
        )}
      >
        {isHero && label ? (
          <span className="whitespace-nowrap font-utility text-[10px] uppercase tracking-[0.14em] text-grafito/45">
            {label}
          </span>
        ) : null}
        <span className="flex w-full items-center justify-between gap-2">
          <span className={cn("truncate font-body text-sm", selected ? "text-grafito" : "text-grafito/45")}>
            {selected?.label ?? placeholder}
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
        role="listbox"
        className={cn(
          "absolute left-0 top-full z-30 mt-2 w-full min-w-[180px] origin-top overflow-hidden rounded-xl bg-blanco-roto py-1.5 shadow-[0_16px_40px_-12px_rgba(28,33,41,0.35)] ring-1 ring-piedra transition-[opacity,transform] duration-150 ease-out",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="max-h-64 overflow-y-auto">
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left font-body text-sm text-grafito/60 transition-colors duration-150 ease-out hover:bg-plata"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                setValue(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left font-body text-sm text-grafito transition-colors duration-150 ease-out hover:bg-plata"
            >
              {option.label}
              {value === option.value ? <IconCheck className="h-3.5 w-3.5 shrink-0 text-petroleo" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
