import Link from "next/link";
import { LogOut, Bell, ShieldCheck } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export function Topbar({ profile, unread }: { profile: Profile; unread: number }) {
  const initials = (profile.full_name ?? profile.email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 terminal text-secure">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secure opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secure" />
        </span>
        SECURE SESSION
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications" className="relative">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-1.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-vault text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-sm leading-tight sm:block">
            <p className="font-medium">{profile.full_name ?? "Operator"}</p>
            <p className="flex items-center gap-1 terminal uppercase text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-secure" />
              {profile.role}
            </p>
          </div>
        </div>

        <form action={signOut}>
          <Button variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="h-[18px] w-[18px]" />
          </Button>
        </form>
      </div>
    </header>
  );
}
