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
        "px-6 py-10 text-center",
        bordered && "rounded-2xl border border-dashed border-grafito/15 bg-blanco-roto/50",
        className,
      )}
    >
      <p className="font-display text-[17px] italic text-grafito/55" style={{ fontWeight: 420 }}>
        {text}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
