import Link from "next/link";
import { Lock, Plus, ShieldCheck, Clock, FileText, FileLock2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VaultDoor } from "@/components/vault/vault-door";
import { Countdown } from "@/components/vault/countdown";
import { UnlockCard } from "@/components/motion";
import {
  VAULT_CATEGORY_LABEL,
  VAULT_ACCESS_META,
  formatBytes,
  formatDate,
} from "@/lib/utils";
import type { VaultItem } from "@/lib/types";

export const metadata = { title: "Vault — VaultEx" };

export default async function VaultPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vault_items")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as VaultItem[];

  return (
    <>
      <VaultDoor />
      <PageHeader
        title="Secure Vault"
        description="AES-256 encrypted storage for high-value documents."
        action={
          <Link href="/dashboard/vault/new">
            <Button variant="vault">
              <Plus className="h-4 w-4" /> Add document
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-vault/30 bg-vault/5 p-4 text-sm">
        <span className="flex items-center gap-2 font-medium text-vault">
          <ShieldCheck className="h-4 w-4" /> AES-256-GCM
        </span>
        <span className="terminal text-muted-foreground">OWNER-ONLY RLS</span>
        <span className="terminal text-muted-foreground">AUDIT TRAIL</span>
        <span className="terminal text-muted-foreground">TIME-LOCKED RELEASE</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-vault/30 bg-vault/10">
              <Lock className="h-6 w-6 text-vault" />
            </div>
            <p className="font-medium">Your vault is empty</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Store a certificate, contract or customs document securely.
            </p>
            <Link href="/dashboard/vault/new">
              <Button variant="vault" size="sm">
                <Plus className="h-4 w-4" /> Add your first document
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const locked = !!item.unlock_at && new Date(item.unlock_at) > new Date();
            const access = VAULT_ACCESS_META[item.access_level];
            const isFile = !!item.storage_path;
            return (
              <UnlockCard
                key={item.id}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: (i % 6) * 0.04 }}
                className="h-full"
              >
                <Link href={`/dashboard/vault/${item.id}`} className="block h-full">
                  <Card className="group relative h-full overflow-hidden p-5 transition hover:border-vault/50 hover:glow-vault">
                    <div className="absolute inset-0 -z-10 hex-bg opacity-0 transition group-hover:opacity-100" />
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                          locked
                            ? "bg-vault/15 text-vault animate-pulse-ring"
                            : "bg-vault/10 text-vault"
                        }`}
                      >
                        {locked ? (
                          <Clock className="h-5 w-5" />
                        ) : isFile ? (
                          <FileLock2 className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className="bg-secondary text-secondary-foreground">
                          {VAULT_CATEGORY_LABEL[item.category]}
                        </Badge>
                        <Badge className={`terminal ${access.tone}`}>{access.label}</Badge>
                      </div>
                    </div>

                    <h3 className="font-display font-semibold leading-tight">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      {locked ? (
                        <Countdown unlockAt={item.unlock_at!} compact />
                      ) : (
                        <span className="terminal flex items-center gap-1.5">
                          <Lock className="h-3 w-3 text-vault" /> {formatBytes(item.byte_size)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {formatDate(item.created_at)}
                        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </UnlockCard>
            );
          })}
        </div>
      )}
    </>
  );
}
