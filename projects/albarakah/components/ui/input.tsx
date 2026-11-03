import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "flex w-full rounded-xl border border-input bg-background/70 px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-honey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 aria-[invalid=true]:border-destructive";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldClass, "h-12", className)} {...props} />
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(fieldClass, "min-h-[140px] resize-y", className)} {...props} />
);
Textarea.displayName = "Textarea";

const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label className={cn("mb-2 block text-sm font-medium", className)} {...props} />
);

export { Input, Textarea, Label };
