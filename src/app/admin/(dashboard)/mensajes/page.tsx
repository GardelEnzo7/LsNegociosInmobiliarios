import { MessagesList } from "@/components/admin/messages-list";
import { getAllMessages } from "@/lib/data/admin";

export default async function AdminMessagesPage() {
  const messages = await getAllMessages();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Mensajes</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Consultas recibidas desde el formulario de contacto del sitio.
      </p>

      <div className="mt-6 max-w-3xl">
        <MessagesList messages={messages} />
      </div>
    </div>
  );
}
