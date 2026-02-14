import { cn } from "@/lib/utils";
import type { OrderStatus } from "@shared/schema";

export function StatusPill({ status, testId }: { status: OrderStatus; testId?: string }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25",
    approved: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    rejected: "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25",
  };

  const dot: Record<OrderStatus, string> = {
    pending: "bg-amber-500",
    approved: "bg-emerald-500",
    rejected: "bg-rose-500",
  };

  const label = status[0].toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold tracking-tight",
        styles[status],
      )}
      data-testid={testId}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[status])} />
      {label}
    </span>
  );
}
