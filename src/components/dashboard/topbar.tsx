import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center gap-2">
        {unread > 0 && (
          <Badge className="bg-primary/15 text-primary">{unread} new</Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-vault text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium leading-tight">{profile.full_name ?? "User"}</p>
            <p className="text-xs capitalize text-muted-foreground">{profile.role}</p>
          </div>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
