import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

  // Middleware only checks "is there a session" — it lets any authenticated
  // Supabase user through to /admin/*, including one with no admin_profile
  // row at all (e.g. a stray auth account, or one deactivated by an admin).
  // RLS already blocks that user from reading/writing any admin data, but
  // without this check they'd still see the full admin shell (sidebar, nav,
  // page chrome) rendered around empty/failing panels. Reject explicitly
  // here instead of relying on RLS alone.
  if (!role) {
    redirect("/");
  }

  const profile = await getAdminProfileForCurrentUser();

  return (
    <ConfirmProvider>
      {/* Column below lg (mobile top bar above the content), row from lg
          (sidebar beside it). */}
      <div className="flex min-h-screen flex-col bg-plata lg:flex-row">
        <Sidebar role={role} profileName={profile?.full_name ?? null} />
        <MobileNav role={role} profileName={profile?.full_name ?? null} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </ConfirmProvider>
  );
}
