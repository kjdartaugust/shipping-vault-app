import { CheckCircle2, Circle, Dot } from "lucide-react";
import { cn, timeAgo, SHIPMENT_STATUS_META } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";

interface Event {
  status: ShipmentStatus;
  location: string | null;
  note: string | null;
  created_at: string;
}

export function TrackingTimeline({ events }: { events: Event[] }) {
  if (events.length === 0)
    return <p className="text-sm text-muted-foreground">No tracking events yet.</p>;

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full",
                last ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {last ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </span>
            <div className="flex flex-wrap items-center gap-x-2">
              <p className="font-medium">{SHIPMENT_STATUS_META[e.status].label}</p>
              {e.location && (
                <span className="flex items-center text-sm text-muted-foreground">
                  <Dot className="h-4 w-4" /> {e.location}
                </span>
              )}
            </div>
            {e.note && <p className="text-sm text-muted-foreground">{e.note}</p>}
            <p className="text-xs text-muted-foreground/70">{timeAgo(e.created_at)}</p>
          </li>
        );
      })}
    </ol>
  );
}
