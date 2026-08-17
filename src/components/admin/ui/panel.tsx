import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Static surface — form, ficha section, dashboard block. Ring only, never
 * a resting shadow (elevation means "floats", reserved for clickable rows,
 * dropdowns and modals). */
export function Panel({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl bg-blanco-roto ring-1 ring-grafito/[0.06]", padded && "p-5", className)}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[19px] leading-[1.25] text-grafito" style={{ fontWeight: 480 }}>
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
