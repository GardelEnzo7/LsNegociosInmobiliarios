import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Notice } from "@/components/admin/ui/notice";
import { MessagesInbox } from "@/components/admin/messages-inbox";
import { getSiteMessages } from "@/lib/data/admin";
import { getCurrentAdminRole } from "@/lib/supabase/guards";

export const metadata: Metadata = { title: "Consultas" };

export default async function AdminConsultasPage() {
  const [{ messages, available }, role] = await Promise.all([getSiteMessages(), getCurrentAdminRole()]);
  const fresh = messages.filter((m) => m.status === "nueva").length;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Consultas"
        subtitle={
          fresh > 0
            ? `${fresh} ${fresh === 1 ? "consulta nueva" : "consultas nuevas"} desde el sitio. Además de llegar por email, quedan guardadas acá.`
            : "Los mensajes del formulario del sitio. Además de llegar por email, quedan guardados acá."
        }
      />

      {available ? (
        <div className="mt-8">
          <MessagesInbox messages={messages} canDelete={role === "admin"} />
        </div>
      ) : (
        <Notice className="mt-8">
          La bandeja todavía no está activada en la base de datos (falta aplicar la migración
          <code className="mx-1 rounded bg-blanco-roto px-1">0033_site_messages.sql</code>). Mientras tanto, las
          consultas siguen llegando solo por email.
        </Notice>
      )}
    </div>
  );
}
