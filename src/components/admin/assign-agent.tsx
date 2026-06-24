"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { assignAgent } from "@/lib/actions/shipments";
import { Select } from "@/components/ui/input";
import type { Profile } from "@/lib/types";

export function AssignAgent({
  shipmentId,
  agentId,
  agents,
}: {
  shipmentId: string;
  agentId: string | null;
  agents: Pick<Profile, "id" | "full_name" | "email">[];
}) {
  const [pending, start] = useTransition();

  return (
    <Select
      defaultValue={agentId ?? ""}
      disabled={pending}
      className="h-8 w-44 text-xs"
      onChange={(e) =>
        start(async () => {
          await assignAgent(shipmentId, e.target.value || null);
          toast.success("Agent assignment updated");
        })
      }
    >
      <option value="">Unassigned</option>
      {agents.map((a) => (
        <option key={a.id} value={a.id}>
          {a.full_name ?? a.email}
        </option>
      ))}
    </Select>
  );
}
