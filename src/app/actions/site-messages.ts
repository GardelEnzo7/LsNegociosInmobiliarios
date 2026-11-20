"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireStaff } from "@/lib/supabase/guards";

const statusSchema = z.enum(["nueva", "respondida", "archivada"]);

function revalidateInbox() {
  revalidatePath("/admin/consultas");
  // Sidebar badge with the count of new messages lives in the layout.
  revalidatePath("/admin", "layout");
}

export async function setMessageStatus(id: string, status: string) {
  await requireStaff();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Estado inválido.");
  const supabase = await createClient();
  const { error } = await supabase.from("site_messages").update({ status: parsed.data }).eq("id", id);
  if (error) throw new Error("No se pudo actualizar la consulta.");
  revalidateInbox();
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("site_messages").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar la consulta.");
  revalidateInbox();
}
