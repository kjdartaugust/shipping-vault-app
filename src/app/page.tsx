import Link from "next/link";
import {
  ShieldCheck,
  PackageSearch,
  Lock,
  Clock,
  FileCheck2,
  Truck,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Truck,
    title: "End-to-end Shipping",
    body: "Book, assign delivery agents, and generate professional waybills in seconds.",
  },
  {
    icon: PackageSearch,
    title: "Live Tracking",
    body: "A real-time milestone timeline keeps senders and recipients in sync.",
  },
  {
    icon: Lock,
    title: "Encrypted Vault",
    body: "AES-256-GCM field encryption secures certificates, contracts and customs docs.",
  },
  {
    icon: Clock,
    title: "Time-locked Release",
    body: "Schedule documents to unlock only after a date you choose.",
  },
  {
    icon: ScrollText,
    title: "Immutable Audit Trail",
    body: "Every view, decrypt and change is recorded for full accountability.",
  },
  {
    icon: FileCheck2,
    title: "Row-Level Privacy",
    body: "Supabase RLS guarantees only you can ever read your vault items.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen vault-grid">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center py-24 text-center animate-fade-in">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-vault/30 bg-vault/10 px-4 py-1.5 text-sm text-vault">
            <ShieldCheck className="h-4 w-4" /> Bank-grade document security
          </span>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Ship with confidence.{" "}
            <span className="text-gradient">Store with certainty.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            ShipVault unifies logistics and a high-security document vault — so
            your shipments and the paperwork that proves their value live in one
            encrypted, fully auditable place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Create your vault <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline">
                Track a shipment
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition hover:glow">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <Brand />
          <p>© {new Date().getFullYear()} ShipVault. Built for secure logistics.</p>
        </div>
      </footer>
    </div>
  );
}
