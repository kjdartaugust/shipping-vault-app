import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Fingerprint,
  Calendar,
  Tag,
  ShieldAlert,
  ScrollText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultReveal } from "@/components/vault/vault-reveal";
import { DeleteVaultButton } from "@/components/vault/delete-button";
import {
  VAULT_CATEGORY_LABEL,
  formatBytes,
  formatDate,
  timeAgo,
} from "@/lib/utils";
import type { VaultItem, VaultAuditEntry } from "@/lib/types";

const ACTION_LABEL: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  decrypted: "Decrypted & viewed",
  viewed: "Viewed",
  unlock_denied: "Unlock denied (time-locked)",
};

export default async function VaultItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: item } = await supabase
    .from("vault_items")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!item) notFound();
  const v = item as VaultItem;

  const { data: audit } = await supabase
    .from("vault_audit_log")
    .select("*")
    .eq("vault_item_id", v.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const locked = !!v.unlock_at && new Date(v.unlock_at) > new Date();

  return (
    <>
      <Link
        href="/dashboard/vault"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Vault
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{v.title}</h1>
            <Badge className="bg-vault/15 text-vault">
              {VAULT_CATEGORY_LABEL[v.category]}
            </Badge>
          </div>
          {v.description && <p className="mt-1 text-muted-foreground">{v.description}</p>}
        </div>
        <DeleteVaultButton itemId={v.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-vault/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-vault" /> Encrypted content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VaultReveal itemId={v.id} locked={locked} unlockAt={v.unlock_at} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Tag} label="Access" value={v.access_level.replace("_", " ")} />
              <Row icon={Fingerprint} label="Size" value={formatBytes(v.byte_size)} />
              <Row icon={Calendar} label="Stored" value={formatDate(v.created_at)} />
              {v.file_name && <Row icon={Tag} label="File" value={v.file_name} />}
              {v.unlock_at && (
                <Row icon={Calendar} label="Unlocks" value={formatDate(v.unlock_at)} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="h-4 w-4" /> Audit trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {(audit ?? []).map((a: VaultAuditEntry) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span
                      className={
                        a.action === "unlock_denied" ? "text-amber-500" : "text-foreground"
                      }
                    >
                      {ACTION_LABEL[a.action] ?? a.action}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(a.created_at)}
                    </span>
                  </li>
                ))}
                {(!audit || audit.length === 0) && (
                  <li className="text-muted-foreground">No activity recorded.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
