import { Package, Users, Lock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignAgent } from "@/components/admin/assign-agent";
import { VolumeChart, AccessChart, FlaggedChart } from "@/components/admin/charts";
import { formatDate } from "@/lib/utils";
import type { Profile, Shipment, VaultAuditEntry } from "@/lib/types";

export const metadata = { title: "Admin Console — VaultEx" };

function lastDays(n: number) {
  const days: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }
  return days;
}

export default async function AdminPage() {
  const supabase = createClient();

  const [{ data: shipments }, { data: profiles }, { data: audit }, users, vault] =
    await Promise.all([
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email, role"),
      supabase.from("vault_audit_log").select("action, created_at").limit(1000),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("vault_items").select("*", { count: "exact", head: true }),
    ]);

  const allShipments = (shipments ?? []) as Shipment[];
  const allProfiles = (profiles ?? []) as Profile[];
  const auditRows = (audit ?? []) as Pick<VaultAuditEntry, "action" | "created_at">[];
  const agents = allProfiles.filter((p) => p.role === "agent" || p.role === "admin");

  const days = lastDays(14);

  const volumeData = days.map((d) => ({
    label: d.label,
    count: allShipments.filter((s) => s.created_at.slice(0, 10) === d.key).length,
  }));

  const flaggedData = days.map((d) => ({
    label: d.label,
    count: allShipments.filter(
      (s) => s.status === "exception" && s.updated_at.slice(0, 10) === d.key
    ).length,
  }));

  const accessTypes = ["created", "decrypted", "updated", "unlock_denied", "deleted"];
  const accessData = accessTypes.map((a) => ({
    label: a === "unlock_denied" ? "denied" : a,
    count: auditRows.filter((r) => r.action === a).length,
  }));

  const flaggedCount = allShipments.filter((s) => s.status === "exception").length;
  const recent = allShipments.slice(0, 30);

  return (
    <>
      <PageHeader title="Command Console" description="Operational intelligence and agent dispatch." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Shipments" value={allShipments.length} icon={Package} />
        <StatCard label="Operators" value={users.count ?? 0} icon={Users} accent="primary" />
        <StatCard label="Vault items" value={vault.count ?? 0} icon={Lock} accent="vault" />
        <StatCard
          label="Flagged"
          value={flaggedCount}
          icon={AlertTriangle}
          accent={flaggedCount > 0 ? "primary" : "secure"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipment volume · 14d</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volumeData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vault access events</CardTitle>
          </CardHeader>
          <CardContent>
            <AccessChart data={accessData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Flagged activity · 14d
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FlaggedChart data={flaggedData} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All shipments</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Tracking ID</th>
                <th className="px-5 py-3 font-medium">Route</th>
                <th className="px-5 py-3 font-medium">Booked</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-xs text-primary">{s.tracking_number}</td>
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
              {recent.length === 0 && (
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
