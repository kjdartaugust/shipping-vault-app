import { Bell, Info, CheckCircle2, AlertTriangle, ShieldAlert, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markAllRead } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, timeAgo } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/lib/types";

export const metadata = { title: "Notifications — ShipVault" };

const ICON: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  security: ShieldAlert,
};

const TONE: Record<NotificationType, string> = {
  info: "text-primary",
  success: "text-emerald-500",
  warning: "text-amber-500",
  security: "text-vault",
};

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const items = (data ?? []) as AppNotification[];
  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Shipment updates and security alerts."
        action={
          hasUnread ? (
            <form action={markAllRead}>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            </form>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICON[n.type];
            return (
              <Card key={n.id} className={cn(!n.read && "border-primary/40 bg-primary/5")}>
                <CardContent className="flex items-start gap-3 p-4">
                  <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", TONE[n.type])} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
