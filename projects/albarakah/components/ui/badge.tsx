import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rtl:tracking-normal",
  {
    variants: {
      variant: {
        default: "bg-honey text-forest-950",
        forest: "bg-forest text-cream",
        outline: "border border-honey/40 bg-honey/10 text-honey-700 dark:text-honey-300",
        glass: "border border-white/30 bg-white/15 text-cream backdrop-blur-md",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
