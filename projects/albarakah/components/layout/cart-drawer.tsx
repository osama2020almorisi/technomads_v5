"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { getProduct } from "@/data/products";
import { siteConfig } from "@/data/site";
import { priceOf, useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, clear } = useCart();
  const { t, l, locale, dir } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const slide = dir === "rtl" ? "-100%" : "100%";

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const remaining = Math.max(0, siteConfig.freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / siteConfig.freeShippingThreshold) * 100);

  /** بناء رسالة واتساب بكل محتويات السلة */
  const checkoutMessage = () => {
    const lines = items.map((item, i) => {
      const p = getProduct(item.slug)!;
      const s = p.sizes.find((x) => x.id === item.sizeId)!;
      return `${i + 1}. ${l(p.name)} — ${l(s.label)} × ${item.qty} = ${formatPrice(priceOf(item), locale)}`;
    });
    return [t.cart.orderIntro, "", ...lines, "", `${t.cart.orderTotal}: ${formatPrice(subtotal, locale)}`, "", t.cart.orderOutro].join("\n");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label={t.cart.close} className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" onClick={close} />
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            initial={{ x: slide }}
            animate={{ x: 0 }}
            exit={{ x: slide }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-background shadow-luxe"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-2xl rtl:font-arabic rtl:font-bold">
                <ShoppingBag className="size-5 text-honey" aria-hidden /> {t.cart.title}
              </h2>
              <button ref={closeRef} type="button" onClick={close} aria-label={t.cart.close} className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-honey">
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="mb-6 grid size-20 place-items-center rounded-full bg-honey/15">
                  <ShoppingBag className="size-9 text-honey-600" aria-hidden />
                </div>
                <p className="font-display text-2xl rtl:font-arabic rtl:font-bold">{t.cart.empty}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.cart.emptyText}</p>
                <Button asChild variant="forest" className="mt-6" onClick={close}>
                  <Link href="/products">{t.cart.browse}</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* شريط تقدم الشحن المجاني */}
                <div className="border-b border-border bg-honey/5 px-6 py-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-medium">
                    <Truck className="size-4 text-honey-600" aria-hidden />
                    {remaining > 0 ? `${formatPrice(remaining, locale)} ${t.cart.freeShipLeft}` : t.cart.freeShipDone}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                    <m.div className="h-full rounded-full bg-gradient-to-r from-honey to-gold" initial={false} animate={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const p = getProduct(item.slug);
                      const s = p?.sizes.find((x) => x.id === item.sizeId);
                      if (!p || !s) return null;
                      return (
                        <m.li
                          key={`${item.slug}-${item.sizeId}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: dir === "rtl" ? -40 : 40 }}
                          className="flex gap-4 rounded-2xl border border-border/70 bg-card p-3"
                        >
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                            <Image src={p.image} alt={l(p.imageAlt)} fill sizes="80px" className="object-cover" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="truncate font-semibold">{l(p.name)}</p>
                                <p className="text-xs text-muted-foreground">{l(s.label)}</p>
                              </div>
                              <button type="button" onClick={() => remove(item.slug, item.sizeId)} aria-label={`${t.cart.remove} ${l(p.name)}`} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="size-4" aria-hidden />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center rounded-full border border-border">
                                <button type="button" aria-label={t.product.decrease} onClick={() => setQty(item.slug, item.sizeId, item.qty - 1)} className="grid size-8 place-items-center rounded-full hover:bg-muted">
                                  <Minus className="size-3.5" aria-hidden />
                                </button>
                                <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.qty}</span>
                                <button type="button" aria-label={t.product.increase} onClick={() => setQty(item.slug, item.sizeId, item.qty + 1)} className="grid size-8 place-items-center rounded-full hover:bg-muted">
                                  <Plus className="size-3.5" aria-hidden />
                                </button>
                              </div>
                              <span className="font-semibold tabular-nums">{formatPrice(priceOf(item), locale)}</span>
                            </div>
                          </div>
                        </m.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                <div className="space-y-3 border-t border-border px-6 py-5">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>{t.cart.subtotal}</span>
                    <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.cart.shippingNote}</p>
                  <Button asChild variant="whatsapp" size="lg" className="w-full">
                    <a href={whatsappUrl(checkoutMessage())} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-5" /> {t.cart.checkout}
                    </a>
                  </Button>
                  <button type="button" onClick={clear} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">
                    {t.cart.clear}
                  </button>
                </div>
              </>
            )}
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>
  );
}
