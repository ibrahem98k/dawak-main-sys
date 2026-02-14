import { useMemo } from "react";
import { Link } from "wouter";
import { ClipboardList, MapPinned, Search, Truck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-auth";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useOrders } from "@/hooks/use-orders";
import { StatusPill } from "@/components/StatusPill";

export default function PharmacyDashboard() {
  const { data: me, isLoading } = useMe();
  const { data: suppliers } = useSuppliers();
  const { data: orders } = useOrders(me ? { role: me.role, userId: me.userId } : undefined);

  const stats = useMemo(() => {
    const supplierCount = suppliers?.length || 0;
    const pending = (orders || []).filter((o) => o.status === "pending").length;
    const approved = (orders || []).filter((o) => o.status === "approved").length;
    const total = (orders || []).reduce((sum, o) => sum + o.items.reduce((s2, it) => s2 + it.quantity * it.unitPrice, 0), 0);
    return { supplierCount, pending, approved, total };
  }, [suppliers, orders]);

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "pharmacy") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="Pharmacy Overview"
      subtitle="Browse suppliers, compare prices, and submit orders with stock-aware validation."
      actions={
        <div className="flex items-center gap-2">
          <Link href="/pharmacy/suppliers" className="inline-flex">
            <Button className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25" data-testid="cta-browse-suppliers">
              <Truck className="h-4 w-4 mr-2" />
              Browse suppliers
            </Button>
          </Link>
          <Link href="/pharmacy/orders" className="inline-flex">
            <Button variant="outline" className="rounded-xl" data-testid="cta-view-orders">
              <ClipboardList className="h-4 w-4 mr-2" />
              My orders
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Suppliers"
          value={String(stats.supplierCount)}
          hint="Available partners in your region"
          icon={<MapPinned className="h-5 w-5 text-primary" />}
          gradient="from-primary/20 via-accent/10 to-transparent"
          testId="stat-suppliers"
        />
        <StatCard
          label="Pending orders"
          value={String(stats.pending)}
          hint="Awaiting supplier decision"
          icon={<Search className="h-5 w-5 text-amber-600 dark:text-amber-300" />}
          gradient="from-amber-500/18 via-primary/8 to-transparent"
          testId="stat-pending"
        />
        <StatCard
          label="Approved orders"
          value={String(stats.approved)}
          hint="Confirmed for fulfillment"
          icon={<ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
          gradient="from-emerald-500/18 via-accent/8 to-transparent"
          testId="stat-approved"
        />
        <StatCard
          label="Order value"
          value={`$${stats.total.toFixed(2)}`}
          hint="All-time demo spend"
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          gradient="from-accent/18 via-primary/10 to-transparent"
          testId="stat-total"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight">Nearby suppliers</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Pick a partner and start building an order.
            </div>

            <div className="mt-5 space-y-2">
              {(suppliers || []).slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  href={`/pharmacy/suppliers/${s.id}`}
                  className="block rounded-2xl border border-border/60 bg-card/50 p-4 hover:bg-card transition-colors"
                  data-testid={`supplier-quick-${s.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold tracking-tight truncate">{s.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.locationName}</div>
                    </div>
                    <div className="text-primary font-semibold">Open →</div>
                  </div>
                </Link>
              ))}
              {(suppliers || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No suppliers found.</div>
              ) : null}
            </div>

            <div className="mt-4">
              <Link href="/pharmacy/suppliers" className="text-muted-foreground hover:text-foreground font-semibold transition-colors" data-testid="link-all-suppliers">
                View all suppliers →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight">Recent orders</div>
            <div className="mt-1 text-sm text-muted-foreground">Track decisions and notes from suppliers.</div>

            <div className="mt-5 space-y-2">
              {(orders || []).slice(0, 5).map((o) => (
                <div key={o.id} className="rounded-2xl border border-border/60 bg-card/50 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-extrabold tracking-tight truncate" data-testid={`recent-order-${o.id}`}>
                      Order {o.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()} • {o.items.length} items
                    </div>
                    {o.decisionNote ? (
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-1">“{o.decisionNote}”</div>
                    ) : null}
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))}
              {(orders || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No orders yet. Browse suppliers to start.</div>
              ) : null}
            </div>

            <div className="mt-4">
              <Link href="/pharmacy/orders" className="text-muted-foreground hover:text-foreground font-semibold transition-colors" data-testid="link-orders">
                View all orders →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
