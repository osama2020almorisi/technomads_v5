import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-3.5", i < Math.round(rating) ? "fill-gold text-gold" : "text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}
