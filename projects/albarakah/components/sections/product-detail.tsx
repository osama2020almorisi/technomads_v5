"use client";

import Link from "next/link";
import { useState } from "react";
import { m } from "framer-motion";
import { ArrowLeft, Check, Leaf, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Snowflake, Truck } from "lucide-react";
import { getRelated, type Product } from "@/data/products";
import { siteConfig } from "@/data/site";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { Stars } from "@/components/ui/stars";
import { ProductCard } from "./product-card";

export function ProductDetail({ product }: { product: Product }) {
  const { t, l, locale } = useI18n();
  const { add, open } = useCart();
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const total = size.price * qty;

  const handleAdd = () => {
    add(product.slug, size.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setTimeout(open, 400);
  };

  const waMessage = [
    t.whatsappMsg.product,
    `• ${l(product.name)}`,
    `• ${t.whatsappMsg.size}: ${l(size.label)}`,
    `• ${t.whatsappMsg.qty}: ${qty}`,
    `• ${t.cart.orderTotal}: ${formatPrice(total, locale)}`,
  ].join("\n");

  return (
    <>
      <section className="py-10 lg:py-16">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link href="/products" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" aria-hidden />
              {t.product.back}
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* الصورة الكبيرة */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative overflow-hidden rounded-[2rem] shadow-luxe">
                <SmartImage src={product.image} alt={l(product.imageAlt)} fill priority sizes="(min-width: 1024px) 50vw, 100vw" wrapperClassName="aspect-[4/5]" className="object-cover transition-transform [transition-duration:1500ms] hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-black/5" aria-hidden />
                <Badge className="absolute start-5 top-5">{product.badge === "bestseller" ? t.common.bestseller : product.badge === "new" ? t.common.new : t.common.natural}</Badge>
              </div>
            </div>

            {/* المعلومات */}
            <div className="animate-rise-soft">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-honey-700 dark:text-honey-300 rtl:tracking-normal">
                <Leaf className="size-3.5" aria-hidden /> {t.common.natural}
              </p>
              <h1 className="font-display text-4xl font-medium leading-tight sm:text-5xl rtl:font-bold rtl:leading-[1.3]">{l(product.name)}</h1>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <Stars rating={product.rating} />
                <span className="text-muted-foreground">{product.rating.toFixed(1)} · {product.reviews} {t.product.reviews}</span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <m.span key={total} initial={{ opacity: 0.4, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-semibold tabular-nums text-forest dark:text-gold">
                  {formatPrice(total, locale)}
                </m.span>
                {size.compareAt && <span className="text-lg text-muted-foreground line-through tabular-nums">{formatPrice(size.compareAt * qty, locale)}</span>}
              </div>

              <p className="mt-6 text-pretty leading-relaxed text-foreground/80">{l(product.description)}</p>

              {/* خيارات الوزن */}
              <fieldset className="mt-8">
                <legend className="mb-3 text-sm font-semibold">{t.product.weight}</legend>
                <div className="grid grid-cols-3 gap-3">
                  {product.sizes.map((s) => {
                    const active = s.id === sizeId;
                    return (
                      <label
                        key={s.id}
                        className={cn(
                          "relative cursor-pointer rounded-2xl border-2 p-3 text-center transition-all focus-within:ring-2 focus-within:ring-ring",
                          active ? "border-honey bg-honey/10 shadow-glow" : "border-border hover:border-honey/50"
                        )}
                      >
                        <input type="radio" name="size" value={s.id} checked={active} onChange={() => setSizeId(s.id)} className="sr-only" />
                        <span className="block text-sm font-semibold">{l(s.label)}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">{formatPrice(s.price, locale)}</span>
                        {active && <Check className="absolute end-2 top-2 size-3.5 text-honey-700 dark:text-gold" aria-hidden />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* الكمية والأزرار */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-14 items-center justify-between rounded-full border border-border px-2 sm:w-40" role="group" aria-label={t.product.quantity}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t.product.decrease} className="grid size-10 place-items-center rounded-full hover:bg-muted">
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="text-lg font-semibold tabular-nums" aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label={t.product.increase} className="grid size-10 place-items-center rounded-full hover:bg-muted">
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
                <Button onClick={handleAdd} variant="forest" size="lg" className="w-full sm:flex-1">
                  {added ? <Check aria-hidden /> : <ShoppingBag aria-hidden />}
                  {added ? t.products.added : t.products.addToCart}
                </Button>
              </div>
              <Button asChild variant="whatsapp" size="lg" className="mt-3 w-full">
                <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> {t.products.orderWhatsapp}
                </a>
              </Button>

              <ul className="mt-8 grid gap-3 rounded-3xl border border-border bg-card/60 p-5 text-sm sm:grid-cols-2">
                <li className="flex items-center gap-3"><Truck className="size-5 shrink-0 text-honey-600" aria-hidden />{t.product.inStock}</li>
                <li className="flex items-center gap-3"><ShieldCheck className="size-5 shrink-0 text-honey-600" aria-hidden />{t.product.guarantee}</li>
                <li className="flex items-center gap-3"><MapPin className="size-5 shrink-0 text-honey-600" aria-hidden />{t.product.origin}: {l(product.origin)}</li>
                <li className="flex items-center gap-3"><Leaf className="size-5 shrink-0 text-honey-600" aria-hidden />{t.product.freeShip} ${siteConfig.freeShippingThreshold}</li>
              </ul>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="mb-4 font-display text-xl rtl:font-bold">{t.product.benefits}</h2>
                  <ul className="space-y-3">
                    {product.benefits.map((b) => (
                      <li key={b.en} className="flex gap-3 text-sm">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-forest text-gold"><Check className="size-3" aria-hidden /></span>
                        {l(b)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="mb-4 font-display text-xl rtl:font-bold">{t.product.nutrition}</h2>
                  <dl className="divide-y divide-border rounded-2xl border border-border text-sm">
                    {product.nutrition.map((n) => (
                      <div key={n.label.en} className="flex justify-between px-4 py-2.5">
                        <dt className="text-muted-foreground">{l(n.label)}</dt>
                        <dd className="font-semibold tabular-nums" dir="ltr">{n.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className="mt-8 flex gap-3 rounded-2xl bg-honey/10 p-4 text-sm">
                <Snowflake className="size-5 shrink-0 text-honey-700 dark:text-gold" aria-hidden />
                <p><span className="font-semibold">{t.product.storage}: </span>{l(product.storage)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-cream-200/40 py-20 dark:bg-forest-900/30">
        <div className="container">
          <Reveal>
            <h2 className="mb-10 font-display text-3xl font-medium sm:text-4xl rtl:font-bold">{t.product.related}</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getRelated(product.slug).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
