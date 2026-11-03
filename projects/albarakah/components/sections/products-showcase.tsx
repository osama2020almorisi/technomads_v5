"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "./product-card";

export function ProductsShowcase() {
  const { t } = useI18n();
  return (
    <section id="products" className="relative py-24 lg:py-32" aria-labelledby="products-title">
      <div className="container">
        <SectionHeading eyebrow={t.products.eyebrow} title={t.products.title} subtitle={t.products.subtitle} />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} className="h-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">
              {t.products.viewAll}
              <ArrowRight className="transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
