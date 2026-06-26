"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ unlockAt, compact = false }: { unlockAt: string; compact?: boolean }) {
  const target = new Date(unlockAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.done) return <span className="text-secure">Released</span>;

  const cells = [
    { v: t.days, l: "DAYS" },
    { v: t.hours, l: "HRS" },
    { v: t.minutes, l: "MIN" },
    { v: t.seconds, l: "SEC" },
  ];

  if (compact) {
    return (
      <span className="terminal text-vault">
        {String(t.days).padStart(2, "0")}d {String(t.hours).padStart(2, "0")}h{" "}
        {String(t.minutes).padStart(2, "0")}m
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex min-w-[60px] flex-col items-center rounded-lg border border-vault/30 bg-vault/5 py-2"
        >
          <span className="font-display text-2xl font-bold tabular-nums text-vault">
            {String(c.v).padStart(2, "0")}
          </span>
          <span className="terminal text-muted-foreground">{c.l}</span>
        </div>
      ))}
    </div>
  );
}
