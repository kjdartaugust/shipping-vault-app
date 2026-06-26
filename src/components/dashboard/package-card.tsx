import Link from "next/link";
import { MapPin, ArrowRight, Weight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { securityClearance, formatMoney } from "@/lib/utils";
import type { Shipment } from "@/lib/types";

export function PackageCard({ shipment: s }: { shipment: Shipment }) {
  const clearance = securityClearance(s.declared_value);
  return (
    <Link href={`/dashboard/shipments/${s.id}`}>
      <Card className="group h-full p-5 transition hover:border-primary/40 hover:glow-primary">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="terminal uppercase tracking-wider text-muted-foreground">Tracking ID</p>
            <p className="font-mono text-sm font-semibold text-primary">{s.tracking_number}</p>
          </div>
          <Badge className={`terminal ${clearance.tone}`}>{clearance.label}</Badge>
        </div>

        <div className="my-4 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {s.origin}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary transition group-hover:translate-x-0.5" />
          <span className="flex items-center gap-1.5 font-medium">{s.destination}</span>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Weight className="h-3.5 w-3.5" /> {s.weight_kg} kg · {formatMoney(s.declared_value)}
          </span>
          <StatusBadge status={s.status} />
        </div>
      </Card>
    </Link>
  );
}
