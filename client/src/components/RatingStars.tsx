import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
    rating: number;
    max?: number;
    className?: string;
    size?: number;
}

export function RatingStars({ rating, max = 5, className, size = 16 }: RatingStarsProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: max }).map((_, i) => {
                const value = i + 1;
                const isFull = rating >= value;
                const isHalf = !isFull && rating >= value - 0.5;

                return (
                    <div key={i} className="relative">
                        <Star
                            size={size}
                            className={cn(
                                "text-muted-foreground/20",
                                isFull ? "fill-amber-500 text-amber-500" : ""
                            )}
                        />
                        {isHalf && (
                            <div className="absolute inset-0 overflow-hidden w-1/2 text-amber-500 fill-amber-500">
                                <StarHalf size={size} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
