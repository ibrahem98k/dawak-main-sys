import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { MapPin, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMe } from "@/hooks/use-auth";
import { useSuppliers, useSupplierPerformance } from "@/hooks/use-suppliers";
import { useSupplierMedicinesBySupplier } from "@/hooks/use-supplier-medicines";
import { MedicineTable } from "@/components/MedicineTable";
import { OrderFormModal } from "@/components/OrderFormModal";
import { SupplierPerformanceCard } from "@/components/SupplierPerformanceCard";
import { RatingDialog } from "@/components/RatingDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export default function SupplierDetails() {
  const params = useParams() as { id?: string };
  const supplierId = params.id || "";
  const { toast } = useToast();

  const { data: me, isLoading } = useMe();
  const { data: suppliers } = useSuppliers();
  const supplier = useMemo(() => (suppliers || []).find((s) => s.id === supplierId) || null, [suppliers, supplierId]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const { data: rows, isLoading: loadingRows, error } = useSupplierMedicinesBySupplier(supplierId, {
    search,
    sortBy,
    sortDir,
    onlyAvailable,
  });

  const { data: performance } = useSupplierPerformance(supplierId);

  const [selected, setSelected] = useState<Record<string, { quantity: number; maxStock: number; available: boolean; name: string; unitPrice: number }>>({});
  const [orderOpen, setOrderOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const onSort = (by: "name" | "price" | "stock") => {
    if (sortBy === by) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(by);
      setSortDir("asc");
    }
  };

  const pharmacyId = me?.role === "pharmacy" ? me.userId : "";

  const selectedCount = useMemo(
    () => Object.values(selected).filter((v) => v.quantity > 0).length,
    [selected],
  );

  const canOpenOrder = selectedCount > 0 && !!pharmacyId;

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "pharmacy") {
    window.location.href = "/login";
    return null;
  }

  if (!supplier) {
    return (
      <AppShell title="Supplier not found" subtitle="This supplier ID doesn’t exist in the demo dataset.">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
          <Link href="/pharmacy/suppliers" className="text-primary font-semibold hover:underline" data-testid="link-back-suppliers">
            ← Back to suppliers
          </Link>
        </div>
      </AppShell>
    );
  }

  const mapsSrc = `https://www.google.com/maps?q=${supplier.lat},${supplier.lng}&z=12&output=embed`;

  return (
    <AppShell
      title={supplier.name}
      subtitle={`Browse catalog and build an order. Location: ${supplier.locationName}.`}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/pharmacy/suppliers" className="inline-flex">
            <Button variant="outline" className="rounded-xl" data-testid="btn-back-suppliers">
              ← Suppliers
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
            onClick={() => setRatingOpen(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Rate supplier
          </Button>
          <Button
            className={cn(
              "rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25",
              !canOpenOrder ? "opacity-60" : "",
            )}
            onClick={() => {
              if (!canOpenOrder) {
                toast({ title: "Select items", description: "Choose at least one medicine to create an order." });
                return;
              }
              setOrderOpen(true);
            }}
            disabled={!canOpenOrder}
            data-testid="btn-open-order"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Create order ({selectedCount})
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4">
        <div>
          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              Failed to load supplier medicines: {(error as any)?.message || "Unknown error"}
            </div>
          ) : null}

          {loadingRows ? (
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
              Loading medicines…
            </div>
          ) : (
            <MedicineTable
              rows={rows || []}
              allowSelect
              selected={Object.fromEntries(Object.entries(selected).map(([k, v]) => [k, v.quantity]))}
              onToggleSelect={(rowId, nextQty) => {
                const row = (rows || []).find((r) => r.id === rowId);
                if (!row) return;
                setSelected((prev) => {
                  const next = { ...prev };
                  if (nextQty <= 0) {
                    delete next[rowId];
                    return next;
                  }
                  next[rowId] = {
                    quantity: nextQty,
                    maxStock: row.stock,
                    available: row.available,
                    name: `${row.medicine.name} ${row.medicine.dosage} (${row.medicine.form})`,
                    unitPrice: row.price,
                  };
                  return next;
                });
              }}
              showOnlyAvailableToggle
              onShowOnlyAvailableToggle={setOnlyAvailable}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              search={search}
              onSearch={setSearch}
              testId="supplier-details-medicine-table"
            />
          )}
        </div>

        <div className="space-y-4">
          {performance && (
            <SupplierPerformanceCard performance={performance} />
          )}

          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5 overflow-hidden">
            <div className="p-5">
              <div className="text-lg font-bold tracking-tight flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{supplier.locationName}</div>
            </div>
            <div className="h-[320px] lg:h-[420px] border-t border-border/60">
              <iframe
                title="Supplier map"
                src={mapsSrc}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-testid="supplier-map"
              />
            </div>
            <div className="p-5 text-sm text-muted-foreground">
              Embedded Google Map (no API key). Coordinates:{" "}
              <span className="font-extrabold text-foreground">
                {supplier.lat}, {supplier.lng}
              </span>
            </div>
          </div>
        </div>
      </div>

      <OrderFormModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        supplierId={supplierId}
        pharmacyId={pharmacyId}
        selected={selected}
        onResetSelected={() => setSelected({})}
      />

      <RatingDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        supplierId={supplierId}
        pharmacyId={pharmacyId}
        supplierName={supplier?.name || ""}
      />
    </AppShell>
  );
}
