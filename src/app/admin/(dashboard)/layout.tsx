import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { ConfirmProvider } from "@/components/admin/ui/confirm-dialog";
import { getAdminProfileForCurrentUser } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | LS Gestión" },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  await supabase.rpc("claim_admin_profile");
  const { data: role } = await supabase.rpc("current_admin_role");

  const profile = await getAdminProfileForCurrentUser();

  return (
    <ConfirmProvider>
      <div className="flex min-h-screen bg-plata">
        <Sidebar role={role} profileName={profile?.full_name ?? null} />
        <MobileNav role={role} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</main>
      </div>
    </ConfirmProvider>
  );
}
