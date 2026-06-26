"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Radar,
  Lock,
  Bell,
  ShieldCheck,
  ScrollText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/shipments", label: "Shipments", icon: Package },
  { href: "/track", label: "Track", icon: Radar },
  { href: "/dashboard/vault", label: "Vault", icon: Lock, vault: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
  { href: "/admin", label: "Console", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const item = (l: (typeof links)[number] & { vault?: boolean }) => {
    const active = l.href === "/dashboard" ? pathname === l.href : pathname.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? l.vault
              ? "bg-vault/15 text-vault"
              : "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        {active && (
          <span
            className={cn(
              "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full",
              l.vault ? "bg-vault" : "bg-primary"
            )}
          />
        )}
        <l.icon className="h-[18px] w-[18px]" />
        {l.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      <p className="px-3 pb-2 terminal uppercase tracking-widest text-muted-foreground/60">
        Operations
      </p>
      {links.map(item)}
      {role === "admin" && (
        <>
          <p className="mt-6 px-3 pb-2 terminal uppercase tracking-widest text-muted-foreground/60">
            Administration
          </p>
          {adminLinks.map(item)}
        </>
      )}
      <div className="mt-auto rounded-lg border border-secure/20 bg-secure/5 p-3">
        <p className="flex items-center gap-2 text-xs font-medium text-secure">
          <ShieldCheck className="h-4 w-4" /> System Secure
        </p>
        <p className="mt-1 terminal text-muted-foreground/70">AES-256 · RLS ACTIVE</p>
      </div>
    </nav>
  );
}
