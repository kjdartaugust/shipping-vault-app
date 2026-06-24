import { Package, Users, Truck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignAgent } from "@/components/admin/assign-agent";
import { formatDate } from "@/lib/utils";
import type { Profile, Shipment } from "@/lib/types";

export const metadata = { title: "Admin Console — ShipVault" };

export default async function AdminPage() {
  const supabase = createClient();

  const [{ data: shipments }, { data: profiles }, users, vault, transit] = await Promise.all([
    supabase.from("shipments").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("profiles").select("id, full_name, email, role"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("vault_items").select("*", { count: "exact", head: true }),
    supabase
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .in("status", ["booked", "in_transit", "out_for_delivery"]),
  ]);

  const allShipments = (shipments ?? []) as Shipment[];
  const allProfiles = (profiles ?? []) as Profile[];
  const agents = allProfiles.filter((p) => p.role === "agent" || p.role === "admin");

  return (
    <>
      <PageHeader title="Admin Console" description="Operational overview and agent dispatch." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Shipments" value={allShipments.length} icon={Package} />
        <StatCard label="In transit" value={transit.count ?? 0} icon={Truck} />
        <StatCard label="Users" value={users.count ?? 0} icon={Users} />
        <StatCard label="Vault items" value={vault.count ?? 0} icon={Lock} vault />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All shipments</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Tracking #</th>
                <th className="px-5 py-3 font-medium">Route</th>
                <th className="px-5 py-3 font-medium">Booked</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allShipments.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-xs">{s.tracking_number}</td>
                  <td className="px-5 py-3">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-3">
                    <AssignAgent shipmentId={s.id} agentId={s.agent_id} agents={agents} />
                  </td>
                </tr>
              ))}
              {allShipments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No shipments in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
