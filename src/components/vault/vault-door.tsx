"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

/**
 * Cinematic full-screen vault-door reveal on entry. Plays once per browser
 * session (sessionStorage gate) so it delights without nagging.
 */
export function VaultDoor() {
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("gone");

  useEffect(() => {
    if (sessionStorage.getItem("vaultex_door") === "1") return;
    sessionStorage.setItem("vaultex_door", "1");
    setPhase("closed");
    const t1 = setTimeout(() => setPhase("opening"), 550);
    const t2 = setTimeout(() => setPhase("gone"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;
  const opening = phase === "opening";

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {/* Left door */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 border-r border-vault/20 bg-background hex-bg transition-transform duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: opening ? "translateX(-105%)" : "translateX(0)" }}
      >
        <div className="absolute right-0 top-1/2 h-40 w-1.5 -translate-y-1/2 bg-gradient-to-b from-transparent via-vault/40 to-transparent" />
      </div>
      {/* Right door */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 border-l border-vault/20 bg-background hex-bg transition-transform duration-[1400ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: opening ? "translateX(105%)" : "translateX(0)" }}
      >
        <div className="absolute left-0 top-1/2 h-40 w-1.5 -translate-y-1/2 bg-gradient-to-b from-transparent via-vault/40 to-transparent" />
      </div>
      {/* Central lock dial */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{ opacity: opening ? 0 : 1 }}
      >
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-vault/40">
          <div className="absolute inset-0 animate-spin-slow rounded-full ring-conic opacity-30 blur-md" />
          <div className="absolute inset-2 rounded-full border border-vault/30" />
          <Lock className="h-9 w-9 text-vault" />
        </div>
        <p className="mt-4 text-center terminal uppercase tracking-[0.3em] text-vault/80">
          Decrypting
        </p>
      </div>
    </div>
  );
}
