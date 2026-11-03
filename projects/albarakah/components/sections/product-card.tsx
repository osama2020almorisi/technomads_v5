"use client";

import Link from "next/link";
import { useState } from "react";
import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import { getMinPrice, type Product } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Stars } from "@/components/ui/stars";
import { WhatsAppIcon } from "@/components/ui/icons";

/** كرت المنتج مع تأثير 3D عند تمرير الماوس */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, l, locale } = useI18n();
  const { add, open } = useCart();
  const [added, setAdded] = useState(false);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const size = product.sizes[0];
  const handleAdd = () => {
    add(product.slug, size.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setTimeout(open, 350);
  };

  const badgeText = product.badge === "bestseller" ? t.common.bestseller : product.badge === "new" ? t.common.new : t.common.natural;
  const waMessage = `${t.whatsappMsg.product}\n• ${l(product.name)} — ${l(size.label)} (${formatPrice(size.price, locale)})`;

  return (
    <m.article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 shadow-soft backdrop-blur-sm transition-shadow duration-500 hover:shadow-luxe"
    >
      <Link href={`/products/${product.slug}`} className="relative block focus-visible:outline-none" aria-label={`${t.products.details}: ${l(product.name)}`}>
        <SmartImage
          src={product.image}
          alt={l(product.imageAlt)}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 92vw"
          wrapperClassName="aspect-[4/5]"
          className="object-cover group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" aria-hidden />
        <m.div
          aria-hidden
          style={{ left: glareX }}
          className="pointer-events-none absolute -top-1/2 h-[200%] w-1/3 -translate-x-1/2 rotate-12 bg-white/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        />
        <Badge variant={product.badge === "bestseller" ? "default" : "glass"} className="absolute start-4 top-4">
          {badgeText}
        </Badge>
        <span className="absolute end-4 top-4 grid size-10 translate-y-2 place-items-center rounded-full bg-cream text-forest opacity-0 shadow-soft transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-cream">
          <Stars rating={product.rating} className="[&_svg]:size-3" />
          <span className="text-xs opacity-80">
            {product.rating.toFixed(1)} · {product.reviews} {t.product.reviews}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-medium leading-snug rtl:font-bold">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-honey-700 dark:hover:text-gold">
            {l(product.name)}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l(product.short)}</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">{t.products.from}</span>
          <span className="text-2xl font-semibold tabular-nums text-forest dark:text-gold">{formatPrice(getMinPrice(product), locale)}</span>
          <span className="text-xs text-muted-foreground">/ {l(size.label)}</span>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
          <Button onClick={handleAdd} variant="forest" className={cn("w-full", added && "bg-forest-500")} aria-live="polite">
            {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4 transition-transform group-hover/btn:-rotate-12" aria-hidden />}
            {added ? t.products.added : t.products.addToCart}
          </Button>
          <Button asChild variant="whatsapp" size="icon" className="size-11">
            <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer" aria-label={`${t.products.orderWhatsapp}: ${l(product.name)}`}>
              <WhatsAppIcon className="size-5" />
            </a>
          </Button>
        </div>
      </div>
    </m.article>
  );
}
