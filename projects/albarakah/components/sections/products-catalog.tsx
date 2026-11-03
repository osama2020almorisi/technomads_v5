"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categories, getMinPrice, products, type ProductCategory } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/input";
import { ProductCard } from "./product-card";
import { PageHero } from "./page-hero";

type Sort = "featured" | "low" | "high";

export function ProductsCatalog() {
  const { t, l } = useI18n();
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const inCat = category === "all" || p.category === category;
      const text = `${p.name.en} ${p.name.ar} ${p.short.en} ${p.short.ar}`.toLowerCase();
      return inCat && (!q || text.includes(q));
    });
    if (sort === "low") return [...filtered].sort((a, b) => getMinPrice(a) - getMinPrice(b));
    if (sort === "high") return [...filtered].sort((a, b) => getMinPrice(b) - getMinPrice(a));
    return filtered;
  }, [category, query, sort]);

  const reset = () => {
    setCategory("all");
    setQuery("");
    setSort("featured");
  };

  return (
    <>
      <PageHero eyebrow={t.products.eyebrow} title={t.products.pageTitle} subtitle={t.products.pageSubtitle} crumb={t.nav.products} />

      <section className="py-14 lg:py-20">
        <div className="container">
          {/* شريط الفلاتر */}
          <div className="glass sticky top-[4.5rem] z-20 mb-10 flex flex-col gap-4 rounded-3xl p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
            <div role="tablist" aria-label={t.products.eyebrow} className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
              {categories.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "text-forest-950" : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    {active && <m.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold to-honey" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    {l(c.label)}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-64">
                <span className="sr-only">{t.products.searchLabel}</span>
                <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.products.searchPlaceholder} className={cn(fieldClass, "h-11 ps-11")} />
              </label>
              <label className="relative block">
                <span className="sr-only">{t.products.sortLabel}</span>
                <SlidersHorizontal className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={cn(fieldClass, "h-11 appearance-none ps-11 pe-8 sm:w-56")}>
                  <option value="featured">{t.products.sortFeatured}</option>
                  <option value="low">{t.products.sortLow}</option>
                  <option value="high">{t.products.sortHigh}</option>
                </select>
              </label>
            </div>
          </div>

          <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
            {list.length} {t.products.results}
          </p>

          {list.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border py-20 text-center">
              <Search className="mb-4 size-10 text-honey" aria-hidden />
              <p className="text-lg font-semibold">{t.products.empty}</p>
              <Button onClick={reset} variant="outline" className="mt-5">
                <X aria-hidden /> {t.products.reset}
              </Button>
            </div>
          ) : (
            <m.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((p, i) => (
                  <m.div key={p.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }} className="h-full">
                    <ProductCard product={p} priority={i < 2} />
                  </m.div>
                ))}
              </AnimatePresence>
            </m.div>
          )}
        </div>
      </section>
    </>
  );
}
