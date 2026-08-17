import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  text,
  action,
  bordered = false,
  className,
}: {
  text: string;
  action?: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "py-10 text-center",
        bordered && "rounded-2xl border border-dashed border-grafito/15",
        className,
      )}
    >
      <p className="font-display text-[17px] italic text-grafito/60" style={{ fontWeight: 420 }}>
        {text}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
