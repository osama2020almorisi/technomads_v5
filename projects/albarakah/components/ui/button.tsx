import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// زر shadcn/ui مع متغيرات خاصة بهوية المتجر
const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-glow",
        gold: "bg-gradient-to-br from-gold via-honey to-honey-600 text-forest-950 shadow-glow hover:-translate-y-0.5 hover:brightness-105",
        forest: "bg-forest text-cream hover:-translate-y-0.5 hover:bg-forest-500 dark:bg-forest-500 dark:hover:bg-forest-300 dark:hover:text-forest-950",
        whatsapp: "bg-[#25D366] text-[#06331a] hover:-translate-y-0.5 hover:bg-[#2ee072] shadow-[0_10px_30px_-10px_rgba(37,211,102,.7)]",
        outline: "border border-border bg-transparent hover:border-honey hover:text-honey-700 dark:hover:text-honey-300",
        glass: "border border-white/25 bg-white/10 text-cream backdrop-blur-md hover:bg-white/20",
        ghost: "hover:bg-muted",
        link: "rounded-none px-0 text-honey-700 underline-offset-4 hover:underline dark:text-honey-300",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
