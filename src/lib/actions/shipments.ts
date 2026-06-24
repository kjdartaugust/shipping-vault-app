"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceType, ShipmentStatus } from "@/lib/types";

const bookingSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  recipient_name: z.string().min(2),
  recipient_phone: z.string().optional(),
  service: z.enum(["standard", "express", "overnight", "freight"]),
  weight_kg: z.coerce.number().min(0),
  declared_value: z.coerce.number().min(0),
  estimated_delivery: z.string().optional(),
  notes: z.string().optional(),
});

export interface BookingState {
  error?: string;
  ok?: boolean;
}

export async function bookShipment(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { error } = await supabase.from("shipments").insert({
    owner_id: user.id,
    ...parsed.data,
    service: parsed.data.service as ServiceType,
    estimated_delivery: parsed.data.estimated_delivery || null,
    status: "booked",
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/shipments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function advanceStatus(shipmentId: string, status: ShipmentStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("shipments")
    .update({ status })
    .eq("id", shipmentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/shipments/${shipmentId}`);
  revalidatePath("/admin");
}

export async function assignAgent(shipmentId: string, agentId: string | null) {
  const supabase = createClient();
  const { error } = await supabase
    .from("shipments")
    .update({ agent_id: agentId })
    .eq("id", shipmentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function generateWaybill(shipmentId: string) {
  const supabase = createClient();
  const { data: shipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .single();
  if (!shipment) throw new Error("Shipment not found.");

  const payload = {
    issued_at: new Date().toISOString(),
    sender: shipment.origin,
    consignee: shipment.recipient_name,
    destination: shipment.destination,
    service: shipment.service,
    weight_kg: shipment.weight_kg,
    declared_value: shipment.declared_value,
  };

  const { error } = await supabase
    .from("waybills")
    .upsert({ shipment_id: shipmentId, payload }, { onConflict: "shipment_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/shipments/${shipmentId}`);
}

/**
 * Public tracking — no auth. Uses the service-role client (RLS bypass) but
 * deliberately returns only non-sensitive fields so anyone with a tracking
 * number can follow a parcel without exposing owner data.
 */
export async function trackByNumber(trackingNumber: string) {
  const admin = createAdminClient();
  const { data: shipment } = await admin
    .from("shipments")
    .select("id, tracking_number, status, service, origin, destination, estimated_delivery, created_at")
    .eq("tracking_number", trackingNumber.trim().toUpperCase())
    .maybeSingle();

  if (!shipment) return null;

  const { data: events } = await admin
    .from("shipment_events")
    .select("status, location, note, created_at")
    .eq("shipment_id", shipment.id)
    .order("created_at", { ascending: true });

  return { shipment, events: events ?? [] };
}
