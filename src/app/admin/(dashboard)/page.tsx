import Link from "next/link";
import {
  getPropertyStatusCounts,
  getRecentActivity,
  getPropertiesNeedingAttention,
} from "@/lib/data/admin";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";

export default async function AdminDashboardPage() {
  const [properties, recentActivity, needsAttention] = await Promise.all([
    getPropertyStatusCounts(),
    getRecentActivity(6),
    getPropertiesNeedingAttention(5),
  ]);

  const inventory = [
    { label: "Total", value: properties.total },
    { label: "Disponibles", value: properties.disponible },
    { label: "Reservadas", value: properties.reservada },
    { label: "Vendidas", value: properties.vendida },
    { label: "Alquiladas", value: properties.alquilada },
    { label: "Destacadas", value: properties.featured },
  ];

  return (
    <div>
      <PageHeader title="Resumen" subtitle="Lo que necesita tu atención hoy." />

      <Panel className="mt-6" padded={false}>
        <div className="grid grid-cols-3 divide-x divide-grafito/[0.06] sm:grid-cols-6">
          {inventory.map((item) => (
            <Link
              key={item.label}
              href="/admin/propiedades"
              className="px-4 py-4 text-center transition-colors duration-150 ease-out hover:bg-piedra/20 sm:text-left"
            >
              <p className="font-display text-2xl tabular-nums text-grafito" style={{ fontWeight: 460 }}>
                {item.value}
              </p>
              <p className="mt-0.5 text-[11px] text-grafito/50">{item.label}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Propiedades que requieren atención">
          {needsAttention.length === 0 ? (
            <EmptyState text="Todas las propiedades publicadas están al día." />
          ) : (
            <ul className="space-y-1">
              {needsAttention.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/propiedades/${property.id}`}
                    className="block rounded-lg bg-bronce/[0.06] px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-bronce/[0.1]"
                  >
                    <p className="truncate text-sm font-medium text-grafito">{property.title}</p>
                    <p className="mt-0.5 text-xs text-bronce">{property.reasons.join(" · ")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Actividad reciente">
          <ActivityTimeline events={recentActivity} />
        </Panel>
      </div>
    </div>
  );
}
