"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, decrypt, encryptBytes, decryptBytes } from "@/lib/crypto";
import type { VaultAccess, VaultCategory } from "@/lib/types";

const vaultSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum([
    "certificate",
    "contract",
    "invoice",
    "customs",
    "insurance",
    "identity",
    "other",
  ]),
  access_level: z.enum(["private", "restricted", "time_locked"]),
  content: z.string().min(1, "Document content is required."),
  file_name: z.string().optional(),
  unlock_at: z.string().optional(),
});

export interface VaultState {
  error?: string;
  ok?: boolean;
}

/** Encrypts content server-side, then stores only ciphertext. */
export async function createVaultItem(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = vaultSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const d = parsed.data;
  const timeLocked = d.access_level === "time_locked";
  if (timeLocked && !d.unlock_at) return { error: "Pick an unlock date for a time-locked item." };

  let bundle;
  try {
    bundle = encrypt(d.content);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Encryption failed." };
  }

  const { error } = await supabase.from("vault_items").insert({
    owner_id: user.id,
    title: d.title,
    description: d.description || null,
    category: d.category as VaultCategory,
    access_level: d.access_level as VaultAccess,
    encrypted_content: bundle.ciphertext,
    content_iv: bundle.iv,
    content_tag: bundle.tag,
    file_name: d.file_name || null,
    byte_size: Buffer.byteLength(d.content, "utf8"),
    unlock_at: timeLocked ? new Date(d.unlock_at!).toISOString() : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/vault");
  return { ok: true };
}

const BUCKET = "vault-files";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const fileMetaSchema = vaultSchema.omit({ content: true, file_name: true });

/**
 * Encrypts an uploaded file server-side and stores only the ciphertext blob in
 * a private Storage bucket; the row keeps the IV + auth tag needed to decrypt.
 */
export async function createVaultFileItem(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_FILE_BYTES) return { error: "File exceeds the 10 MB limit." };

  const parsed = fileMetaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;
  const timeLocked = d.access_level === "time_locked";
  if (timeLocked && !d.unlock_at) return { error: "Pick an unlock date for a time-locked item." };

  let cipher;
  try {
    cipher = encryptBytes(Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Encryption failed." };
  }

  const admin = createAdminClient();
  const itemId = randomUUID();
  const path = `${user.id}/${itemId}`;

  const upload = await admin.storage.from(BUCKET).upload(path, cipher.data, {
    contentType: "application/octet-stream",
    upsert: false,
  });
  if (upload.error) return { error: `Storage upload failed: ${upload.error.message}` };

  const { error } = await supabase.from("vault_items").insert({
    id: itemId,
    owner_id: user.id,
    title: d.title,
    description: d.description || null,
    category: d.category as VaultCategory,
    access_level: d.access_level as VaultAccess,
    encrypted_content: null,
    storage_path: path,
    content_iv: cipher.iv,
    content_tag: cipher.tag,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    byte_size: file.size,
    unlock_at: timeLocked ? new Date(d.unlock_at!).toISOString() : null,
  });
  if (error) {
    await admin.storage.from(BUCKET).remove([path]); // don't orphan the blob
    return { error: error.message };
  }

  revalidatePath("/dashboard/vault");
  return { ok: true };
}

export interface FileDownload {
  error?: string;
  lockedUntil?: string;
  fileName?: string;
  mimeType?: string;
  base64?: string;
}

/** Ownership + time-lock checked, blob downloaded, decrypted, audit-logged. */
export async function downloadVaultFile(itemId: string): Promise<FileDownload> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: item } = await supabase
    .from("vault_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();
  if (!item || !item.storage_path) return { error: "File not found." };

  const admin = createAdminClient();

  if (item.unlock_at && new Date(item.unlock_at) > new Date()) {
    await admin.from("vault_audit_log").insert({
      vault_item_id: item.id,
      actor_id: user.id,
      action: "unlock_denied",
      detail: `Time-locked until ${item.unlock_at}`,
    });
    return { error: "This document is time-locked.", lockedUntil: item.unlock_at };
  }

  const dl = await admin.storage.from(BUCKET).download(item.storage_path);
  if (dl.error || !dl.data) return { error: "Could not retrieve the encrypted file." };

  let plain: Buffer;
  try {
    plain = decryptBytes(
      Buffer.from(await dl.data.arrayBuffer()),
      item.content_iv,
      item.content_tag
    );
  } catch {
    return { error: "Decryption failed — integrity check did not pass." };
  }

  await admin.from("vault_audit_log").insert({
    vault_item_id: item.id,
    actor_id: user.id,
    action: "decrypted",
    detail: item.file_name ?? item.title,
  });
  revalidatePath(`/dashboard/vault/${itemId}`);

  return {
    fileName: item.file_name ?? "vault-file",
    mimeType: item.mime_type ?? "application/octet-stream",
    base64: plain.toString("base64"),
  };
}

export interface DecryptResult {
  content?: string;
  error?: string;
  lockedUntil?: string;
}

/**
 * Returns plaintext only after verifying (a) the caller owns the item and
 * (b) any time-lock has elapsed. Every attempt is written to the audit log.
 */
export async function revealVaultItem(itemId: string): Promise<DecryptResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // RLS already restricts to the owner; this also fetches the lock state.
  const { data: item } = await supabase
    .from("vault_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return { error: "Item not found." };

  const admin = createAdminClient();

  if (item.unlock_at && new Date(item.unlock_at) > new Date()) {
    await admin.from("vault_audit_log").insert({
      vault_item_id: item.id,
      actor_id: user.id,
      action: "unlock_denied",
      detail: `Time-locked until ${item.unlock_at}`,
    });
    return { error: "This document is time-locked.", lockedUntil: item.unlock_at };
  }

  let content: string;
  try {
    content = decrypt({
      ciphertext: item.encrypted_content,
      iv: item.content_iv,
      tag: item.content_tag,
    });
  } catch {
    return { error: "Decryption failed — integrity check did not pass." };
  }

  await admin.from("vault_audit_log").insert({
    vault_item_id: item.id,
    actor_id: user.id,
    action: "decrypted",
    detail: item.title,
  });
  revalidatePath(`/dashboard/vault/${itemId}`);

  return { content };
}

export async function deleteVaultItem(itemId: string) {
  const supabase = createClient();
  const { data: item } = await supabase
    .from("vault_items")
    .select("storage_path")
    .eq("id", itemId)
    .maybeSingle();

  const { error } = await supabase.from("vault_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  if (item?.storage_path) {
    await createAdminClient().storage.from(BUCKET).remove([item.storage_path]);
  }
  revalidatePath("/dashboard/vault");
}
