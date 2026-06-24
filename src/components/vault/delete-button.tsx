"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteVaultItem } from "@/lib/actions/vault";
import { Button } from "@/components/ui/button";

export function DeleteVaultButton({ itemId }: { itemId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Permanently delete this vault item? This cannot be undone.")) return;
        start(async () => {
          await deleteVaultItem(itemId);
          toast.success("Vault item deleted");
          router.push("/dashboard/vault");
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" /> Delete
    </Button>
  );
}
