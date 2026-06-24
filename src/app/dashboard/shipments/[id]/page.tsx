import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User, Scale, DollarSign, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { ShipmentActions } from "@/components/shipment-actions";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Shipment, ShipmentEvent, Waybill } from "@/lib/types";

export default async function ShipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!shipment) notFound();
  const s = shipment as Shipment;

  const [{ data: events }, { data: waybill }] = await Promise.all([
    supabase
      .from("shipment_events")
      .select("*")
      .eq("shipment_id", s.id)
      .order("created_at", { ascending: true }),
    supabase.from("waybills").select("*").eq("shipment_id", s.id).maybeSingle(),
  ]);

  const canManage =
    profile.role === "admin" || profile.id === s.agent_id || profile.id === s.owner_id;

  return (
    <>
      <Link
        href="/dashboard/shipments"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Shipments
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold">{s.tracking_number}</h1>
            <StatusBadge status={s.status} />
          </div>
          <p className="mt-1 text-muted-foreground">
            {s.origin} → {s.destination}
          </p>
        </div>
        <ShipmentActions
          id={s.id}
          status={s.status}
          canManage={canManage}
          hasWaybill={!!waybill}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking history</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingTimeline events={(events ?? []) as ShipmentEvent[]} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Detail icon={User} label="Recipient" value={s.recipient_name} />
              <Detail icon={MapPin} label="Destination" value={s.destination} />
              <Detail icon={Scale} label="Weight" value={`${s.weight_kg} kg`} />
              <Detail
                icon={DollarSign}
                label="Declared value"
                value={formatMoney(s.declared_value)}
              />
              <Detail icon={FileText} label="Service" value={s.service} />
              <Detail
                icon={FileText}
                label="Est. delivery"
                value={formatDate(s.estimated_delivery)}
              />
            </CardContent>
          </Card>

          {waybill && <WaybillCard waybill={waybill as Waybill} shipment={s} />}
        </div>
      </div>
    </>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function WaybillCard({ waybill, shipment }: { waybill: Waybill; shipment: Shipment }) {
  return (
    <Card className="border-primary/30">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Waybill</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">
          {waybill.waybill_number}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="rounded-lg border border-dashed border-border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Consignee</p>
          <p className="font-medium">{shipment.recipient_name}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Route</p>
          <p className="font-medium">
            {shipment.origin} → {shipment.destination}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Issued {formatDate(waybill.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
