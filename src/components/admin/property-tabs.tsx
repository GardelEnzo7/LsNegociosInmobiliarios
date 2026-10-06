"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General" },
  { id: "interna", label: "Información interna" },
  { id: "actividad", label: "Actividad" },
  { id: "difusion", label: "Difusión" },
  { id: "documentacion", label: "Documentación" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PropertyTabs({ panels }: { panels: Record<TabId, React.ReactNode> }) {
  const [active, setActive] = useState<TabId>("general");

  return (
    <div>
      {/* Scrolls sideways on narrow screens instead of wrapping into a
          second, ambiguous row of tabs. */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-grafito/[0.08]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-pressed={active === tab.id}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3.5 py-3 text-sm font-medium transition-colors duration-150 ease-out sm:px-4",
                active === tab.id ? "border-petroleo text-petroleo" : "border-transparent text-grafito/50 hover:text-grafito/80",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">{panels[active]}</div>
    </div>
  );
}
