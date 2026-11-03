"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { t, toggleLocale, locale } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t.controls.languageLabel}
      lang={locale === "en" ? "ar" : "en"}
      className={cn(
        "group inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3.5 text-sm font-semibold transition-all hover:border-honey hover:text-honey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-honey-300",
        locale === "en" ? "font-arabic" : "font-sans",
        className
      )}
    >
      <Languages className="size-4 transition-transform duration-300 group-hover:scale-110" aria-hidden />
      {t.controls.language}
    </button>
  );
}
