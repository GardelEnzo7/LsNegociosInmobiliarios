import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared table look for every admin data table: compact utility-font
 * header, roomy rows, subtle row hover. Wide tables scroll horizontally
 * inside their own box instead of pushing the page sideways — `relative`
 * so absolutely positioned bits (sr-only header labels) stay clipped inside
 * it instead of widening the whole document on phones. */
export function TableShell({ children, minWidth = 560 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export const theadClass = "border-b border-grafito/[0.07] bg-plata/70";

export const thClass =
  "px-4 py-2.5 font-utility text-[10.5px] font-medium uppercase tracking-[0.06em] text-grafito/55 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";

export const tbodyClass = "divide-y divide-grafito/[0.06]";

export const trClass = "transition-colors duration-150 ease-out hover:bg-plata/50";

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 align-middle text-grafito/75 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", className)}>
      {children}
    </td>
  );
}
