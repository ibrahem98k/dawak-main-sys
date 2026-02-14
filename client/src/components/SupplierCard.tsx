import { MapPin, Phone, Pill } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Supplier } from "@shared/schema";

export function SupplierCard({
  supplier,
  medicinesCount,
  onView,
  testId,
}: {
  supplier: Omit<Supplier, "password">;
  medicinesCount?: number;
  onView: () => void;
  testId?: string;
}) {
  return (
    <Card
      className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-[2px] overflow-hidden"
      data-testid={testId}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight truncate">{supplier.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {supplier.locationName}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {supplier.phone}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full border border-border/60 bg-secondary/70">
                <Pill className="h-3.5 w-3.5 mr-1" />
                {typeof medicinesCount === "number" ? `${medicinesCount} listings` : "Catalog"}
              </Badge>
            </div>
          </div>

          <div className="shrink-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/18 to-accent/12 border border-border/60 grid place-items-center shadow-sm">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={onView}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            data-testid="btn-view-supplier"
          >
            View medicines
          </button>

          <Link
            href={`/pharmacy/suppliers/${supplier.id}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-supplier-details"
          >
            Details →
          </Link>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-primary/60 via-accent/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
