import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMe } from "@/hooks/use-auth";
import { useMedicines } from "@/hooks/use-medicines";
import {
  useCreateSupplierMedicine,
  useDeleteSupplierMedicine,
  useSupplierMedicinesBySupplier,
  useUpdateSupplierMedicine,
} from "@/hooks/use-supplier-medicines";
import { MedicineTable, type SupplierMedicineRow } from "@/components/MedicineTable";
import { SupplierMedicineEditorModal } from "@/components/SupplierMedicineEditorModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SupplierMedicine } from "@shared/schema";

export default function SupplierMedicines() {
  const { toast } = useToast();
  const { data: me, isLoading } = useMe();

  const supplierId = me?.role === "supplier" ? me.userId : "";
  const { data: medicines } = useMedicines();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const { data: rows, isLoading: loadingRows, error } = useSupplierMedicinesBySupplier(supplierId, {
    search,
    sortBy,
    sortDir,
    onlyAvailable,
  });

  const create = useCreateSupplierMedicine(supplierId);
  const update = useUpdateSupplierMedicine(supplierId);
  const del = useDeleteSupplierMedicine(supplierId);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<SupplierMedicine | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const openCreate = () => {
    setEditorMode("create");
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (r: SupplierMedicineRow) => {
    setEditorMode("edit");
    setEditing({
      id: r.id,
      supplierId: r.supplierId,
      medicineId: r.medicineId,
      price: r.price,
      stock: r.stock,
      available: r.available,
    });
    setEditorOpen(true);
  };

  const onSort = (by: "name" | "price" | "stock") => {
    if (sortBy === by) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(by);
      setSortDir("asc");
    }
  };

  const subtitle = useMemo(
    () =>
      "Add, adjust, and hide listings. Pricing and stock update instantly and are visible to pharmacies.",
    [],
  );

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me || me.role !== "supplier") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="Medicines"
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/supplier/orders" className="inline-flex">
            <Button variant="outline" className="rounded-xl" data-testid="go-orders">
              Orders →
            </Button>
          </Link>
          <Button
            className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
            onClick={openCreate}
            data-testid="btn-add-listing"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add listing
          </Button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          Failed to load catalog: {(error as any)?.message || "Unknown error"}
        </div>
      ) : null}

      <div className="mt-4">
        <MedicineTable
          rows={rows || []}
          allowSelect={false}
          showOnlyAvailableToggle
          onShowOnlyAvailableToggle={setOnlyAvailable}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
          search={search}
          onSearch={setSearch}
          rightActions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  // quick refresh through state changes by toggling
                  setOnlyAvailable((v) => v);
                }}
                data-testid="btn-refresh"
              >
                Refresh
              </Button>
            </div>
          }
          testId="supplier-medicine-table"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-5 shadow-lg shadow-black/5">
          <div className="text-lg font-bold tracking-tight">Edit & delete</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Click an item row below to edit, or delete with confirmation.
          </div>

          <div className="mt-4 space-y-2">
            {(rows || []).slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border/60 bg-card/50 p-4 flex items-center justify-between gap-3 hover:bg-card transition-colors"
              >
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="text-left min-w-0 flex-1"
                  data-testid={`btn-edit-open-${r.id}`}
                >
                  <div className="font-extrabold truncate">
                    {r.medicine.name} <span className="text-muted-foreground font-semibold">• {r.medicine.dosage}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ${r.price.toFixed(2)} • Stock {r.stock} • {r.available ? "Available" : "Hidden"}
                  </div>
                </button>

                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => setConfirmDelete({ open: true, id: r.id })}
                  data-testid={`btn-delete-${r.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            ))}
            {(rows || []).length === 0 && !loadingRows ? (
              <div className="text-sm text-muted-foreground">No listings yet. Add one to get started.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-5 shadow-lg shadow-black/5">
          <div className="text-lg font-bold tracking-tight">Pro tips</div>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <div className="font-extrabold text-foreground">Hide vs delete</div>
              <div className="mt-1">
                Prefer turning availability off when temporary — pharmacies won’t be able to order it.
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <div className="font-extrabold text-foreground">Stock reservations</div>
              <div className="mt-1">
                In this demo, placing an order reduces stock immediately, simulating reservation.
              </div>
            </div>
          </div>
        </div>
      </div>

      <SupplierMedicineEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        medicines={medicines || []}
        supplierId={supplierId}
        initial={editing}
        isPending={create.isPending || update.isPending}
        onCreate={async (payload) => {
          try {
            await create.mutateAsync(payload);
            toast({ title: "Listing added", description: "Your catalog was updated." });
          } catch (e: any) {
            toast({ title: "Failed", description: e?.message || "Could not add listing.", variant: "destructive" });
          }
        }}
        onUpdate={async (id, updates) => {
          try {
            await update.mutateAsync({ id, updates });
            toast({ title: "Listing updated", description: "Changes saved." });
          } catch (e: any) {
            toast({ title: "Failed", description: e?.message || "Could not save changes.", variant: "destructive" });
          }
        }}
      />

      <Dialog open={confirmDelete.open} onOpenChange={(v) => setConfirmDelete((s) => ({ ...s, open: v }))}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete listing</DialogTitle>
            <DialogDescription>
              This removes the listing from your catalog. This can’t be undone in the demo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmDelete({ open: false, id: null })} data-testid="btn-cancel-delete">
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={del.isPending}
              onClick={async () => {
                if (!confirmDelete.id) return;
                try {
                  await del.mutateAsync(confirmDelete.id);
                  toast({ title: "Deleted", description: "Listing removed from catalog." });
                  setConfirmDelete({ open: false, id: null });
                } catch (e: any) {
                  toast({ title: "Failed", description: e?.message || "Could not delete listing.", variant: "destructive" });
                }
              }}
              data-testid="btn-confirm-delete"
            >
              {del.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
