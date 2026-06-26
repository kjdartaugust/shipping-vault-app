import Link from "next/link";
import { Package, Truck, Lock, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PackageCard } from "@/components/dashboard/package-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Shipment } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const [{ data: shipments }, total, active, delivered, vault] = await Promise.all([
    supabase.from("shipments").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("shipments").select("*", { count: "exact", head: true }),
    supabase
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .in("status", ["booked", "in_transit", "out_for_delivery"]),
    supabase
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered"),
    supabase.from("vault_items").select("*", { count: "exact", head: true }),
  ]);

  const recent = (shipments ?? []) as Shipment[];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.full_name?.split(" ")[0] ?? "Operator"}`}
        description="Your shipping operations and secure vault at a glance."
        action={
          <Link href="/dashboard/shipments/new">
            <Button>
              <Plus className="h-4 w-4" /> New shipment
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total shipments" value={total.count ?? 0} icon={Package} />
        <StatCard label="In transit" value={active.count ?? 0} icon={Truck} accent="primary" />
        <StatCard label="Delivered" value={delivered.count ?? 0} icon={CheckCircle2} accent="secure" />
        <StatCard label="Vault items" value={vault.count ?? 0} icon={Lock} accent="vault" />
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent shipments</h2>
        <Link
          href="/dashboard/shipments"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
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
          {recent.map((s) => (
            <PackageCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </>
  );
}
