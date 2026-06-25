"use client";

import { useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { VaultForm } from "@/components/vault/vault-form";
import { VaultFileForm } from "@/components/vault/vault-file-form";

export function VaultComposer() {
  const [mode, setMode] = useState<"text" | "file">("text");

  const tab = (value: "text" | "file", label: string, Icon: typeof FileText) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
        mode === value
          ? "bg-vault text-vault-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary"
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-secondary/40 p-1">
        {tab("text", "Text / secret", FileText)}
        {tab("file", "File upload", UploadCloud)}
      </div>
      {mode === "text" ? <VaultForm /> : <VaultFileForm />}
    </div>
  );
}
