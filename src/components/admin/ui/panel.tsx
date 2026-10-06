import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Static surface — form, ficha section, dashboard block. Ring only, never
 * a resting shadow (elevation means "floats", reserved for clickable rows,
 * dropdowns and modals). */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl bg-blanco-roto ring-1 ring-grafito/[0.07]", padded && "p-5 sm:p-6", className)}>
      {title ? (
        <div className={cn("mb-5 flex items-start justify-between gap-3", !padded && "px-5 pt-5 sm:px-6 sm:pt-6")}>
          <div className="min-w-0">
            <h2 className="font-display text-[19px] leading-[1.25] text-grafito" style={{ fontWeight: 480 }}>
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-relaxed text-grafito/55">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Heading for a block of content that isn't itself wrapped in a Panel. */
export function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-[19px] leading-[1.25] text-grafito", className)} style={{ fontWeight: 480 }}>
      {children}
    </h2>
  );
}
