import Link from "next/link";
import {
  Lock,
  Plus,
  ShieldCheck,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VAULT_CATEGORY_LABEL, formatBytes, formatDate, timeAgo } from "@/lib/utils";
import type { VaultItem } from "@/lib/types";

export const metadata = { title: "Vault — ShipVault" };

export default async function VaultPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("vault_items")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as VaultItem[];

  return (
    <>
      <PageHeader
        title="Secure Vault"
        description="Encrypted storage for high-value shipment documents."
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
          <ShieldCheck className="h-4 w-4" /> AES-256-GCM encrypted
        </span>
        <span className="text-muted-foreground">Owner-only Row Level Security</span>
        <span className="text-muted-foreground">Full audit trail</span>
        <span className="text-muted-foreground">Time-locked release</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Lock className="mb-3 h-10 w-10 text-vault/50" />
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
          {items.map((item) => {
            const locked = !!item.unlock_at && new Date(item.unlock_at) > new Date();
            return (
              <Link key={item.id} href={`/dashboard/vault/${item.id}`}>
                <Card className="h-full transition hover:glow">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          locked ? "bg-vault/15 text-vault animate-pulse-ring" : "bg-vault/10 text-vault"
                        }`}
                      >
                        {locked ? <Clock className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {VAULT_CATEGORY_LABEL[item.category]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold leading-tight">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                      <span>
                        {locked ? `Unlocks ${formatDate(item.unlock_at)}` : formatBytes(item.byte_size)}
                      </span>
                      <span className="flex items-center gap-1">
                        {timeAgo(item.created_at)} <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
