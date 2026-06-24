import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Shipment } from "@/lib/types";

export const metadata = { title: "Shipments — ShipVault" };

export default async function ShipmentsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });
  const shipments = (data ?? []) as Shipment[];

  return (
    <>
      <PageHeader
        title="Shipments"
        description="All your bookings, tracking and waybills."
        action={
          <Link href="/dashboard/shipments/new">
            <Button>
              <Plus className="h-4 w-4" /> New shipment
            </Button>
          </Link>
        }
      />

      {shipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No shipments yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Book your first shipment to get started.
            </p>
            <Link href="/dashboard/shipments/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> New shipment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Tracking #</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 font-medium">Booked</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((s) => (
                  <tr key={s.id} className="transition hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/shipments/${s.id}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {s.tracking_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {s.origin} → {s.destination}
                    </td>
                    <td className="px-5 py-3 capitalize">{s.service}</td>
                    <td className="px-5 py-3">{formatMoney(s.declared_value)}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
