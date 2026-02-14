import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, cubicBezier: [0.2, 0.9, 0.2, 1] }}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-3xl border-none glass-card shadow-premium-md",
        )}
        data-testid={testId}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-gradient">{value}</div>
              {hint ? <div className="mt-1 text-xs text-muted-foreground/70 font-medium">{hint}</div> : null}
            </div>
            {icon ? (
              <div className="h-12 w-12 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/5 grid place-items-center shadow-premium-sm text-primary">
                {icon}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
