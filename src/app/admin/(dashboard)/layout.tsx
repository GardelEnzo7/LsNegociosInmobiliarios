import { Sidebar } from "@/components/admin/sidebar";
import { getInquiryPipelineCounts } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  await supabase.rpc("claim_admin_profile");
  const { data: role } = await supabase.rpc("current_admin_role");

  const { nuevo: unreadCount } = await getInquiryPipelineCounts();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar unreadCount={unreadCount} role={role} />
      <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
    </div>
  );
}
