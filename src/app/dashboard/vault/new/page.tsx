import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { VaultForm } from "@/components/vault/vault-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Add vault document — ShipVault" };

export default function NewVaultItemPage() {
  return (
    <>
      <Link
        href="/dashboard/vault"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Vault
      </Link>
      <PageHeader
        title="Add a document"
        description="Content is encrypted with AES-256-GCM on the server before storage."
      />
      <Card className="max-w-3xl border-vault/20">
        <CardContent className="pt-6">
          <div className="mb-5 flex items-center gap-2 text-sm text-vault">
            <ShieldCheck className="h-4 w-4" /> End-to-end server-side encryption
          </div>
          <VaultForm />
        </CardContent>
      </Card>
    </>
  );
}
