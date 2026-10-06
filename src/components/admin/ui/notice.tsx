import type { ReactNode } from "react";
import { IconInfo } from "@/components/admin/ui/icons";
import { cn } from "@/lib/utils";

/** Quiet contextual note (privacy, how an integration works, next steps).
 * Neutral on purpose — bronce stays reserved for "needs a decision". */
export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl bg-plata px-4 py-3 text-[13px] leading-relaxed text-grafito/65 ring-1 ring-inset ring-grafito/[0.05]",
        className,
      )}
    >
      <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-petroleo/70" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
