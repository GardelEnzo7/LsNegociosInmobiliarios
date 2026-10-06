import { getPropertyStats, getClosedDealsAnalytics } from "@/lib/data/admin";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { Stat } from "@/components/admin/ui/stat";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";

export default async function AdminStatsPage() {
  const [stats, closedDeals] = await Promise.all([getPropertyStats(), getClosedDealsAnalytics()]);
  const maxViews = Math.max(1, ...stats.map((s) => s.views_count));

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        subtitle="Datos reales del negocio. Todavía hay poco historial, así que algunas secciones van a mostrarse vacías hasta que se acumule más actividad."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
        <Panel>
          <Stat label="Operaciones cerradas" value={closedDeals.total} />
        </Panel>
        <Panel>
          <Stat label="Días promedio a cierre" value={closedDeals.avgDaysToClose ?? "—"} />
        </Panel>
      </div>

      <Panel title="Propiedades más vistas" className="mt-5" padded={false}>
        {stats.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-grafito/50 sm:px-6">Todavía no hay datos.</p>
        ) : (
          <TableShell minWidth={420}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Propiedad</th>
                <th className={thClass}>Vistas</th>
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {stats.map((property) => (
                <tr key={property.id} className={trClass}>
                  <Td>
                    <p className="font-medium text-grafito">{property.title}</p>
                    <p className="mt-0.5 text-xs text-grafito/50">{property.neighborhood}</p>
                  </Td>
                  <Td className="w-1/2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-right tabular-nums text-grafito/80">{property.views_count}</span>
                      <div className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-piedra/50">
                        <div
                          className="h-full rounded-full bg-petroleo transition-[width] duration-500 ease-out"
                          style={{ width: `${(property.views_count / maxViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}
