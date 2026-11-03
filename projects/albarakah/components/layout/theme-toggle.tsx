"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.controls.themeLight : t.controls.themeDark}
      className={cn(
        "group grid size-10 place-items-center rounded-full border border-border/70 bg-background/40 transition-all hover:border-honey hover:text-honey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-honey-300",
        className
      )}
    >
      <Sun className={cn("size-[18px] transition-all duration-500 group-hover:rotate-45", isDark ? "scale-0 opacity-0 absolute" : "scale-100")} aria-hidden />
      <Moon className={cn("size-[18px] transition-all duration-500 group-hover:-rotate-12", isDark ? "scale-100" : "scale-0 opacity-0 absolute")} aria-hidden />
    </button>
  );
}
