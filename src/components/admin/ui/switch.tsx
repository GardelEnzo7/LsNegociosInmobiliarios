"use client";

import { cn } from "@/lib/utils";

/**
 * Presentational on/off switch. The caller keeps owning what a toggle does
 * (`onClick`); this only draws the track/knob consistently. `label` is
 * optional visible text beside it — the accessible name always comes from
 * `ariaLabel`.
 */
export function Switch({
  checked,
  onClick,
  ariaLabel,
  label,
  title,
  disabled,
}: {
  checked: boolean;
  onClick: () => void;
  ariaLabel: string;
  label?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="group inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full text-xs font-medium text-grafito/65 disabled:opacity-50"
    >
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-out",
          checked ? "bg-petroleo" : "bg-piedra group-hover:bg-grafito/20",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-blanco-roto shadow-[0_1px_2px_rgba(28,33,41,0.25)] transition-transform duration-200 ease-out",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      {label ? <span aria-hidden="true">{label}</span> : null}
    </button>
  );
}
