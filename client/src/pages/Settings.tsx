import { useState } from "react";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResetDemoData } from "@/hooks/use-state";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: me, isLoading } = useMe();
  const reset = useResetDemoData();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen bg-mesh grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!me) {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Reset the demo dataset, clear current session, and start fresh."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5 lg:col-span-2">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Reset demo data
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              This will reseed suppliers, pharmacies, medicines, orders, and notifications and log you out.
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button
                className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
                onClick={() => setConfirmOpen(true)}
                data-testid="btn-open-reset"
              >
                Reset & reseed
              </Button>
              <div className="text-xs text-muted-foreground">
                Current role: <span className="font-extrabold text-foreground">{me.role}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5">
          <div className="p-5">
            <div className="text-lg font-bold tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              About this demo
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              No real authentication. All data is stored in LocalStorage for simulation and persists across reloads.
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reset demo dataset?</DialogTitle>
            <DialogDescription>
              This clears LocalStorage state and reseeds sample data. You will be logged out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmOpen(false)} data-testid="btn-cancel-reset">
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={reset.isPending}
              onClick={async () => {
                try {
                  await reset.mutateAsync();
                  toast({ title: "Reset complete", description: "Demo data reseeded. Redirecting to login…" });
                  setConfirmOpen(false);
                  window.location.href = "/login";
                } catch (e: any) {
                  toast({ title: "Failed", description: e?.message || "Could not reset demo.", variant: "destructive" });
                }
              }}
              data-testid="btn-confirm-reset"
            >
              {reset.isPending ? "Resetting…" : "Reset now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
