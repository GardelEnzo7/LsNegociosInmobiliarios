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
import { Stat } from "@/components/admin/ui/stat";

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

      <Panel className="mt-8 overflow-hidden" padded={false}>
        <h2 className="sr-only">Inventario de propiedades</h2>
        <div className="grid grid-cols-3 gap-px bg-grafito/[0.06] sm:grid-cols-6">
          {inventory.map((item) => (
            <Link
              key={item.label}
              href="/admin/propiedades"
              className="bg-blanco-roto px-5 py-5 transition-colors duration-150 ease-out hover:bg-plata/70"
            >
              <Stat value={item.value} label={item.label} />
            </Link>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Propiedades que requieren atención">
          {needsAttention.length === 0 ? (
            <EmptyState className="py-6" text="Todas las propiedades publicadas están al día." />
          ) : (
            <ul className="-mx-2 divide-y divide-grafito/[0.06]">
              {needsAttention.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/propiedades/${property.id}`}
                    className="flex items-start gap-3 rounded-lg px-2 py-3 transition-colors duration-150 ease-out hover:bg-plata/70"
                  >
                    <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-bronce" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-grafito">{property.title}</span>
                      <span className="mt-0.5 block text-xs text-bronce">{property.reasons.join(" · ")}</span>
                    </span>
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
