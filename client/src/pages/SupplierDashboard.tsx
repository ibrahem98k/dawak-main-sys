import { useMemo } from "react";
import { Link } from "wouter";
import { ClipboardList, Pill, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { useMe } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useSupplierMedicinesBySupplier } from "@/hooks/use-supplier-medicines";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";

export default function SupplierDashboard() {
  const { data: me, isLoading } = useMe();

  const supplierId = me?.role === "supplier" ? me.userId : "";
  const { data: smRows } = useSupplierMedicinesBySupplier(supplierId);
  const { data: orders } = useOrders(me ? { role: me.role, userId: me.userId } : undefined);

  const stats = useMemo(() => {
    const listings = smRows?.length || 0;
    const pending = (orders || []).filter((o) => o.status === "pending").length;
    const approved = (orders || []).filter((o) => o.status === "approved").length;
    const revenue = (orders || [])
      .filter((o) => o.status === "approved")
      .reduce((sum, o) => sum + o.items.reduce((s2, it) => s2 + it.quantity * it.unitPrice, 0), 0);

    return { listings, pending, approved, revenue };
  }, [smRows, orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!me || me.role !== "supplier") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="Supplier Overview"
      subtitle="Manage your catalog and keep orders moving — fast approvals, clear inventory, instant updates."
      actions={
        <div className="flex items-center gap-2">
          <Link href="/supplier/medicines" className="inline-flex">
            <Button className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25" data-testid="cta-manage-medicines">
              <Pill className="h-4 w-4 mr-2" />
              Manage medicines
            </Button>
          </Link>
          <Link href="/supplier/orders" className="inline-flex">
            <Button variant="outline" className="rounded-xl" data-testid="cta-view-orders">
              <ClipboardList className="h-4 w-4 mr-2" />
              View orders
            </Button>
          </Link>
          <Link href="/supplier/analytics" className="inline-flex">
            <Button variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 shadow-pill" data-testid="cta-view-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View analytics
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active listings"
          value={String(stats.listings)}
          hint="Total medicine SKUs in your catalog"
          icon={<Pill className="h-5 w-5 text-primary" />}
          gradient="from-primary/20 via-accent/10 to-transparent"
          testId="stat-listings"
        />
        <StatCard
          label="Pending orders"
          value={String(stats.pending)}
          hint="Awaiting your decision"
          icon={<Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-300" />}
          gradient="from-amber-500/18 via-primary/8 to-transparent"
          testId="stat-pending"
        />
        <StatCard
          label="Approved orders"
          value={String(stats.approved)}
          hint="Successful confirmations"
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
          gradient="from-emerald-500/18 via-accent/8 to-transparent"
          testId="stat-approved"
        />
        <StatCard
          label="Approved revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          hint="Based on approved orders (demo)"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          gradient="from-accent/18 via-primary/10 to-transparent"
          testId="stat-revenue"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight">Next actions</div>
            <div className="mt-1 text-sm text-muted-foreground">A quick checklist to keep your operation smooth.</div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                <div className="font-extrabold">Review pending orders</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Approve or reject with a note — pharmacies get notified instantly.
                </div>
                <div className="mt-3">
                  <Link href="/supplier/orders" className="text-primary font-semibold hover:underline" data-testid="link-review-pending">
                    Open order queue →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                <div className="font-extrabold">Tune inventory</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Adjust stock or hide items temporarily when supply is tight.
                </div>
                <div className="mt-3">
                  <Link href="/supplier/medicines" className="text-primary font-semibold hover:underline" data-testid="link-tune-inventory">
                    Manage catalog →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight">Recent orders</div>
            <div className="mt-1 text-sm text-muted-foreground">
              A quick glance at the latest activity.
            </div>

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
                  </div>
                  <StatusPill status={o.status} />
                </div>
              ))}
              {(orders || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No orders yet.</div>
              ) : null}
            </div>

            <div className="mt-4">
              <Link href="/supplier/orders" className="text-muted-foreground hover:text-foreground font-semibold transition-colors" data-testid="link-all-orders">
                View all orders →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
