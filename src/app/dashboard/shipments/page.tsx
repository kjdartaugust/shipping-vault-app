import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { PackageCard } from "@/components/dashboard/package-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Shipment } from "@/lib/types";

export const metadata = { title: "Shipments — VaultEx" };

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
        description="All bookings, live tracking, and waybills."
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
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shipments.map((s) => (
            <PackageCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </>
  );
}
