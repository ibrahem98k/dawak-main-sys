import { useMemo } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-auth";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function NotificationsPanel({ compact }: { compact?: boolean }) {
  const { data: me } = useMe();
  const { toast } = useToast();
  const { data, isLoading, error } = useNotifications(me ? { role: me.role, userId: me.userId } : undefined);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const list = data || [];
  const unread = useMemo(() => list.filter((n) => !n.read).length, [list]);

  const onMarkAll = async () => {
    if (!me) return;
    try {
      await markAll.mutateAsync({ role: me.role, userId: me.userId });
      toast({ title: "All caught up", description: "Marked all notifications as read." });
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || "Could not update notifications.", variant: "destructive" });
    }
  };

  return (
    <Card className={cn("rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5", compact ? "shadow-none bg-card/40" : "")}>
      <div className={cn("p-4 sm:p-5", compact ? "p-4" : "")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {unread > 0 ? (
                <>
                  <span className="font-extrabold text-foreground">{unread}</span> unread updates
                </>
              ) : (
                "You’re up to date."
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onMarkAll}
            disabled={!me || unread === 0 || markAll.isPending}
            data-testid="btn-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            {markAll.isPending ? "Updating…" : "Mark all"}
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : error ? (
            <div className="text-sm text-destructive">Failed to load notifications.</div>
          ) : list.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            list.slice(0, compact ? 4 : 18).map((n) => (
              <button
                key={n.id}
                className={cn(
                  "w-full text-left rounded-2xl border px-4 py-3 transition-all duration-200",
                  "hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/5",
                  n.read ? "border-border/50 bg-card/50" : "border-primary/25 bg-gradient-to-r from-primary/10 to-accent/8",
                )}
                onClick={async () => {
                  if (n.read) return;
                  await markRead.mutateAsync(n.id);
                  toast({ title: "Marked as read", description: n.title });
                }}
                data-testid={`notification-${n.id}`}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold tracking-tight">{n.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.message}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={cn("inline-flex items-center gap-2 text-xs font-extrabold",
                      n.read ? "text-muted-foreground" : "text-primary"
                    )}>
                      <span className={cn("h-2 w-2 rounded-full", n.read ? "bg-muted-foreground/40" : "bg-primary")} />
                      {n.read ? "Read" : "New"}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {list.length > (compact ? 4 : 18) ? (
          <div className="mt-3 text-xs text-muted-foreground">
            Showing {compact ? 4 : 18} of {list.length}.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
