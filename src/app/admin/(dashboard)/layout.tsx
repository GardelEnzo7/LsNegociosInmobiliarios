import { Sidebar } from "@/components/admin/sidebar";
import { getUnreadMessageCount } from "@/lib/data/admin";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessageCount();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar unreadCount={unreadCount} />
      <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
    </div>
  );
}
