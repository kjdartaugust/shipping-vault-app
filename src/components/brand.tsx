import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-vault text-white shadow-lg">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="text-lg tracking-tight">
        Ship<span className="text-gradient">Vault</span>
      </span>
    </Link>
  );
}
