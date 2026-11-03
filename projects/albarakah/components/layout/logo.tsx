"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** علامة الشعار — بذرة (تمرة/لوزة) ذهبية مع ورقة خضراء */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="abn-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5C518" />
          <stop offset="1" stopColor="#B07F0F" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#1B4332" />
      <path d="M32 14c10 6 12.5 22 0 36C19.5 36 22 20 32 14z" fill="url(#abn-g)" />
      <path d="M32 21c-2.6 7-2.6 15 0 23" fill="none" stroke="#1B4332" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32 14c1.5-4.5 6-7 11-6.5-1.5 4.6-5.8 7.2-11 6.5z" fill="#74B08E" />
    </svg>
  );
}

export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  const { locale, t } = useI18n();
  const [first, ...rest] = siteConfig.name.split(" ");
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <LogoMark className="size-10 shrink-0 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105" />
      <span className="sr-only">{t.nav.home}: </span>
      <span className="flex flex-col leading-none">
        {locale === "ar" ? (
          <>
            <span className={cn("font-arabic text-xl font-bold", invert ? "text-cream" : "text-forest dark:text-cream")}>البركة</span>
            <span className={cn("mt-1 font-arabic text-[11px] font-semibold", invert ? "text-gold" : "text-honey-700 dark:text-honey-300")}>للمنتجات الطبيعية</span>
          </>
        ) : (
          <>
            <span className={cn("font-display text-xl font-semibold tracking-tight", invert ? "text-cream" : "text-forest dark:text-cream")}>{first}</span>
            <span className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.42em]", invert ? "text-gold" : "text-honey-700 dark:text-honey-300")}>{rest.join(" ")}</span>
          </>
        )}
      </span>
    </Link>
  );
}
