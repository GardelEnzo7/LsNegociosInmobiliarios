import Link from "next/link";
import { getAllMessages, getAllProperties } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const [properties, messages] = await Promise.all([getAllProperties(), getAllMessages()]);

  const published = properties.filter((p) => p.status === "published").length;
  const featured = properties.filter((p) => p.featured).length;
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    { label: "Propiedades totales", value: properties.length, href: "/admin/propiedades" },
    { label: "Publicadas", value: published, href: "/admin/propiedades" },
    { label: "Destacadas", value: featured, href: "/admin/propiedades" },
    { label: "Mensajes sin leer", value: unread, href: "/admin/mensajes" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Resumen</h1>
      <p className="mt-1 text-sm text-zinc-500">Vista general del negocio.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow duration-200 ease-out hover:shadow-[0_4px_16px_-4px_rgba(28,33,41,0.12)]"
          >
            <p className="text-3xl font-semibold tabular-nums text-zinc-900">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Últimos mensajes</h2>
          <Link href="/admin/mensajes" className="text-xs font-medium text-petroleo hover:underline">
            Ver todos
          </Link>
        </div>
        {messages.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">Todavía no llegaron mensajes.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {messages.slice(0, 5).map((message) => (
              <li key={message.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{message.name}</p>
                  <p className="text-xs text-zinc-500">{message.contact}</p>
                </div>
                {!message.read ? (
                  <span className="rounded-full bg-petroleo/10 px-2.5 py-1 text-[11px] font-medium text-petroleo">
                    Nuevo
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
