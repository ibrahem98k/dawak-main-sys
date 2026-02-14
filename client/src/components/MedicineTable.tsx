import { useMemo, useState } from "react";
import { ArrowDownUp, Check, Search, X } from "lucide-react";
import type { Medicine } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SupplierMedicineRow = {
  id: string;
  supplierId: string;
  medicineId: string;
  price: number;
  stock: number;
  available: boolean;
  medicine: Medicine;
  supplier: { id: string; name: string; locationName: string; lat: number; lng: number; email: string; phone: string };
};

export function MedicineTable({
  rows,
  allowSelect,
  selected,
  onToggleSelect,
  showOnlyAvailableToggle,
  onShowOnlyAvailableToggle,
  onSort,
  sortBy,
  sortDir,
  search,
  onSearch,
  rightActions,
  testId,
}: {
  rows: SupplierMedicineRow[];
  allowSelect?: boolean;
  selected?: Record<string, number>; // supplierMedicineId -> quantity
  onToggleSelect?: (rowId: string, nextQty: number) => void;
  showOnlyAvailableToggle?: boolean;
  onShowOnlyAvailableToggle?: (next: boolean) => void;
  onSort?: (nextBy: "name" | "price" | "stock") => void;
  sortBy?: "name" | "price" | "stock";
  sortDir?: "asc" | "desc";
  search?: string;
  onSearch?: (v: string) => void;
  rightActions?: React.ReactNode;
  testId?: string;
}) {
  const [localSearch, setLocalSearch] = useState(search || "");
  const effectiveSearch = search ?? localSearch;

  const filtered = useMemo(() => {
    const q = (effectiveSearch || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.medicine.name} ${r.medicine.dosage} ${r.medicine.form}`.toLowerCase().includes(q),
    );
  }, [rows, effectiveSearch]);

  const headerCell =
    "px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground";

  const cell = "px-3 py-3 text-sm";

  const sortLabel = (by: "name" | "price" | "stock") =>
    sortBy === by ? `${by} (${sortDir || "asc"})` : by;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5" data-testid={testId}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={effectiveSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalSearch(v);
                  onSearch?.(v);
                }}
                placeholder="Search medicine name, form, dosage…"
                className="pl-9 rounded-xl bg-background/60 border-border/70 focus-visible:ring-4 focus-visible:ring-ring/15"
                data-testid="input-medicine-search"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {showOnlyAvailableToggle ? (
              <label className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                <Switch
                  onCheckedChange={(v) => onShowOnlyAvailableToggle?.(v)}
                  data-testid="toggle-only-available"
                />
                Only available
              </label>
            ) : null}

            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                className={cn("rounded-xl", sortBy === "name" ? "border-primary/40" : "")}
                onClick={() => onSort?.("name")}
                data-testid="btn-sort-name"
              >
                <ArrowDownUp className="h-4 w-4 mr-2" />
                {sortLabel("name")}
              </Button>
              <Button
                variant="outline"
                className={cn("rounded-xl", sortBy === "price" ? "border-primary/40" : "")}
                onClick={() => onSort?.("price")}
                data-testid="btn-sort-price"
              >
                <ArrowDownUp className="h-4 w-4 mr-2" />
                {sortLabel("price")}
              </Button>
              <Button
                variant="outline"
                className={cn("rounded-xl", sortBy === "stock" ? "border-primary/40" : "")}
                onClick={() => onSort?.("stock")}
                data-testid="btn-sort-stock"
              >
                <ArrowDownUp className="h-4 w-4 mr-2" />
                {sortLabel("stock")}
              </Button>
            </div>

            {rightActions ? <div className="ml-0 md:ml-2">{rightActions}</div> : null}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[860px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/40">
                {allowSelect ? <th className={headerCell}>Pick</th> : null}
                <th className={headerCell}>Medicine</th>
                <th className={headerCell}>Form</th>
                <th className={headerCell}>Dosage</th>
                <th className={headerCell}>Price</th>
                <th className={headerCell}>Stock</th>
                <th className={headerCell}>Availability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={allowSelect ? 7 : 6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    No medicines match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const qty = selected?.[r.id] || 0;
                  const canSelect = r.available && r.stock > 0;
                  return (
                    <tr key={r.id} className="border-b last:border-b-0 border-border/50 hover:bg-muted/30 transition-colors">
                      {allowSelect ? (
                        <td className={cell}>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={qty > 0 ? "default" : "outline"}
                              className={cn("rounded-xl", qty > 0 ? "bg-primary text-primary-foreground" : "")}
                              disabled={!canSelect}
                              onClick={() => onToggleSelect?.(r.id, qty > 0 ? 0 : 1)}
                              data-testid={`btn-select-${r.id}`}
                            >
                              {qty > 0 ? <Check className="h-4 w-4 mr-2" /> : null}
                              {qty > 0 ? "Selected" : "Select"}
                            </Button>
                            {qty > 0 ? (
                              <div className="inline-flex items-center gap-1.5">
                                <Input
                                  type="number"
                                  min={1}
                                  max={r.stock}
                                  value={qty}
                                  onChange={(e) => onToggleSelect?.(r.id, Math.max(1, Math.min(r.stock, Number(e.target.value))))}
                                  className="w-24 rounded-xl"
                                  data-testid={`input-qty-${r.id}`}
                                />
                                <button
                                  className="h-9 w-9 rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-all duration-200 grid place-items-center"
                                  onClick={() => onToggleSelect?.(r.id, 0)}
                                  data-testid={`btn-clear-${r.id}`}
                                  type="button"
                                >
                                  <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      ) : null}

                      <td className={cn(cell, "font-semibold")}>{r.medicine.name}</td>
                      <td className={cell}>{r.medicine.form}</td>
                      <td className={cell}>{r.medicine.dosage}</td>
                      <td className={cell}>
                        <span className="font-extrabold">${r.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground"> / unit</span>
                      </td>
                      <td className={cell}>
                        <span className={cn("font-extrabold", r.stock === 0 ? "text-destructive" : "text-foreground")}>
                          {r.stock}
                        </span>
                      </td>
                      <td className={cell}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold",
                            r.available
                              ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                              : "border-zinc-500/25 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
                          )}
                          data-testid={`availability-${r.id}`}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", r.available ? "bg-emerald-500" : "bg-zinc-400")} />
                          {r.available ? "Available" : "Hidden"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div data-testid="medicines-count">{filtered.length} items</div>
          <div className="sm:hidden">Sorting controls available on desktop</div>
        </div>
      </div>
    </Card>
  );
}
