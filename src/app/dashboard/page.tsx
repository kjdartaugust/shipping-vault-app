import Link from "next/link";
import { Package, Truck, Lock, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Shipment } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const [{ data: shipments }, active, delivered, vault] = await Promise.all([
    supabase.from("shipments").select("*").order("created_at", { ascending: false }).limit(5),
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
        title={`Welcome back, ${profile.full_name?.split(" ")[0] ?? "there"}`}
        description="Your shipping activity and secure vault at a glance."
        action={
          <Link href="/dashboard/shipments/new">
            <Button>
              <Plus className="h-4 w-4" /> New shipment
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total shipments" value={recent.length ? "—" : 0} icon={Package} />
        <StatCard label="In transit" value={active.count ?? 0} icon={Truck} />
        <StatCard label="Delivered" value={delivered.count ?? 0} icon={CheckCircle2} />
        <StatCard label="Vault items" value={vault.count ?? 0} icon={Lock} vault />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent shipments</CardTitle>
          <Link
            href="/dashboard/shipments"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/shipments/${s.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {s.origin} → {s.destination}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {s.tracking_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="hidden text-muted-foreground sm:block">
                      {formatDate(s.created_at)}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
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
    </div>
  );
}
