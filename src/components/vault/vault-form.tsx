"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { createVaultItem, type VaultState } from "@/lib/actions/vault";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="vault" size="lg" disabled={pending}>
      <Lock className="h-4 w-4" /> {pending ? "Encrypting…" : "Encrypt & store"}
    </Button>
  );
}

export function VaultForm() {
  const [state, action] = useFormState<VaultState, FormData>(createVaultItem, {});
  const [access, setAccess] = useState("private");
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.ok) {
      toast.success("Document encrypted and stored");
      router.push("/dashboard/vault");
    }
  }, [state, router]);

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Certificate of Origin — INV-1042" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue="certificate">
          <option value="certificate">Certificate</option>
          <option value="contract">Contract</option>
          <option value="invoice">Invoice</option>
          <option value="customs">Customs Doc</option>
          <option value="insurance">Insurance</option>
          <option value="identity">Identity</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="access_level">Access level</Label>
        <Select
          id="access_level"
          name="access_level"
          value={access}
          onChange={(e) => setAccess(e.target.value)}
        >
          <option value="private">Private</option>
          <option value="restricted">Restricted</option>
          <option value="time_locked">Time-locked</option>
        </Select>
      </div>

      {access === "time_locked" && (
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="unlock_at">Unlock at</Label>
          <Input id="unlock_at" name="unlock_at" type="datetime-local" required />
          <p className="text-xs text-muted-foreground">
            The document stays sealed and undecryptable until this moment.
          </p>
        </div>
      )}

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="file_name">Reference file name (optional)</Label>
        <Input id="file_name" name="file_name" placeholder="origin-certificate.pdf" />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Short, non-sensitive label" />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="content">Document content / secret</Label>
        <Textarea
          id="content"
          name="content"
          rows={8}
          placeholder="Paste the sensitive text, key, or document body. It is encrypted with AES-256-GCM before it ever leaves the server."
          required
        />
        <p className="text-xs text-muted-foreground">
          Encrypted client-bound: plaintext is never stored in the database.
        </p>
      </div>

      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
