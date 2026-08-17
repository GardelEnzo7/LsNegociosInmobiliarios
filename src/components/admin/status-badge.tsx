"use client";

import { cn } from "@/lib/utils";
import { TIER_STYLES, type StatusTier } from "@/lib/admin/constants";
import { IconChevronDown } from "@/components/site/icons";

const base =
  "inline-flex items-center rounded-full px-2.5 py-1 font-utility text-[10px] font-medium uppercase tracking-[0.06em] whitespace-nowrap";

export function StatusBadge({
  label,
  tier,
  className,
}: {
  label: string;
  tier: StatusTier;
  className?: string;
}) {
  return <span className={cn(base, TIER_STYLES[tier], className)}>{label}</span>;
}

/** Select styled as a status pill — the shared inline-status-change pattern
 * used across propiedades/consultas/visitas/administraciones. Callers own
 * the Server Action + useTransition; this only owns the look. */
export function StatusSelect({
  value,
  tier,
  options,
  onChange,
  disabled,
  className,
}: {
  value: string;
  tier: StatusTier;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(base, "cursor-pointer appearance-none border-0 pr-6", TIER_STYLES[tier], className)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 opacity-60" />
    </div>
  );
}
