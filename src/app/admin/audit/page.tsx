import { ScrollText, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import type { VaultAuditEntry } from "@/lib/types";

export const metadata = { title: "Audit Log — ShipVault" };

const TONE: Record<string, string> = {
  decrypted: "bg-emerald-500/15 text-emerald-500",
  created: "bg-primary/15 text-primary",
  updated: "bg-blue-500/15 text-blue-400",
  deleted: "bg-rose-500/15 text-rose-400",
  unlock_denied: "bg-amber-500/15 text-amber-500",
};

export default async function AuditPage() {
  const supabase = createClient();
  // Admins can read the full trail via the audit_select RLS policy.
  const { data } = await supabase
    .from("vault_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const entries = (data ?? []) as VaultAuditEntry[];

  return (
    <>
      <PageHeader
        title="Vault Audit Log"
        description="System-wide record of every vault action. Document contents remain encrypted and are never exposed here."
      />

      <Card className="mb-4 border-vault/30 bg-vault/5">
        <CardContent className="flex items-center gap-3 p-4 text-sm">
          <ShieldAlert className="h-5 w-5 text-vault" />
          <span className="text-muted-foreground">
            Administrators see access metadata only — ciphertext stays owner-locked by Row Level Security.
          </span>
        </CardContent>
      </Card>

      <Card>
        <div className="divide-y divide-border">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div className="flex items-center gap-3">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{e.detail ?? "(no label)"}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    actor {e.actor_id?.slice(0, 8) ?? "—"} · item {e.vault_item_id?.slice(0, 8) ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={TONE[e.action] ?? "bg-secondary text-secondary-foreground"}>
                  {e.action.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">{timeAgo(e.created_at)}</span>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="px-5 py-10 text-center text-muted-foreground">No audit activity yet.</p>
          )}
        </div>
      </Card>
    </>
  );
}
