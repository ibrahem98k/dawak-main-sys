import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ratingsCreate } from "@/lib/localStoreApi";
import { useQueryClient } from "@tanstack/react-query";

interface RatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId: string;
    pharmacyId: string;
    supplierName: string;
}

export function RatingDialog({
    open,
    onOpenChange,
    supplierId,
    pharmacyId,
    supplierName
}: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating before submitting.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await ratingsCreate({
                supplierId,
                pharmacyId,
                rating,
                comment: comment.trim() || undefined
            });

            toast({
                title: "Review submitted",
                description: `Thank you for reviewing ${supplierName}.`
            });

            // Invalidate performance query (we'll implement the hook later)
            queryClient.invalidateQueries({ queryKey: ["supplier-performance", supplierId] });

            onOpenChange(false);
            setRating(0);
            setComment("");
        } catch (err) {
            toast({
                title: "Submission failed",
                description: "Something went wrong while saving your review.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Rate {supplierName}</DialogTitle>
                    <DialogDescription>
                        Share your experience with this supplier. Your feedback helps other pharmacies and improves service quality.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-transform active:scale-90 hover:scale-110"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-10 w-10 transition-colors",
                                        (hoveredRating || rating) >= star
                                            ? "fill-amber-500 text-amber-500"
                                            : "text-muted-foreground/30"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-sm font-bold ml-1">Comments (optional)</label>
                        <Textarea
                            placeholder="What was your experience with delivery, product quality, or communication?"
                            className="resize-none rounded-xl bg-muted/50 focus:bg-background h-24"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="rounded-xl bg-primary shadow-lg shadow-primary/20"
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
