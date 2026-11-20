import Link from "next/link";
import { getPropertyStats, getClosedDealsAnalytics, getBusinessSummary } from "@/lib/data/admin";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Panel } from "@/components/admin/ui/panel";
import { Stat } from "@/components/admin/ui/stat";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { TableShell, Td, tbodyClass, thClass, theadClass, trClass } from "@/components/admin/ui/table";
import { currentPeriod, formatPeriod } from "@/lib/rental-reminders";
import { formatNeighborhood, formatPrice } from "@/lib/utils";

function money(byCurrency: Record<string, number>) {
  const parts = Object.entries(byCurrency)
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => formatPrice(amount, currency as "USD" | "ARS"));
  return parts.length > 0 ? parts.join(" + ") : "—";
}

export default async function AdminStatsPage() {
  const period = currentPeriod();
  const [stats, closedDeals, business] = await Promise.all([
    getPropertyStats(),
    getClosedDealsAnalytics(),
    getBusinessSummary(period),
  ]);
  const maxViews = Math.max(1, ...stats.map((s) => s.views_count));
  const maxMessages = Math.max(1, ...business.messagesByProperty.map((m) => m.count));

  return (
    <div>
      <PageHeader title="Estadísticas" subtitle="Cómo viene el negocio: ventas, administraciones, consultas y publicaciones." />

      <h2 className="mt-8 text-sm font-medium text-grafito/70">Administraciones · {formatPeriod(period)}</h2>
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-grafito/[0.06] ring-1 ring-grafito/[0.07] lg:grid-cols-4">
        <Cell>
          <Stat label="Contratos activos" value={business.activeContracts} />
        </Cell>
        <Cell>
          <Stat label="Alquileres por mes (suma)" value={<span className="text-[20px]">{money(business.monthlyRent)}</span>} />
        </Cell>
        <Cell>
          <Stat label="Cobrado este mes" value={<span className="text-[20px] text-petroleo">{money(business.collected)}</span>} />
        </Cell>
        <Cell>
          <Stat label="Pendiente este mes" value={<span className="text-[20px] text-bronce">{money(business.pending)}</span>} />
        </Cell>
      </div>
      <p className="mt-2 text-xs text-grafito/50">
        Cobrado y pendiente se calculan con los alquileres cargados en{" "}
        <Link href="/admin/cobros" className="text-petroleo hover:underline">
          Cobros
        </Link>
        .
      </p>

      <h2 className="mt-10 text-sm font-medium text-grafito/70">Ventas y alquileres cerrados</h2>
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-grafito/[0.06] ring-1 ring-grafito/[0.07] sm:max-w-md">
        <Cell>
          <Stat label="Operaciones cerradas" value={closedDeals.total} />
        </Cell>
        <Cell>
          <Stat label="Días promedio a cierre" value={closedDeals.avgDaysToClose ?? "—"} />
        </Cell>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Consultas por propiedad"
          description={
            business.messagesAvailable
              ? `Últimos 90 días: ${business.messagesTotal} consultas (${business.generalMessages} generales, sin propiedad).`
              : "Disponible cuando se active la bandeja de Consultas."
          }
          padded={false}
        >
          {business.messagesByProperty.length === 0 ? (
            <EmptyState className="pb-8 pt-2" text="Todavía no hay consultas sobre propiedades." />
          ) : (
            <Bars
              rows={business.messagesByProperty.map((m) => ({ key: m.title, title: m.title, sub: m.neighborhood, value: m.count }))}
              max={maxMessages}
            />
          )}
        </Panel>

        <Panel title="Propiedades más vistas" description="Visitas a la ficha en el sitio." padded={false}>
          {stats.length === 0 ? (
            <EmptyState className="pb-8 pt-2" text="Todavía no hay datos." />
          ) : (
            <Bars
              rows={stats.map((s) => ({ key: s.id, title: s.title, sub: formatNeighborhood(s.neighborhood), value: s.views_count }))}
              max={maxViews}
            />
          )}
        </Panel>
      </div>

      <Panel
        className="mt-5"
        title="Publicadas hace más de 90 días"
        description="Siguen disponibles o reservadas. Puede ser momento de revisar precio, fotos o difusión."
        padded={false}
      >
        {business.staleListings.length === 0 ? (
          <EmptyState className="pb-8 pt-2" text="Ninguna propiedad lleva más de 90 días publicada." />
        ) : (
          <TableShell minWidth={480}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Propiedad</th>
                <th className={thClass}>Publicada hace</th>
                <th className={thClass}>Vistas</th>
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {business.staleListings.map((p) => (
                <tr key={p.id} className={trClass}>
                  <Td>
                    <Link href={`/admin/propiedades/${p.id}`} className="font-medium text-grafito hover:text-petroleo">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-grafito/50">{p.neighborhood}</p>
                  </Td>
                  <Td className="tabular-nums">{p.days} días</Td>
                  <Td className="tabular-nums">{p.views}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div className="bg-blanco-roto px-5 py-5">{children}</div>;
}

function Bars({ rows, max }: { rows: { key: string; title: string; sub: string; value: number }[]; max: number }) {
  return (
    <ul className="divide-y divide-grafito/[0.06] border-t border-grafito/[0.06]">
      {rows.slice(0, 10).map((row) => (
        <li key={row.key} className="flex items-center gap-4 px-5 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-grafito">{row.title}</p>
            <p className="mt-0.5 text-xs text-grafito/50">{row.sub}</p>
          </div>
          <div className="flex w-40 shrink-0 items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-piedra/50">
              <div className="h-full rounded-full bg-petroleo" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-sm tabular-nums text-grafito/80">{row.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
