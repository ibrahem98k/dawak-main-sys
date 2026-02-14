import { Link } from "wouter";
import { ArrowRight, Boxes, ClipboardList, MapPinned, Pill } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMe } from "@/hooks/use-auth";

export default function Home() {
  const { data: me } = useMe();

  return (
    <div className="min-h-screen bg-mesh">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center shadow-lg shadow-primary/20">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                PharmSync
              </div>
              <div className="text-xs text-muted-foreground">Supplier ↔ Pharmacy ordering</div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Card className="glass rounded-3xl overflow-hidden mt-10">
          <div className="p-7 sm:p-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl leading-tight">
                The cleanest way to{" "}
                <span className="text-primary">order medicines</span> between partners.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                A premium B2B dashboard experience — seeded demo data, role-based navigation, maps, CRUD, and order approvals.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={me ? (me.role === "supplier" ? "/supplier" : "/pharmacy") : "/login"} className="inline-flex">
                  <Button
                    className="rounded-xl py-6 px-6 bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
                    data-testid="btn-get-started"
                  >
                    {me ? "Go to dashboard" : "Get started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/register" className="inline-flex">
                  <Button variant="outline" className="rounded-xl py-6" data-testid="btn-create-account">
                    Create account
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 font-extrabold tracking-tight">
                    <Pill className="h-5 w-5 text-primary" />
                    Catalog CRUD
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Add, edit, delete, and hide supplier listings with instant persistence.
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 font-extrabold tracking-tight">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Order workflow
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Pending → approved/rejected, with decision notes and notifications.
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 font-extrabold tracking-tight">
                    <MapPinned className="h-5 w-5 text-primary" />
                    Maps (no key)
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Supplier locations embedded via lightweight Google Maps iframe.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Tip: sign in with demo credentials on the login page for instant access.
        </div>
      </div>
    </div>
  );
}
