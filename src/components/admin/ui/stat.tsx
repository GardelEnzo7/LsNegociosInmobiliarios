import type { ReactNode } from "react";

/** One number + its label — the same treatment on the dashboard and in
 * Estadísticas. */
export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <p className="font-display text-[26px] leading-none tabular-nums text-grafito" style={{ fontWeight: 460 }}>
        {value}
      </p>
      <p className="mt-2 text-xs text-grafito/55">{label}</p>
    </div>
  );
}
