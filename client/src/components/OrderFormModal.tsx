import { useMemo, useState } from "react";
import { z } from "zod";
import { ShoppingBag } from "lucide-react";
import type { CreateOrderRequest } from "@shared/schema";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function OrderFormModal({
  open,
  onOpenChange,
  supplierId,
  pharmacyId,
  selected,
  onResetSelected,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  supplierId: string;
  pharmacyId: string;
  selected: Record<string, { quantity: number; maxStock: number; available: boolean; name: string; unitPrice: number }>;
  onResetSelected: () => void;
}) {
  const { toast } = useToast();
  const create = useCreateOrder();
  const [note, setNote] = useState("");

  const items = useMemo(() => {
    return Object.entries(selected)
      .filter(([, v]) => v.quantity > 0)
      .map(([supplierMedicineId, v]) => ({
        supplierMedicineId,
        quantity: v.quantity,
        maxStock: v.maxStock,
        available: v.available,
        name: v.name,
        unitPrice: v.unitPrice,
      }));
  }, [selected]);

  const total = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0), [items]);

  const schema = z.object({
    note: z.string().max(240).optional(),
  });

  const canSubmit = useMemo(() => {
    if (!items.length) return false;
    for (const it of items) {
      if (!it.available) return false;
      if (it.quantity <= 0) return false;
      if (it.quantity > it.maxStock) return false;
    }
    return true;
  }, [items]);

  const submit = async () => {
    try {
      schema.parse({ note });
      const payload: CreateOrderRequest = {
        supplierId,
        pharmacyId,
        items: items.map((i) => ({ supplierMedicineId: i.supplierMedicineId, quantity: i.quantity })),
        note: note.trim() ? note.trim() : undefined,
      };
      await create.mutateAsync(payload);
      toast({
        title: "Order created",
        description: "Your order was submitted and is now pending approval.",
      });
      onResetSelected();
      setNote("");
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Couldn’t create order",
        description: e?.message || "Please check quantities and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/18 to-accent/12 border border-border/60 grid place-items-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </span>
            Review & submit order
          </DialogTitle>
          <DialogDescription>
            Validate quantities against stock. Submitting will reserve stock immediately in the demo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              Items
            </div>
            <div className="divide-y divide-border/50">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">No items selected.</div>
              ) : (
                items.map((it) => {
                  const invalid = !it.available || it.quantity > it.maxStock;
                  return (
                    <div key={it.supplierMedicineId} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{it.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty: <span className={invalid ? "text-destructive font-extrabold" : "font-extrabold"}>{it.quantity}</span>
                          {" • "}
                          Stock: <span className="font-extrabold">{it.maxStock}</span>
                          {" • "}
                          Unit: <span className="font-extrabold">${it.unitPrice.toFixed(2)}</span>
                        </div>
                        {invalid ? (
                          <div className="text-xs text-destructive mt-1">
                            Fix: item must be available and quantity ≤ stock.
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold">${(it.quantity * it.unitPrice).toFixed(2)}</div>
                        <div className="text-[11px] text-muted-foreground">line total</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-4 py-3 flex items-center justify-between bg-muted/30">
              <div className="text-xs text-muted-foreground">Estimated total</div>
              <div className="text-lg font-extrabold" data-testid="order-total">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              Note (optional)
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Delivery instructions, substitutions, urgency…"
              className="mt-2 rounded-2xl min-h-[90px]"
              data-testid="textarea-order-note"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {note.length}/240
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            data-testid="btn-cancel-order"
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
            onClick={submit}
            disabled={!canSubmit || create.isPending}
            data-testid="btn-submit-order"
          >
            {create.isPending ? "Submitting…" : "Submit order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
