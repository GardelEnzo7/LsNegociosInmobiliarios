import { getPropertyStats, getInquiryAnalytics, getClosedDealsAnalytics } from "@/lib/data/admin";
import { BarList } from "@/components/admin/bar-list";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { OPERATION_LABELS } from "@/lib/constants";

const ORIGIN_LABELS: Record<string, string> = {
  web: "Sitio web",
  telefono: "Teléfono",
  recomendacion: "Recomendación",
  otro: "Otro",
};

export default async function AdminStatsPage() {
  const [stats, inquiryAnalytics, closedDeals] = await Promise.all([
    getPropertyStats(),
    getInquiryAnalytics(),
    getClosedDealsAnalytics(),
  ]);
  const maxViews = Math.max(1, ...stats.map((s) => s.views_count));

  const monthLabels: Record<string, string> = Object.fromEntries(
    inquiryAnalytics.byMonth.map(([month]) => [
      month,
      new Date(`${month}-01`).toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
    ]),
  );

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        subtitle="Datos reales del negocio. Todavía hay poco historial, así que algunas secciones van a mostrarse vacías hasta que se acumule más actividad."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Consultas totales" value={inquiryAnalytics.total} />
        <MiniStat label="Operaciones cerradas" value={closedDeals.total} />
        <MiniStat
          label="Días promedio a cierre"
          value={closedDeals.avgDaysToClose ?? "—"}
        />
        <MiniStat label="Propiedades con consultas" value={stats.filter((s) => s.messages_count > 0).length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Consultas por operación">
          <BarList
            items={inquiryAnalytics.byOperation}
            emptyText="Todavía no hay suficientes consultas para mostrar esta distribución."
            labelMap={OPERATION_LABELS}
          />
        </Panel>
        <Panel title="Origen de las consultas">
          <BarList
            items={inquiryAnalytics.byOrigin}
            emptyText="Todavía no hay suficientes consultas para mostrar el origen."
            labelMap={ORIGIN_LABELS}
          />
        </Panel>
        <Panel title="Consultas por barrio">
          <BarList
            items={inquiryAnalytics.byNeighborhood}
            emptyText="Todavía no hay suficientes consultas para mostrar por barrio."
          />
        </Panel>
        <Panel title="Evolución mensual de consultas">
          <BarList
            items={inquiryAnalytics.byMonth}
            emptyText="Todavía no hay suficiente historial mensual."
            labelMap={monthLabels}
          />
        </Panel>
      </div>

      <Panel title="Propiedades más consultadas" className="mt-6">
        {stats.length === 0 ? (
          <p className="text-sm text-grafito/40">Todavía no hay datos.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-grafito/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-grafito/10 bg-piedra/30 text-xs uppercase tracking-wide text-grafito/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Propiedad</th>
                  <th className="px-4 py-3 font-medium">Vistas</th>
                  <th className="px-4 py-3 font-medium">Consultas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grafito/[0.06]">
                {stats.map((property) => (
                  <tr key={property.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-grafito">{property.title}</p>
                      <p className="text-xs text-grafito/50">{property.neighborhood}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 shrink-0 tabular-nums text-grafito/70">{property.views_count}</span>
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-piedra/40">
                          <div
                            className="h-full rounded-full bg-petroleo transition-[width] duration-500 ease-out"
                            style={{ width: `${(property.views_count / maxViews) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-grafito/70">{property.messages_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-grafito/10 bg-blanco-roto p-4">
      <p className="text-2xl font-semibold tabular-nums text-grafito">{value}</p>
      <p className="mt-1 text-xs text-grafito/50">{label}</p>
    </div>
  );
}
