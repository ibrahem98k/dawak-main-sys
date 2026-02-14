import { AppShell } from "@/components/AppShell";
import { useMe } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { OrderList } from "@/components/OrderList";

export default function PharmacyOrders() {
  const { data: me, isLoading } = useMe();
  const { data: orders, isLoading: ordersLoading, error } = useOrders(
    me ? { role: me.role, userId: me.userId } : undefined,
  );

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "pharmacy") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="My Orders"
      subtitle="Track decisions, view supplier notes, and monitor status across all submitted orders."
    >
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          Failed to load orders: {(error as any)?.message || "Unknown error"}
        </div>
      ) : null}

      {ordersLoading ? (
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
          Loading orders…
        </div>
      ) : (
        <OrderList orders={orders || []} role="pharmacy" testId="pharmacy-orders-list" />
      )}
    </AppShell>
  );
}
