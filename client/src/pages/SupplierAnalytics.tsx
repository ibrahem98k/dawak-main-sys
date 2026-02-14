import { useMemo } from "react";
import { useMe } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useSupplierMedicinesBySupplier } from "@/hooks/use-supplier-medicines";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  AlertCircle, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

export default function SupplierAnalytics() {
  const { data: me, isLoading: userLoading } = useMe();
  const supplierId = me?.role === "supplier" ? me.userId : "";
  
  const { data: orders, isLoading: ordersLoading } = useOrders(
    me ? { role: me.role, userId: me.userId } : undefined
  );
  const { data: medicines, isLoading: medsLoading } = useSupplierMedicinesBySupplier(supplierId);

  const stats = useMemo(() => {
    if (!orders) return null;
    
    const approvedOrders = orders.filter(o => o.status === "approved");
    const totalRevenue = approvedOrders.reduce((sum, o) => 
      sum + o.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), 0
    );
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      approvedOrders: approvedOrders.length
    };
  }, [orders]);

  const chartsData = useMemo(() => {
    if (!orders || !medicines) return null;

    // Monthly stats
    const monthMap: Record<string, { month: string, orders: number, revenue: number }> = {};
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return format(d, "MMM yyyy");
    }).reverse();

    last6Months.forEach(m => {
      monthMap[m] = { month: m, orders: 0, revenue: 0 };
    });

    orders.forEach(o => {
      const m = format(new Date(o.createdAt), "MMM yyyy");
      if (monthMap[m]) {
        monthMap[m].orders += 1;
        if (o.status === "approved") {
          monthMap[m].revenue += o.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
        }
      }
    });

    const monthlyStats = Object.values(monthMap);

    // Most ordered medicines
    const medSales: Record<string, { id: string, name: string, quantity: number }> = {};
    orders.filter(o => o.status === "approved").forEach(o => {
      o.items.forEach(it => {
        const med = medicines.find(m => m.id === it.supplierMedicineId);
        if (med) {
          const name = med.medicine.name;
          if (!medSales[name]) medSales[name] = { id: med.id, name, quantity: 0 };
          medSales[name].quantity += it.quantity;
        }
      });
    });

    const topMedicines = Object.values(medSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Top Pharmacies
    const pharmacySales: Record<string, { id: string, name: string, total: number }> = {};
    // Note: We don't have pharmacy names in orders directly, but in a real app we would.
    // In this mock environment, we might need to fetch pharmacies or use IDs.
    // For now, let's use the ID as a proxy or "Pharmacy [ID]"
    orders.filter(o => o.status === "approved").forEach(o => {
      if (!pharmacySales[o.pharmacyId]) pharmacySales[o.pharmacyId] = { id: o.pharmacyId, name: `Pharmacy ${o.pharmacyId.slice(-4)}`, total: 0 };
      pharmacySales[o.pharmacyId].total += o.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    });

    const topPharmacies = Object.values(pharmacySales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { monthlyStats, topMedicines, topPharmacies };
  }, [orders, medicines]);

  const lowStock = useMemo(() => {
    return (medicines || []).filter(m => m.stock < 20).slice(0, 5);
  }, [medicines]);

  const suggestions = useMemo(() => {
    if (!chartsData || !stats || !medicines) return [];
    const list = [];

    // Recommendation 1: High demand
    if (chartsData.topMedicines.length > 0) {
      const best = chartsData.topMedicines[0];
      const med = medicines.find(m => m.medicine.name === best.name);
      if (med && med.stock < 100) {
        list.push({
          type: "high-demand",
          title: `Increase stock for ${best.name}`,
          description: `This is your best seller with ${best.quantity} units sold. Current stock is only ${med.stock}.`,
          icon: <ArrowUpRight className="text-emerald-500" />
        });
      }
    }

    // Recommendation 2: Low selling / Promotion
    const lowSelling = (medicines || []).filter(m => !chartsData.topMedicines.find(tm => tm.name === m.medicine.name)).slice(0, 1);
    if (lowSelling.length > 0) {
      list.push({
        type: "promotion",
        title: `Promote ${lowSelling[0].medicine.name}`,
        description: "This item has had low sales recently. Consider a temporary price adjustment.",
        icon: <Sparkles className="text-amber-500" />
      });
    }

    // Recommendation 3: Best month
    const bestMonth = [...(chartsData.monthlyStats || [])].sort((a,b) => b.revenue - a.revenue)[0];
    if (bestMonth && bestMonth.revenue > 0) {
      list.push({
        type: "info",
        title: `Peak Performance: ${bestMonth.month}`,
        description: `You reached a record revenue of $${bestMonth.revenue.toFixed(2)} during this period.`,
        icon: <TrendingUp className="text-primary" />
      });
    }

    return list;
  }, [chartsData, stats, medicines]);

  if (userLoading || ordersLoading || medsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;
  }

  if (!me || me.role !== "supplier") {
    return null;
  }

  return (
    <AppShell
      title="Supplier Analytics"
      subtitle="Deep dive into your performance, inventory trends, and customer insights."
    >
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Orders"
          value={String(stats?.totalOrders || 0)}
          hint="All time orders received"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toFixed(2)}`}
          hint="From approved orders"
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          label="Pending Items"
          value={String(stats?.pendingOrders || 0)}
          hint="Orders awaiting approval"
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          label="Unique Customers"
          value={String(chartsData?.topPharmacies.length || 0)}
          hint="Active pharmacy clients"
          icon={<Users className="h-5 w-5 text-indigo-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 glass">
            <h3 className="text-lg font-bold mb-4">Monthly Revenue & Orders</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData?.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                  <Bar yAxisId="right" dataKey="orders" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Orders Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 glass">
            <h3 className="text-lg font-bold mb-4">Most Ordered Medicines</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartsData?.topMedicines}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="quantity" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Smart Suggestions */}
          <Card className="p-5 glass border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Smart Insights</h3>
            </div>
            <div className="space-y-4">
              {suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="mt-1">{s.icon}</div>
                  <div>
                    <div className="text-sm font-bold">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="text-sm text-muted-foreground">More data needed for insights.</div>
              )}
            </div>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="p-5 glass">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-bold">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStock.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div className="text-sm font-medium">{m.medicine.name}</div>
                  <div className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    {m.stock} left
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="text-sm text-muted-foreground">All stocks healthy.</div>
              )}
            </div>
          </Card>

          {/* Top Customers */}
          <Card className="p-5 glass">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold">Top Pharmacies</h3>
            </div>
            <div className="space-y-3">
              {chartsData?.topPharmacies.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-sm font-bold">${p.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
