"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General" },
  { id: "interna", label: "Información interna" },
  { id: "documentacion", label: "Documentación" },
  { id: "difusion", label: "Difusión" },
  { id: "actividad", label: "Actividad" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PropertyTabs({ panels }: { panels: Record<TabId, React.ReactNode> }) {
  const [active, setActive] = useState<TabId>("general");

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-zinc-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out",
              active === tab.id
                ? "border-petroleo text-petroleo"
                : "border-transparent text-zinc-500 hover:text-zinc-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{panels[active]}</div>
    </div>
  );
}
