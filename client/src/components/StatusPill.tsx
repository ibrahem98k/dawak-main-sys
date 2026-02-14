import { cn } from "@/lib/utils";
import type { OrderStatus } from "@shared/schema";

export function StatusPill({ status, testId }: { status: OrderStatus; testId?: string }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse-soft",
    approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    rejected: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const dot: Record<OrderStatus, string> = {
    pending: "bg-amber-500",
    approved: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    rejected: "bg-destructive",
  };

  const label = status[0].toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider",
        styles[status],
      )}
      data-testid={testId}
    >
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        {status === "pending" && (
          <span className="absolute h-full w-full animate-ping rounded-full bg-amber-500 opacity-75"></span>
        )}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", dot[status])}></span>
      </span>
      {label}
    </span>
  );
}
