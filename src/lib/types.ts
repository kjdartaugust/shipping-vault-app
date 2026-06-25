export type UserRole = "user" | "agent" | "admin";

export type ShipmentStatus =
  | "pending"
  | "booked"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "exception";

export type ServiceType = "standard" | "express" | "overnight" | "freight";

export type VaultCategory =
  | "certificate"
  | "contract"
  | "invoice"
  | "customs"
  | "insurance"
  | "identity"
  | "other";

export type VaultAccess = "private" | "restricted" | "time_locked";

export type NotificationType = "info" | "success" | "warning" | "security";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  owner_id: string;
  agent_id: string | null;
  tracking_number: string;
  status: ShipmentStatus;
  service: ServiceType;
  origin: string;
  destination: string;
  recipient_name: string;
  recipient_phone: string | null;
  weight_kg: number;
  declared_value: number;
  notes: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location: string | null;
  note: string | null;
  created_at: string;
}

export interface Waybill {
  id: string;
  shipment_id: string;
  waybill_number: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface VaultItem {
  id: string;
  owner_id: string;
  shipment_id: string | null;
  category: VaultCategory;
  access_level: VaultAccess;
  title: string;
  description: string | null;
  encrypted_content: string | null;
  storage_path: string | null;
  content_iv: string;
  content_tag: string;
  file_name: string | null;
  mime_type: string | null;
  byte_size: number;
  unlock_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultAuditEntry {
  id: string;
  vault_item_id: string | null;
  actor_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  read: boolean;
  created_at: string;
}
