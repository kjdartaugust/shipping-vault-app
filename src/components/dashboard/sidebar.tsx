"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackageSearch,
  Lock,
  Bell,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/shipments", label: "Shipments", icon: Package },
  { href: "/track", label: "Track", icon: PackageSearch },
  { href: "/dashboard/vault", label: "Vault", icon: Lock, vault: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
  { href: "/admin", label: "Admin Console", icon: ShieldCheck },
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? l.vault
              ? "bg-vault/15 text-vault"
              : "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <l.icon className="h-4 w-4" />
        {l.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1 p-4">
      {links.map(item)}
      {role === "admin" && (
        <>
          <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>
          {adminLinks.map(item)}
        </>
      )}
    </nav>
  );
}
