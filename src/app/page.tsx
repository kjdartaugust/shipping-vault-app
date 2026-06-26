import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Clock,
  ScrollText,
  Truck,
  Radar,
  ArrowRight,
  KeyRound,
  Fingerprint,
  Boxes,
} from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { HeroTracker } from "@/components/landing/hero-tracker";
import { Reveal, UnlockCard } from "@/components/motion";

const featureCards = [
  {
    icon: Truck,
    accent: "text-primary",
    ring: "group-hover:glow-primary",
    title: "Logistics Command",
    body: "Book, dispatch, and track every shipment from one obsidian-dark control console with live, color-coded status states.",
  },
  {
    icon: Lock,
    accent: "text-vault",
    ring: "group-hover:glow-vault",
    title: "Encrypted Vault",
    body: "AES-256-GCM secures certificates, contracts and customs docs. Plaintext never touches the database — ciphertext only.",
  },
  {
    icon: Clock,
    accent: "text-secure",
    ring: "group-hover:glow-secure",
    title: "Time-Locked Release",
    body: "Seal documents until a precise moment. A live countdown governs release; decryption is blocked until zero.",
  },
];

const capabilities = [
  { icon: Fingerprint, title: "Owner-only RLS", body: "Row Level Security guarantees only you can read your vault — admins see the trail, never the contents." },
  { icon: ScrollText, title: "Immutable audit log", body: "Every view, decrypt and change is timestamped in a tamper-evident terminal ledger." },
  { icon: KeyRound, title: "Granular clearance", body: "Owner, Viewer and Time-locked access tiers with security-clearance classification per shipment." },
  { icon: Radar, title: "Live tracking", body: "Public tracking by ID with a milestone timeline driven straight from the database." },
  { icon: Boxes, title: "Waybills & dispatch", body: "Generate professional waybills and assign delivery agents in seconds." },
  { icon: ShieldCheck, title: "Enterprise hardened", body: "Service-role isolation, signed sessions, and middleware-guarded routes throughout." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 grid-bg-animated radial-fade" />
        <div className="absolute inset-0 -z-10 hex-bg opacity-60 radial-fade" />
        <div className="absolute left-1/2 top-[-10%] -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <div className="mx-auto max-w-5xl px-6 pb-24 pt-40 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-secure/30 bg-secure/10 px-4 py-1.5 text-xs font-medium text-secure">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secure opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secure" />
              </span>
              SECURE · AES-256 · SOC-2 MINDSET
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-7 font-display text-6xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Ship. <span className="text-glow text-primary">Secure.</span> Control.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              VaultEx unifies premium logistics with an enterprise-grade document
              vault — so your shipments and the paperwork that proves their value
              live in one encrypted, fully auditable command center.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10">
              <HeroTracker />
              <p className="mt-3 text-xs text-muted-foreground">
                Track any shipment instantly, or{" "}
                <Link href="/register" className="text-primary hover:underline">
                  open a secure account
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>

        {/* Floating feature cards */}
        <div id="features" className="mx-auto -mt-6 max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((f, i) => (
              <UnlockCard
                key={f.title}
                transition={{ type: "spring", stiffness: 280, damping: 22, delay: i * 0.08 }}
                className={`group glass rounded-2xl p-7 transition-shadow ${f.ring}`}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background/60">
                  <f.icon className={`h-6 w-6 ${f.accent}`} />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </UnlockCard>
            ))}
          </div>
        </div>
      </section>

      {/* Capability grid */}
      <section id="security" className="relative border-t border-border/60 py-24">
        <div className="absolute inset-0 -z-10 grid-bg opacity-40" />
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight">
              The most secure platform logistics has seen
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built on a zero-trust posture: encryption at the field level, strict
              ownership boundaries, and an audit trail that never forgets.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 0.06} className="bg-card">
                <div className="h-full p-7 transition hover:bg-secondary/40">
                  <c.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-display font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border/60 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl p-12 text-center glow-primary">
              <div className="absolute inset-0 -z-10 hex-bg opacity-50" />
              <h2 className="font-display text-4xl font-bold tracking-tight">
                Take control of every shipment and secret.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Spin up your encrypted command center in under a minute.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register">
                  <Button size="lg">
                    Access Vault <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/track">
                  <Button size="lg" variant="outline">
                    Track a shipment
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <Brand />
          <p>© {new Date().getFullYear()} VaultEx — Ship. Secure. Control.</p>
        </div>
      </footer>
    </div>
  );
}
