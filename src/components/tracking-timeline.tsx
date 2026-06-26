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
    <ol className="relative space-y-7 border-l border-border/80 pl-7">
      {events.map((e, i) => {
        const meta = SHIPMENT_STATUS_META[e.status];
        const last = i === events.length - 1;
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[35px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background",
                meta.dot,
                last && "animate-pulse-ring"
              )}
            />
            <div className="flex flex-wrap items-center gap-x-2">
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", meta.tone)}>
                {meta.label}
              </span>
              {e.location && (
                <span className="text-sm text-muted-foreground">· {e.location}</span>
              )}
            </div>
            {e.note && <p className="mt-1 text-sm text-foreground/80">{e.note}</p>}
            <p className="mt-0.5 terminal text-muted-foreground/70">{timeAgo(e.created_at)}</p>
          </li>
        );
      })}
    </ol>
  );
}
