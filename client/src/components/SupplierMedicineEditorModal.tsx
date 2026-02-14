import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { PlusCircle, Save } from "lucide-react";
import type { CreateSupplierMedicineRequest, Medicine, SupplierMedicine, UpdateSupplierMedicineRequest } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  medicineId: z.string().min(1, "Select a medicine"),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  available: z.boolean(),
});

export function SupplierMedicineEditorModal({
  open,
  onOpenChange,
  mode,
  medicines,
  supplierId,
  initial,
  onCreate,
  onUpdate,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  medicines: Medicine[];
  supplierId: string;
  initial?: SupplierMedicine | null;
  onCreate: (payload: CreateSupplierMedicineRequest) => void;
  onUpdate: (id: string, updates: UpdateSupplierMedicineRequest) => void;
  isPending?: boolean;
}) {
  const { toast } = useToast();

  const defaultMedicineId = useMemo(() => medicines[0]?.id || "", [medicines]);

  const [medicineId, setMedicineId] = useState(defaultMedicineId);
  const [price, setPrice] = useState<number>(9.99);
  const [stock, setStock] = useState<number>(50);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setMedicineId(initial.medicineId);
      setPrice(initial.price);
      setStock(initial.stock);
      setAvailable(initial.available);
      return;
    }
    setMedicineId(defaultMedicineId);
    setPrice(9.99);
    setStock(50);
    setAvailable(true);
  }, [open, mode, initial, defaultMedicineId]);

  const submit = () => {
    try {
      const parsed = formSchema.parse({ medicineId, price, stock, available });
      if (mode === "create") {
        onCreate({
          supplierId,
          medicineId: parsed.medicineId,
          price: parsed.price,
          stock: parsed.stock,
          available: parsed.available,
        });
      } else if (initial) {
        onUpdate(initial.id, {
          price: parsed.price,
          stock: parsed.stock,
          available: parsed.available,
        });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Fix the form",
        description: e?.errors?.[0]?.message || e?.message || "Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="rounded-2xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/18 to-accent/12 border border-border/60 grid place-items-center">
              {mode === "create" ? <PlusCircle className="h-5 w-5 text-primary" /> : <Save className="h-5 w-5 text-primary" />}
            </span>
            {mode === "create" ? "Add listing" : "Edit listing"}
          </DialogTitle>
          <DialogDescription>
            Price and stock are visible to pharmacies. You can hide a listing without deleting it.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Medicine</div>
            <Select
              value={medicineId}
              onValueChange={(v) => setMedicineId(v)}
              disabled={mode === "edit"}
            >
              <SelectTrigger className="rounded-xl" data-testid="select-medicine">
                <SelectValue placeholder="Select a medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((m) => (
                  <SelectItem key={m.id} value={m.id} data-testid={`medicine-option-${m.id}`}>
                    {m.name} — {m.dosage} ({m.form})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mode === "edit" ? (
              <div className="text-xs text-muted-foreground">Medicine can’t be changed after creation.</div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Unit price</div>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="rounded-xl"
                data-testid="input-price"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Stock</div>
              <Input
                type="number"
                min={0}
                step="1"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="rounded-xl"
                data-testid="input-stock"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-extrabold tracking-tight">Available to order</div>
              <div className="text-sm text-muted-foreground">Toggle off to temporarily hide this listing.</div>
            </div>
            <Switch checked={available} onCheckedChange={setAvailable} data-testid="switch-available" />
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} data-testid="btn-cancel-listing">
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
            onClick={submit}
            disabled={!!isPending}
            data-testid="btn-save-listing"
          >
            {isPending ? "Saving…" : mode === "create" ? "Add listing" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
