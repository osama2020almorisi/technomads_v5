import { cn } from "@/lib/utils";

/** هيكل تحميل مع لمعة متحركة */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-cream-200/70 dark:bg-forest-800/60",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent dark:before:via-white/10",
        className
      )}
    />
  );
}
