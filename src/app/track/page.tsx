"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PackageSearch, ArrowLeft } from "lucide-react";
import { trackByNumber } from "@/lib/actions/shipments";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { formatDate } from "@/lib/utils";

type Result = Awaited<ReturnType<typeof trackByNumber>>;

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Result | "none" | null>(null);
  const [pending, start] = useTransition();

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) return;
    start(async () => {
      const r = await trackByNumber(number);
      setResult(r ?? "none");
    });
  }

  return (
    <div className="min-h-screen vault-grid">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Brand />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Track a shipment</h1>
        <p className="mt-2 text-muted-foreground">
          Enter a tracking number (e.g. <code>SV1A2B3C4D5E</code>) to see its journey.
        </p>

        <form onSubmit={search} className="mt-6 flex gap-2">
          <Input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Tracking number"
            className="font-mono"
          />
          <Button type="submit" disabled={pending}>
            <PackageSearch className="h-4 w-4" />
            {pending ? "Searching…" : "Track"}
          </Button>
        </form>

        {result === "none" && (
          <p className="mt-8 rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            No shipment found for that tracking number.
          </p>
        )}

        {result && result !== "none" && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono">{result.shipment.tracking_number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {result.shipment.origin} → {result.shipment.destination}
                </p>
              </div>
              <StatusBadge status={result.shipment.status} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Field label="Service" value={result.shipment.service} />
                <Field label="Booked" value={formatDate(result.shipment.created_at)} />
                <Field
                  label="Est. delivery"
                  value={formatDate(result.shipment.estimated_delivery)}
                />
              </div>
              <TrackingTimeline events={result.events} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium capitalize">{value}</p>
    </div>
  );
}
