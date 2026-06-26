"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroTracker() {
  const [value, setValue] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) router.push(`/track?n=${encodeURIComponent(value.trim())}`);
      }}
      className="glass mx-auto flex w-full max-w-xl items-center gap-2 rounded-xl p-2 glow-primary"
    >
      <div className="flex flex-1 items-center gap-2 pl-3">
        <Radar className="h-5 w-5 shrink-0 text-primary" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter tracking ID — e.g. VX1A2B3C4D5E"
          className="h-11 w-full bg-transparent font-mono text-sm tracking-wide outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        <Search className="h-4 w-4" /> Track
      </Button>
    </form>
  );
}
