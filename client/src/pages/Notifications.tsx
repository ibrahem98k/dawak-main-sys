import { AppShell } from "@/components/AppShell";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useMe } from "@/hooks/use-auth";

export default function NotificationsPage() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me) {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell title="Notifications" subtitle="Status updates, order decisions, and catalog changes — all in one feed.">
      <NotificationsPanel />
    </AppShell>
  );
}
