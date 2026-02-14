import { SupplierPerformance } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Clock,
    XOctagon,
    Star,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierPerformanceCardProps {
    performance: SupplierPerformance;
    className?: string;
}

export function SupplierPerformanceCard({ performance, className }: SupplierPerformanceCardProps) {
    const getStatusColor = (status: SupplierPerformance["status"]) => {
        switch (status) {
            case "Excellent": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "Good": return "text-primary bg-primary/10 border-primary/20";
            case "Average": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "Poor": return "text-destructive bg-destructive/10 border-destructive/20";
            default: return "";
        }
    };

    const scoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-500";
        if (score >= 75) return "text-primary";
        if (score >= 50) return "text-amber-500";
        return "text-destructive";
    };

    return (
        <Card className={cn("overflow-hidden glass animate-in-soft", className)}>
            <div className="p-5 border-b border-border/60 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-bold tracking-tight">Supplier Reliability</h3>
                </div>
                <Badge variant="outline" className={cn("rounded-full border px-3", getStatusColor(performance.status))}>
                    {performance.status}
                </Badge>
            </div>

            <div className="p-6 space-y-6">
                {/* Main Score Area */}
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className={cn("text-5xl font-black tracking-tighter", scoreColor(performance.score))}>
                        {performance.score}%
                    </div>
                    <div className="text-xs uppercase tracking-widest font-extrabold text-muted-foreground/60">
                        Performance Score
                    </div>
                    <div className="w-full mt-2">
                        <Progress value={performance.score} className="h-2.5" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-card border border-border/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Fulfillment
                        </div>
                        <div className="text-xl font-black">{performance.fulfillmentRate}%</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-card border border-border/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            On-Time
                        </div>
                        <div className="text-xl font-black">{performance.onTimeRate}%</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-card border border-border/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                            <XOctagon className="h-3.5 w-3.5 text-destructive" />
                            Cancellation
                        </div>
                        <div className="text-xl font-black">{performance.cancellationRate}%</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-card border border-border/40 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            Rating
                        </div>
                        <div className="text-xl font-black flex items-center gap-1.5">
                            <span>{performance.averageRating.toFixed(1)}</span>
                            <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span className="text-xs text-muted-foreground font-medium">
                                    ({performance.totalRatings})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-accent/5 border border-accent/10 p-4 flex gap-3">
                    <TrendingUp className="h-5 w-5 text-accent shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This score is calculated based on historical order fulfillment and verified pharmacy feedback.
                    </p>
                </div>
            </div>
        </Card>
    );
}
