"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, ChevronRight } from "lucide-react";
import { advanceStatus, generateWaybill } from "@/lib/actions/shipments";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import type { ShipmentStatus } from "@/lib/types";

const STATUSES: ShipmentStatus[] = [
  "pending",
  "booked",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "exception",
  "cancelled",
];

export function ShipmentActions({
  id,
  status,
  canManage,
  hasWaybill,
}: {
  id: string;
  status: ShipmentStatus;
  canManage: boolean;
  hasWaybill: boolean;
}) {
  const [next, setNext] = useState<ShipmentStatus>(status);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!hasWaybill && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await generateWaybill(id);
              toast.success("Waybill generated");
            })
          }
        >
          <FileText className="h-4 w-4" /> Generate waybill
        </Button>
      )}

      {canManage && (
        <div className="flex items-center gap-2">
          <Select
            value={next}
            onChange={(e) => setNext(e.target.value as ShipmentStatus)}
            className="w-48"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <Button
            disabled={pending || next === status}
            onClick={() =>
              start(async () => {
                await advanceStatus(id, next);
                toast.success("Status updated");
              })
            }
          >
            Update <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
