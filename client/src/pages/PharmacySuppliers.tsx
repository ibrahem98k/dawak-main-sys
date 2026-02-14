import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search, Truck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SupplierCard } from "@/components/SupplierCard";
import { Input } from "@/components/ui/input";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/hooks/use-auth";

export default function PharmacySuppliers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: me, isLoading } = useMe();

  const [search, setSearch] = useState("");
  const { data: suppliers, isLoading: loadingSuppliers, error } = useSuppliers(search);

  const title = "Browse suppliers";
  const subtitle = "Search by name or location. Open a supplier to see medicines, filters, and maps.";

  const list = useMemo(() => suppliers || [], [suppliers]);

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "pharmacy") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-4 sm:p-5 shadow-lg shadow-black/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers by name, location, email…"
                className="pl-9 rounded-xl"
                data-testid="input-supplier-search"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            <span data-testid="suppliers-count">
              {list.length} supplier{list.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          Failed to load suppliers: {(error as any)?.message || "Unknown error"}
        </div>
      ) : null}

      {loadingSuppliers ? (
        <div className="mt-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
          Loading suppliers…
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s as any}
              medicinesCount={undefined}
              onView={() => {
                toast({ title: "Opening supplier", description: s.name });
                setLocation(`/pharmacy/suppliers/${s.id}`);
              }}
              testId={`supplier-card-${s.id}`}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
