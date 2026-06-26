import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import type { VaultAuditEntry } from "@/lib/types";

export const metadata = { title: "Audit Log — VaultEx" };

const TONE: Record<string, string> = {
  decrypted: "text-secure",
  created: "text-primary",
  updated: "text-primary",
  deleted: "text-red-400",
  unlock_denied: "text-amber-400",
};

export default async function AuditPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vault_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  const entries = (data ?? []) as VaultAuditEntry[];

  return (
    <>
      <PageHeader
        title="Vault Audit Log"
        description="System-wide ledger of every vault action. Document contents stay encrypted and are never exposed here."
      />

      <Card className="mb-4 border-vault/30 bg-vault/5">
        <CardContent className="flex items-center gap-3 p-4 text-sm">
          <ShieldAlert className="h-5 w-5 text-vault" />
          <span className="text-muted-foreground">
            Administrators see access metadata only — ciphertext stays owner-locked by Row Level Security.
          </span>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border bg-background/60 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-amber-500/70" />
          <span className="h-3 w-3 rounded-full bg-secure/70" />
          <span className="ml-2 terminal text-muted-foreground">vaultex@audit:~ — {entries.length} records</span>
        </div>
        <div className="terminal max-h-[60vh] overflow-auto bg-background/40 p-4">
          {entries.length === 0 ? (
            <p className="text-muted-foreground">// no audit activity yet</p>
          ) : (
            <ul className="space-y-1.5">
              {entries.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-x-3">
                  <span className="text-muted-foreground/50">
                    {new Date(e.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </span>
                  <span className={`font-semibold ${TONE[e.action] ?? "text-foreground"}`}>
                    {e.action.toUpperCase().padEnd(13)}
                  </span>
                  <span className="text-muted-foreground">
                    actor=<span className="text-foreground/80">{e.actor_id?.slice(0, 8) ?? "——"}</span>
                  </span>
                  <span className="text-muted-foreground">
                    item=<span className="text-foreground/80">{e.vault_item_id?.slice(0, 8) ?? "——"}</span>
                  </span>
                  {e.detail && <span className="text-muted-foreground/70">“{e.detail}”</span>}
                </li>
              ))}
              <li className="text-secure">
                $ <span className="animate-blink">▋</span>
              </li>
            </ul>
          )}
        </div>
      </Card>
    </>
  );
}
