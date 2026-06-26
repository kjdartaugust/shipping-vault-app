import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "vault" | "secure";
  hint?: string;
}) {
  const tone = {
    primary: "bg-primary/10 text-primary",
    vault: "bg-vault/10 text-vault",
    secure: "bg-secure/10 text-secure",
  }[accent];

  return (
    <Card className="group relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-foreground/[0.02] transition group-hover:scale-150" />
      <div className="flex items-start justify-between">
        <div>
          <p className="terminal uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
