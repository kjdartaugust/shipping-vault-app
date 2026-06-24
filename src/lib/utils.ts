import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import type { ShipmentStatus, VaultCategory } from "@/lib/types";

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
  { label: string; tone: string }
> = {
  pending: { label: "Pending", tone: "bg-zinc-500/15 text-zinc-400" },
  booked: { label: "Booked", tone: "bg-blue-500/15 text-blue-400" },
  in_transit: { label: "In Transit", tone: "bg-amber-500/15 text-amber-400" },
  out_for_delivery: {
    label: "Out for Delivery",
    tone: "bg-indigo-500/15 text-indigo-400",
  },
  delivered: { label: "Delivered", tone: "bg-emerald-500/15 text-emerald-400" },
  cancelled: { label: "Cancelled", tone: "bg-rose-500/15 text-rose-400" },
  exception: { label: "Exception", tone: "bg-red-500/20 text-red-400" },
};

export const VAULT_CATEGORY_LABEL: Record<VaultCategory, string> = {
  certificate: "Certificate",
  contract: "Contract",
  invoice: "Invoice",
  customs: "Customs Doc",
  insurance: "Insurance",
  identity: "Identity",
  other: "Other",
};

/** Ordered milestones used by the tracking timeline UI. */
export const TRACKING_FLOW: ShipmentStatus[] = [
  "booked",
  "in_transit",
  "out_for_delivery",
  "delivered",
];
