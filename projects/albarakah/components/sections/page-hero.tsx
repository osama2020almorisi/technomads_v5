"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** ترويسة الصفحات الداخلية مع مسار التنقل (Breadcrumb) */
export function PageHero({ eyebrow, title, subtitle, crumb }: { eyebrow?: string; title: string; subtitle?: string; crumb: string }) {
  const { t } = useI18n();
  return (
    <section className="grain relative overflow-hidden bg-forest-950 py-16 text-cream sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,160,23,.28),transparent_55%),radial-gradient(ellipse_at_bottom_left,#2D6A4F,transparent_60%)]" aria-hidden />
      <div className="container relative">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-cream/60">
            <li><Link href="/" className="hover:text-gold">{t.nav.home}</Link></li>
            <li aria-hidden><ChevronRight className="size-3 rtl:rotate-180" /></li>
            <li aria-current="page" className="text-gold">{crumb}</li>
          </ol>
        </nav>
        <div className="max-w-3xl animate-rise-soft">
          {eyebrow && <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold rtl:tracking-normal">{eyebrow}</p>}
          <h1 className="text-balance font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl rtl:font-bold rtl:leading-[1.3]">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-pretty text-cream/75 sm:text-lg">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
