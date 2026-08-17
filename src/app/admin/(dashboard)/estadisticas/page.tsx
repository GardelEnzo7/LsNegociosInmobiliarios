import { getPropertyStats, getClosedDealsAnalytics } from "@/lib/data/admin";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";

export default async function AdminStatsPage() {
  const [stats, closedDeals] = await Promise.all([getPropertyStats(), getClosedDealsAnalytics()]);
  const maxViews = Math.max(1, ...stats.map((s) => s.views_count));

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        subtitle="Datos reales del negocio. Todavía hay poco historial, así que algunas secciones van a mostrarse vacías hasta que se acumule más actividad."
      />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <MiniStat label="Operaciones cerradas" value={closedDeals.total} />
        <MiniStat label="Días promedio a cierre" value={closedDeals.avgDaysToClose ?? "—"} />
      </div>

      <Panel title="Propiedades más vistas" className="mt-6">
        {stats.length === 0 ? (
          <p className="text-sm text-grafito/40">Todavía no hay datos.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-grafito/10">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-grafito/10 bg-piedra/30 text-xs uppercase tracking-wide text-grafito/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Propiedad</th>
                  <th className="px-4 py-3 font-medium">Vistas</th>
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
