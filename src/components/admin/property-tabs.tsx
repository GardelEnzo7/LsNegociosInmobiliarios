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
      <div className="flex flex-wrap gap-1 border-b border-grafito/[0.08]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out",
              active === tab.id ? "border-petroleo text-petroleo" : "border-transparent text-grafito/45 hover:text-grafito/75",
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
