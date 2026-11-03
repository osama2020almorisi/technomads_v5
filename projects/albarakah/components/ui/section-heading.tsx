import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
  invert?: boolean;
}) {
  return (
    <Reveal className={cn("mb-12 max-w-2xl md:mb-16", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("mb-4 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] rtl:tracking-normal", invert ? "text-gold" : "text-honey-700 dark:text-honey-300")}>
          <span className="h-px w-8 bg-current opacity-60" aria-hidden />
          {eyebrow}
          {align === "center" && <span className="h-px w-8 bg-current opacity-60" aria-hidden />}
        </p>
      )}
      <h2 className={cn("text-balance font-display text-3xl font-medium leading-[1.1] tracking-tight sm:text-4xl md:text-5xl rtl:font-bold rtl:leading-[1.3]", invert && "text-cream")}>
        {title}
      </h2>
      {subtitle && <p className={cn("mt-5 text-pretty text-base leading-relaxed md:text-lg", invert ? "text-cream/75" : "text-muted-foreground")}>{subtitle}</p>}
    </Reveal>
  );
}
