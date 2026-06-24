"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bookShipment, type BookingState } from "@/lib/actions/shipments";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Booking…" : "Book shipment"}
    </Button>
  );
}

export function ShipmentForm() {
  const [state, action] = useFormState<BookingState, FormData>(bookShipment, {});
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.ok) {
      toast.success("Shipment booked");
      router.push("/dashboard/shipments");
    }
  }, [state, router]);

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="origin">Origin</Label>
        <Input id="origin" name="origin" placeholder="Accra, GH" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="destination">Destination</Label>
        <Input id="destination" name="destination" placeholder="London, UK" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="recipient_name">Recipient name</Label>
        <Input id="recipient_name" name="recipient_name" placeholder="Jane Doe" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="recipient_phone">Recipient phone</Label>
        <Input id="recipient_phone" name="recipient_phone" placeholder="+44 …" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="service">Service</Label>
        <Select id="service" name="service" defaultValue="standard">
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="overnight">Overnight</option>
          <option value="freight">Freight</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="estimated_delivery">Estimated delivery</Label>
        <Input id="estimated_delivery" name="estimated_delivery" type="date" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="weight_kg">Weight (kg)</Label>
        <Input id="weight_kg" name="weight_kg" type="number" step="0.01" min="0" defaultValue="1" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="declared_value">Declared value (USD)</Label>
        <Input
          id="declared_value"
          name="declared_value"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Handling instructions…" />
      </div>
      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}
