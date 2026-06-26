import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Fingerprint,
  Calendar,
  Tag,
  ShieldAlert,
  ScrollText,
  Clock,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultReveal } from "@/components/vault/vault-reveal";
import { DeleteVaultButton } from "@/components/vault/delete-button";
import { Countdown } from "@/components/vault/countdown";
import {
  VAULT_CATEGORY_LABEL,
  VAULT_ACCESS_META,
  formatBytes,
  formatDate,
  timeAgo,
} from "@/lib/utils";
import type { VaultItem, VaultAuditEntry } from "@/lib/types";

const ACTION_LABEL: Record<string, string> = {
  created: "CREATED",
  updated: "UPDATED",
  deleted: "DELETED",
  decrypted: "DECRYPTED",
  viewed: "VIEWED",
  unlock_denied: "UNLOCK_DENIED",
};

const ACTION_TONE: Record<string, string> = {
  decrypted: "text-secure",
  created: "text-primary",
  updated: "text-primary",
  deleted: "text-red-400",
  unlock_denied: "text-amber-400",
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
  const access = VAULT_ACCESS_META[v.access_level];

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
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight">{v.title}</h1>
            <Badge className="bg-vault/15 text-vault ring-1 ring-vault/30">
              {VAULT_CATEGORY_LABEL[v.category]}
            </Badge>
            <Badge className={`terminal ${access.tone}`}>{access.label}</Badge>
          </div>
          {v.description && <p className="mt-1 text-muted-foreground">{v.description}</p>}
        </div>
        <DeleteVaultButton itemId={v.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {locked && (
            <Card className="border-vault/30 bg-vault/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-vault" /> Time-locked — releases in
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Countdown unlockAt={v.unlock_at!} />
                <p className="terminal text-muted-foreground">
                  TARGET: {new Date(v.unlock_at!).toISOString()}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-vault/20">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-vault" /> Encrypted content
              </CardTitle>
              <Badge className="gap-1.5 bg-secure/15 text-secure ring-1 ring-secure/30">
                <Lock className="h-3 w-3" /> AES-256-GCM
              </Badge>
            </CardHeader>
            <CardContent>
              <VaultReveal
                itemId={v.id}
                locked={locked}
                unlockAt={v.unlock_at}
                isFile={!!v.storage_path}
                fileName={v.file_name}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Tag} label="Access" value={access.label} />
              <Row icon={Fingerprint} label="Size" value={formatBytes(v.byte_size)} />
              <Row icon={Calendar} label="Stored" value={formatDate(v.created_at)} />
              {v.file_name && <Row icon={Tag} label="File" value={v.file_name} />}
              {v.unlock_at && <Row icon={Calendar} label="Unlocks" value={formatDate(v.unlock_at)} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="h-4 w-4" /> Audit trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secure/70" />
                  <span className="ml-2 terminal text-muted-foreground">audit.log</span>
                </div>
                <ul className="terminal max-h-80 space-y-1.5 overflow-auto p-3">
                  {(audit ?? []).map((a: VaultAuditEntry) => (
                    <li key={a.id} className="flex items-start gap-2">
                      <span className="text-muted-foreground/50">
                        {new Date(a.created_at).toISOString().slice(5, 19).replace("T", " ")}
                      </span>
                      <span className={ACTION_TONE[a.action] ?? "text-foreground"}>
                        {ACTION_LABEL[a.action] ?? a.action.toUpperCase()}
                      </span>
                    </li>
                  ))}
                  {(!audit || audit.length === 0) && (
                    <li className="text-muted-foreground">// no activity recorded</li>
                  )}
                  <li className="text-secure">
                    ${" "}<span className="animate-blink">▋</span>
                  </li>
                </ul>
              </div>
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
