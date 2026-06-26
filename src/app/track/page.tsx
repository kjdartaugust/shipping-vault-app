"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Radar, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { trackByNumber } from "@/lib/actions/shipments";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { formatDate } from "@/lib/utils";

type Result = Awaited<ReturnType<typeof trackByNumber>>;

function TrackInner() {
  const initial = useSearchParams().get("n") ?? "";
  const [number, setNumber] = useState(initial);
  const [result, setResult] = useState<Result | "none" | null>(null);
  const [pending, start] = useTransition();

  function run(value: string) {
    if (!value.trim()) return;
    start(async () => {
      const r = await trackByNumber(value);
      setResult(r ?? "none");
    });
  }

  // Auto-run when arriving from the homepage tracker.
  useEffect(() => {
    if (initial) run(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card">
          <Radar className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Shipment Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Enter a tracking ID to follow the chain of custody.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(number);
        }}
        className="glass mt-6 flex gap-2 rounded-xl p-2"
      >
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="VX1A2B3C4D5E"
          className="h-11 flex-1 bg-transparent px-3 font-mono text-sm tracking-wide outline-none placeholder:text-muted-foreground/60"
        />
        <Button type="submit" size="lg" disabled={pending}>
          <Search className="h-4 w-4" />
          {pending ? "Scanning…" : "Track"}
        </Button>
      </form>

      {result === "none" && (
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No shipment found for that tracking ID.
        </div>
      )}

      {result && result !== "none" && (
        <Card className="mt-8 animate-fade-in">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-mono text-lg">{result.shipment.tracking_number}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.shipment.origin} → {result.shipment.destination}
              </p>
            </div>
            <StatusBadge status={result.shipment.status} />
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Service" value={result.shipment.service} />
              <Field label="Booked" value={formatDate(result.shipment.created_at)} />
              <Field label="Est. delivery" value={formatDate(result.shipment.estimated_delivery)} />
            </div>
            <div>
              <p className="mb-4 flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-secure" /> Chain of custody
              </p>
              <TrackingTimeline events={result.events} />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Brand />
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Suspense>
          <TrackInner />
        </Suspense>
      </main>
    </div>
  );
}
