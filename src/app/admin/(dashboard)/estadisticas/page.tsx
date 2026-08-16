import { getPropertyStats } from "@/lib/data/admin";

export default async function AdminStatsPage() {
  const stats = await getPropertyStats();
  const maxViews = Math.max(1, ...stats.map((s) => s.views_count));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Estadísticas</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Vistas y consultas por propiedad, para saber cuáles destacar o revisar.
      </p>

      <div className="mt-6 max-w-4xl overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {stats.length === 0 ? (
          <p className="p-10 text-center text-sm text-zinc-500">Todavía no hay datos.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Propiedad</th>
                <th className="px-4 py-3 font-medium">Vistas</th>
                <th className="px-4 py-3 font-medium">Consultas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {stats.map((property) => (
                <tr key={property.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{property.title}</p>
                    <p className="text-xs text-zinc-500">{property.neighborhood}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 shrink-0 tabular-nums text-zinc-700">{property.views_count}</span>
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-petroleo transition-[width] duration-500 ease-out"
                          style={{ width: `${(property.views_count / maxViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">{property.messages_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
