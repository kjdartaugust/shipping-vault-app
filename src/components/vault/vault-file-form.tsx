"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, UploadCloud } from "lucide-react";
import { createVaultFileItem, type VaultState } from "@/lib/actions/vault";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="vault" size="lg" disabled={pending}>
      <Lock className="h-4 w-4" /> {pending ? "Encrypting & uploading…" : "Encrypt & upload"}
    </Button>
  );
}

export function VaultFileForm() {
  const [state, action] = useFormState<VaultState, FormData>(createVaultFileItem, {});
  const [access, setAccess] = useState("private");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.ok) {
      toast.success("File encrypted and stored");
      router.push("/dashboard/vault");
    }
  }, [state, router]);

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="file">File</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-vault/40 bg-vault/5 px-4 py-8 text-center transition hover:bg-vault/10">
          <UploadCloud className="h-7 w-7 text-vault" />
          {file ? (
            <span className="text-sm font-medium">
              {file.name} <span className="text-muted-foreground">({formatBytes(file.size)})</span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Click to choose a file (max 10 MB)
            </span>
          )}
          <input
            id="file"
            name="file"
            type="file"
            className="hidden"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Bill of Lading — scan" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue="customs">
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
        </div>
      )}

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Short, non-sensitive label" />
      </div>

      <p className="text-xs text-muted-foreground sm:col-span-2">
        The file is encrypted with AES-256-GCM on the server; only ciphertext is
        written to Storage — the original bytes never persist unencrypted.
      </p>

      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
