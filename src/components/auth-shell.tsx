import Link from "next/link";
import { ShieldCheck, Lock, Clock, ScrollText, ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";

const points = [
  { icon: Lock, text: "AES-256-GCM encryption at the field level" },
  { icon: ShieldCheck, text: "Owner-only Row Level Security" },
  { icon: Clock, text: "Time-locked document release" },
  { icon: ScrollText, text: "Immutable, timestamped audit trail" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / security panel */}
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:block">
        <div className="absolute inset-0 -z-10 grid-bg-animated opacity-60" />
        <div className="absolute inset-0 -z-10 hex-bg opacity-50" />
        <div className="absolute left-1/2 top-1/3 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
        <div className="flex h-full flex-col justify-between p-12">
          <Brand />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              The command center for <span className="text-primary text-glow">secure logistics</span>.
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
                    <p.icon className="h-4 w-4 text-secure" />
                  </span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="terminal text-muted-foreground/60">
            VAULTEX // SECURE SESSION GATEWAY
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 -z-10 grid-bg opacity-30 lg:hidden" />
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
