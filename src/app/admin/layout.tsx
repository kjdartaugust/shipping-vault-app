import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  const supabase = createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/40 md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Brand href="/dashboard" />
        </div>
        <Sidebar role={profile.role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} unread={count ?? 0} />
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
