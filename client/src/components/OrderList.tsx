import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Filter, XCircle } from "lucide-react";
import type { Order, OrderStatus } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function OrderList({
  orders,
  role,
  onApprove,
  onReject,
  isDeciding,
  testId,
}: {
  orders: Order[];
  role: "supplier" | "pharmacy";
  onApprove?: (orderId: string, decisionNote?: string) => void;
  onReject?: (orderId: string, decisionNote?: string) => void;
  isDeciding?: boolean;
  testId?: string;
}) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    orderId: string | null;
    mode: "approve" | "reject";
  }>({ open: false, orderId: null, mode: "approve" });
  const [decisionNote, setDecisionNote] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const openDecision = (orderId: string, mode: "approve" | "reject") => {
    setDecisionNote("");
    setDecisionModal({ open: true, orderId, mode });
  };

  const confirmDecision = () => {
    if (!decisionModal.orderId) return;
    if (decisionModal.mode === "approve") onApprove?.(decisionModal.orderId, decisionNote.trim() || undefined);
    if (decisionModal.mode === "reject") onReject?.(decisionModal.orderId, decisionNote.trim() || undefined);
    setDecisionModal({ open: false, orderId: null, mode: "approve" });
  };

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5" data-testid={testId}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-lg font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Orders
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {role === "supplier"
                ? "Review incoming orders and decide in a single click."
                : "Track your submitted orders in real time (demo)."}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              className={cn("rounded-xl", filter === "all" ? "bg-primary text-primary-foreground" : "")}
              onClick={() => setFilter("all")}
              data-testid="filter-all"
            >
              <Filter className="h-4 w-4 mr-2" />
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              className={cn("rounded-xl", filter === "pending" ? "bg-amber-600 text-white hover:bg-amber-600/90" : "")}
              onClick={() => setFilter("pending")}
              data-testid="filter-pending"
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              className={cn("rounded-xl", filter === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600/90" : "")}
              onClick={() => setFilter("approved")}
              data-testid="filter-approved"
            >
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              className={cn("rounded-xl", filter === "rejected" ? "bg-rose-600 text-white hover:bg-rose-600/90" : "")}
              onClick={() => setFilter("rejected")}
              data-testid="filter-rejected"
            >
              Rejected
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Created</th>
                <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Items</th>
                <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Note</th>
                <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Decision</th>
                {role === "supplier" ? (
                  <th className="px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground text-right">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={role === "supplier" ? 6 : 5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  return (
                    <tr key={o.id} className="border-b last:border-b-0 border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">
                        <StatusPill status={o.status} testId={`pill-${o.id}`} />
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold" data-testid={`order-created-${o.id}`}>
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        <span className="font-extrabold text-foreground">{o.items.length}</span> lines
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-[360px]">
                        <div className="line-clamp-2">{o.note || <span className="text-muted-foreground/60">—</span>}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground max-w-[360px]">
                        <div className="line-clamp-2">
                          {o.decisionNote || <span className="text-muted-foreground/60">—</span>}
                        </div>
                      </td>
                      {role === "supplier" ? (
                        <td className="px-3 py-3 text-right">
                          {o.status === "pending" ? (
                            <div className="inline-flex items-center gap-2">
                              <Button
                                size="sm"
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90 text-white"
                                onClick={() => openDecision(o.id, "approve")}
                                disabled={!!isDeciding}
                                data-testid={`btn-approve-${o.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={() => openDecision(o.id, "reject")}
                                disabled={!!isDeciding}
                                data-testid={`btn-reject-${o.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">No actions</div>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Showing <span className="font-extrabold text-foreground">{filtered.length}</span> orders
        </div>
      </div>

      <Dialog open={decisionModal.open} onOpenChange={(v) => setDecisionModal((s) => ({ ...s, open: v }))}>
        <DialogContent className="rounded-2xl sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {decisionModal.mode === "approve" ? "Approve order" : "Reject order"}
            </DialogTitle>
            <DialogDescription>
              Add an optional note to communicate to the pharmacy.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder={decisionModal.mode === "approve" ? "e.g. Ready for dispatch tomorrow morning." : "e.g. Out of stock — please revise quantities."}
              className="rounded-2xl min-h-[120px]"
              data-testid="textarea-decision-note"
            />
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDecisionModal({ open: false, orderId: null, mode: "approve" })}
              data-testid="btn-cancel-decision"
            >
              Cancel
            </Button>
            <Button
              className={cn(
                "rounded-xl",
                decisionModal.mode === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-600/90 text-white"
                  : "bg-rose-600 hover:bg-rose-600/90 text-white",
              )}
              onClick={confirmDecision}
              disabled={!!isDeciding}
              data-testid="btn-confirm-decision"
            >
              {decisionModal.mode === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
