import { MapPinned, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Pharmacy } from "@shared/schema";

export function PharmacyCard({
  pharmacy,
  testId,
}: {
  pharmacy: Omit<Pharmacy, "password">;
  testId?: string;
}) {
  return (
    <Card
      className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-[2px]"
      data-testid={testId}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight truncate">{pharmacy.name}</div>
            <div className="mt-2 text-xs text-muted-foreground flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5">
                <MapPinned className="h-3.5 w-3.5" />
                {pharmacy.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {pharmacy.phone}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/18 to-accent/12 border border-border/60 grid place-items-center shadow-sm">
              <MapPinned className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
