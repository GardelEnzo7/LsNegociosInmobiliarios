import Link from "next/link";
import {
  getPropertyStatusCounts,
  getInquiryPipelineCounts,
  getRecentInquiries,
  getUpcomingVisits,
  getRecentActivity,
  getPropertiesNeedingAttention,
} from "@/lib/data/admin";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_STYLES, formatRelativeDate, formatDateTime } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";
import { ActivityTimeline } from "@/components/admin/activity-timeline";

export default async function AdminDashboardPage() {
  const [properties, inquiries, recentInquiries, upcomingVisits, recentActivity, needsAttention] =
    await Promise.all([
      getPropertyStatusCounts(),
      getInquiryPipelineCounts(),
      getRecentInquiries(6),
      getUpcomingVisits(5),
      getRecentActivity(8),
      getPropertiesNeedingAttention(6),
    ]);

  const primaryStats = [
    { label: "Propiedades totales", value: properties.total, href: "/admin/propiedades" },
    { label: "Disponibles", value: properties.disponible, href: "/admin/propiedades" },
    { label: "Reservadas", value: properties.reservada, href: "/admin/propiedades" },
    { label: "Vendidas", value: properties.vendida, href: "/admin/propiedades" },
    { label: "Alquiladas", value: properties.alquilada, href: "/admin/propiedades" },
  ];

  const secondaryStats = [
    { label: "Destacadas", value: properties.featured, href: "/admin/propiedades" },
    { label: "Publicadas", value: properties.published, href: "/admin/propiedades" },
    { label: "Consultas nuevas", value: inquiries.nuevo, href: "/admin/mensajes" },
    { label: "Próximas visitas", value: upcomingVisits.length, href: "/admin/visitas" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Resumen</h1>
      <p className="mt-1 text-sm text-zinc-500">Vista general del negocio.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {primaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {secondaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} muted />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Consultas recientes</h2>
            <Link href="/admin/mensajes" className="text-xs font-medium text-petroleo hover:underline">
              Ver todas
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <EmptyState text="Todavía no llegaron consultas." />
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800">
                      {inquiry.contact?.full_name ?? "Sin identificar"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {inquiry.property?.title ?? "Consulta general"} · {inquiry.origin} ·{" "}
                      {formatRelativeDate(inquiry.created_at)}
                      {inquiry.assigned ? ` · ${inquiry.assigned.full_name}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                      INQUIRY_STATUS_STYLES[inquiry.status],
                    )}
                  >
                    {INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Próximas visitas</h2>
          </div>
          {upcomingVisits.length === 0 ? (
            <EmptyState text="No hay visitas programadas." />
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingVisits.map((visit) => (
                <li key={visit.id} className="rounded-lg bg-zinc-50 p-3">
                  <p className="text-sm font-medium text-zinc-800">{formatDateTime(visit.scheduled_at)}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {visit.property?.title ?? "Propiedad"} · {visit.contact?.full_name ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Actividad reciente</h2>
          <div className="mt-4">
            <ActivityTimeline events={recentActivity} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Propiedades que requieren atención</h2>
          {needsAttention.length === 0 ? (
            <EmptyState text="Todas las propiedades publicadas están al día." />
          ) : (
            <ul className="mt-4 space-y-3">
              {needsAttention.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/propiedades/${property.id}`}
                    className="block rounded-lg bg-amber-50 p-3 transition-colors duration-150 ease-out hover:bg-amber-100"
                  >
                    <p className="truncate text-sm font-medium text-zinc-800">{property.title}</p>
                    <p className="mt-0.5 text-xs text-amber-700">{property.reasons.join(" · ")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  muted,
}: {
  label: string;
  value: number;
  href: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 transition-shadow duration-200 ease-out hover:shadow-[0_4px_16px_-4px_rgba(28,33,41,0.12)]",
        muted && "bg-zinc-50/60",
      )}
    >
      <p className={cn("tabular-nums text-zinc-900", muted ? "text-xl font-semibold" : "text-3xl font-semibold")}>
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="mt-6 text-center text-sm text-zinc-400">{text}</p>;
}
