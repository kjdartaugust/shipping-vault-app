"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Copy, Unlock } from "lucide-react";
import { revealVaultItem } from "@/lib/actions/vault";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function VaultReveal({
  itemId,
  locked,
  unlockAt,
}: {
  itemId: string;
  locked: boolean;
  unlockAt: string | null;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (locked) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-vault/30 bg-vault/10 p-4 text-sm">
        <Lock className="h-5 w-5 text-vault" />
        <div>
          <p className="font-medium text-vault">Time-locked</p>
          <p className="text-muted-foreground">
            Unlocks {formatDate(unlockAt)}. Decryption is blocked until then.
          </p>
        </div>
      </div>
    );
  }

  function reveal() {
    start(async () => {
      const res = await revealVaultItem(itemId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setContent(res.content ?? "");
      toast.success("Decrypted — logged to audit trail");
    });
  }

  if (content === null) {
    return (
      <Button variant="vault" onClick={reveal} disabled={pending}>
        <Unlock className="h-4 w-4" /> {pending ? "Decrypting…" : "Decrypt & reveal"}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-emerald-500">
          <Eye className="h-4 w-4" /> Decrypted
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Copied");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setContent(null)}>
            <EyeOff className="h-3.5 w-3.5" /> Hide
          </Button>
        </div>
      </div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-4 text-sm">
        {content}
      </pre>
    </div>
  );
}
