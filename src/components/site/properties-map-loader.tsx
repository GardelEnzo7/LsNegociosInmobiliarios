"use client";

import dynamic from "next/dynamic";
import type { PropertyWithImages } from "@/lib/data/properties";

const PropertiesMap = dynamic(
  () => import("@/components/site/properties-map").then((mod) => mod.PropertiesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-piedra/30 font-body text-sm text-grafito/40">
        Cargando mapa…
      </div>
    ),
  },
);

export function PropertiesMapLoader({ properties }: { properties: PropertyWithImages[] }) {
  return <PropertiesMap properties={properties} />;
}
