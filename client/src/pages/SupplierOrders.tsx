import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useMe } from "@/hooks/use-auth";
import { useDecideOrder, useOrders } from "@/hooks/use-orders";
import { OrderList } from "@/components/OrderList";
import { useToast } from "@/hooks/use-toast";

export default function SupplierOrders() {
  const { toast } = useToast();
  const { data: me, isLoading } = useMe();
  const decide = useDecideOrder();

  const { data: orders, isLoading: ordersLoading, error } = useOrders(
    me ? { role: me.role, userId: me.userId } : undefined,
  );

  const pendingCount = useMemo(() => (orders || []).filter((o) => o.status === "pending").length, [orders]);

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "supplier") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="Order Queue"
      subtitle={`You have ${pendingCount} pending order${pendingCount === 1 ? "" : "s"}. Approve or reject with an optional decision note.`}
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
        <OrderList
          orders={orders || []}
          role="supplier"
          isDeciding={decide.isPending}
          onApprove={async (orderId, decisionNote) => {
            try {
              await decide.mutateAsync({ orderId, decision: { status: "approved", decisionNote } });
              toast({ title: "Approved", description: "Order approved — pharmacy has been notified." });
            } catch (e: any) {
              toast({ title: "Failed", description: e?.message || "Could not approve order.", variant: "destructive" });
            }
          }}
          onReject={async (orderId, decisionNote) => {
            try {
              await decide.mutateAsync({ orderId, decision: { status: "rejected", decisionNote } });
              toast({ title: "Rejected", description: "Order rejected — pharmacy has been notified." });
            } catch (e: any) {
              toast({ title: "Failed", description: e?.message || "Could not reject order.", variant: "destructive" });
            }
          }}
          testId="supplier-orders-list"
        />
      )}
    </AppShell>
  );
}
