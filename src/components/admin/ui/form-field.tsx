import type { ReactNode } from "react";
import { IconChevronDown } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-lg border border-grafito/10 bg-blanco-roto px-3 py-2.5 text-sm text-grafito outline-none transition-colors duration-150 ease-out focus:border-petroleo";

export const selectClass = cn(inputClass, "appearance-none pr-9");

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
      <label htmlFor={htmlFor} className="font-utility text-[11px] font-medium uppercase tracking-[0.04em] text-grafito/60">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-terracota">{error}</p> : null}
    </div>
  );
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
