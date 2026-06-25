import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

/**
 * Vault field-level encryption — AES-256-GCM.
 *
 * Document bytes are encrypted on the server before they are ever written to
 * Postgres, and decrypted only after an access check (ownership + time-lock).
 * The 256-bit key lives solely in the VAULT_ENCRYPTION_KEY env var, so a
 * database compromise alone never yields plaintext.
 */
const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = env.vaultKey;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be 64 hex characters (32 bytes). " +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, "hex");
}

export interface CipherBundle {
  ciphertext: string; // base64
  iv: string; // base64
  tag: string; // base64 auth tag
}

export function encrypt(plaintext: string): CipherBundle {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ciphertext: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decrypt(bundle: CipherBundle): string {
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(bundle.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(bundle.tag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(bundle.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export interface ByteCipher {
  data: Buffer; // ciphertext bytes (store as the Storage object)
  iv: string; // base64
  tag: string; // base64 auth tag
}

/** Binary variant — used for file uploads stored in Supabase Storage. */
export function encryptBytes(plain: Buffer): ByteCipher {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const data = Buffer.concat([cipher.update(plain), cipher.final()]);
  return { data, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}

export function decryptBytes(data: Buffer, iv: string, tag: string): Buffer {
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

/** Short non-reversible fingerprint for display / integrity hints. */
export function fingerprint(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}
