import type { ReactNode } from "react";
import { IconChevronDown } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-lg border border-grafito/12 bg-blanco-roto px-3 text-sm text-grafito outline-none transition-colors duration-150 ease-out placeholder:text-grafito/35 hover:border-grafito/20 focus:border-petroleo disabled:cursor-not-allowed disabled:opacity-60";

/** Single-line inputs and selects — one fixed height everywhere. */
export const inputClass = cn(controlBase, "h-10");

export const textareaClass = cn(controlBase, "py-2.5 leading-relaxed");

export const selectClass = cn(inputClass, "appearance-none pr-9");

/** Native checkbox in the brand color (no forms plugin installed). */
export const checkboxClass = "h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--color-petroleo)]";

export const labelClass = "font-utility text-[11px] font-medium uppercase tracking-[0.04em] text-grafito/60";

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-terracota">{error}</p> : null}
    </div>
  );
}

/** Small heading that groups related fields inside one Panel. */
export function FieldGroupLabel({ children }: { children: ReactNode }) {
  return <p className="col-span-full text-sm font-medium text-grafito/80">{children}</p>;
}

/** Wraps a native <select> with appearance-none + a custom chevron, matching
 * the site's CustomSelect visual language without the JS overhead — used for
 * plain (non status-colored) selects in forms. */
export function SelectShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-grafito/40" />
    </div>
  );
}
