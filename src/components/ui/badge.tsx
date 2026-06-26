import * as React from "react";
import { cn } from "@/lib/utils";
import { SHIPMENT_STATUS_META } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const meta = SHIPMENT_STATUS_META[status];
  return (
    <Badge className={`gap-1.5 ${meta.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
}
