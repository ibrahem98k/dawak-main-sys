import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon,
  gradient = "from-primary/18 via-accent/10 to-transparent",
  testId,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  gradient?: string;
  testId?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur",
        "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/8 transition-all duration-300 hover:-translate-y-[2px]",
      )}
      data-testid={testId}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
            {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
          </div>
          {icon ? (
            <div className="h-10 w-10 rounded-2xl bg-card/70 border border-border/60 grid place-items-center shadow-sm">
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
