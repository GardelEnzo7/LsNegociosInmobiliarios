import Link from "next/link";
import {
  getPropertyStatusCounts,
  getInquiriesNeedingAttention,
  getTodayVisits,
  getRecentActivity,
  getPropertiesNeedingAttention,
} from "@/lib/data/admin";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TIERS, formatRelativeDate, formatDateTime } from "@/lib/admin/constants";
import { StatusBadge } from "@/components/admin/status-badge";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { IconBell, IconCalendar } from "@/components/site/icons";

export default async function AdminDashboardPage() {
  const [properties, inquiries, todayVisits, recentActivity, needsAttention] = await Promise.all([
    getPropertyStatusCounts(),
    getInquiriesNeedingAttention(6),
    getTodayVisits(),
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

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title={
            <span className="flex items-center gap-2">
              <IconBell className="h-4 w-4 text-petroleo" />
              Consultas en seguimiento
            </span>
          }
          action={
            <Link href="/admin/mensajes" className="text-xs font-medium text-petroleo hover:underline">
              Ver todas
            </Link>
          }
        >
          {inquiries.length === 0 ? (
            <EmptyState text="No hay consultas pendientes de seguimiento." />
          ) : (
            <ul className="divide-y divide-grafito/[0.06]">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href="/admin/mensajes"
                    className="flex items-center justify-between gap-3 rounded-lg py-2.5 transition-colors duration-150 ease-out hover:bg-piedra/25 -mx-2 px-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-grafito">
                        {inquiry.contact?.full_name ?? "Sin identificar"}
                      </p>
                      <p className="truncate text-xs text-grafito/50">
                        {inquiry.property?.title ?? "Consulta general"} · {formatRelativeDate(inquiry.created_at)}
                        {inquiry.assigned ? ` · ${inquiry.assigned.full_name}` : ""}
                      </p>
                    </div>
                    <StatusBadge
                      className="shrink-0"
                      tier={INQUIRY_STATUS_TIERS[inquiry.status]}
                      label={INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          className="lg:col-span-2"
          title={
            <span className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-petroleo" />
              Visitas de hoy
            </span>
          }
          action={
            <Link href="/admin/visitas" className="text-xs font-medium text-petroleo hover:underline">
              Ver agenda
            </Link>
          }
        >
          {todayVisits.length === 0 ? (
            <EmptyState text="No hay visitas programadas para hoy." />
          ) : (
            <ul className="space-y-1">
              {todayVisits.map((visit) => (
                <li key={visit.id}>
                  <Link
                    href="/admin/visitas"
                    className="block rounded-lg py-2.5 transition-colors duration-150 ease-out hover:bg-piedra/25 -mx-2 px-2"
                  >
                    <p className="font-display text-[15px] text-grafito" style={{ fontWeight: 480 }}>
                      {formatDateTime(visit.scheduled_at).split(",")[1]?.trim() ?? formatDateTime(visit.scheduled_at)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-grafito/50">
                      {visit.property?.title ?? "Propiedad"} · {visit.contact?.full_name ?? "—"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="mt-4" padded={false}>
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
