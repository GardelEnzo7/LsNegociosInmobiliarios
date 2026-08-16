import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "No tenés permiso para realizar esta acción.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentAdminRole(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("current_admin_role");
  return data ?? null;
}

export async function requireStaff(): Promise<string> {
  const role = await getCurrentAdminRole();
  if (!role) throw new UnauthorizedError();
  return role;
}

export async function requireAdmin(): Promise<void> {
  const role = await getCurrentAdminRole();
  if (role !== "admin") throw new UnauthorizedError();
}
