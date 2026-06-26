import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import type { ShipmentStatus, VaultCategory, VaultAccess } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export const SHIPMENT_STATUS_META: Record<
  ShipmentStatus,
  { label: string; tone: string; dot: string }
> = {
  pending: {
    label: "Queued",
    tone: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
    dot: "bg-slate-400",
  },
  booked: {
    label: "Secured",
    tone: "bg-secure/15 text-secure ring-1 ring-secure/30",
    dot: "bg-secure",
  },
  in_transit: {
    label: "In Transit",
    tone: "bg-primary/15 text-primary ring-1 ring-primary/30",
    dot: "bg-primary",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    tone: "bg-vault/15 text-vault ring-1 ring-vault/30",
    dot: "bg-vault",
  },
  delivered: {
    label: "Delivered",
    tone: "bg-secure/15 text-secure ring-1 ring-secure/30",
    dot: "bg-secure",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30",
    dot: "bg-slate-500",
  },
  exception: {
    label: "Flagged",
    tone: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40",
    dot: "bg-red-500",
  },
};

/** Derives a clearance classification from declared value for the badge UI. */
export function securityClearance(declaredValue: number): {
  label: string;
  tone: string;
} {
  if (declaredValue >= 10000)
    return { label: "TOP SECRET", tone: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40" };
  if (declaredValue >= 1000)
    return { label: "CLASSIFIED", tone: "bg-vault/15 text-vault ring-1 ring-vault/40" };
  return { label: "STANDARD", tone: "bg-secure/15 text-secure ring-1 ring-secure/30" };
}

export const VAULT_CATEGORY_LABEL: Record<VaultCategory, string> = {
  certificate: "Certificate",
  contract: "Contract",
  invoice: "Invoice",
  customs: "Customs Doc",
  insurance: "Insurance",
  identity: "Identity",
  other: "Other",
};

export const VAULT_ACCESS_META: Record<
  VaultAccess,
  { label: string; tone: string }
> = {
  private: { label: "Owner", tone: "bg-secure/15 text-secure ring-1 ring-secure/30" },
  restricted: { label: "Restricted", tone: "bg-primary/15 text-primary ring-1 ring-primary/30" },
  time_locked: { label: "Time-locked", tone: "bg-vault/15 text-vault ring-1 ring-vault/30" },
};

/** Ordered milestones used by the tracking timeline UI. */
export const TRACKING_FLOW: ShipmentStatus[] = [
  "booked",
  "in_transit",
  "out_for_delivery",
  "delivered",
];
