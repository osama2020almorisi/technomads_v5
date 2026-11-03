"use client";

import { AnimatePresence, m } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export function CartButton() {
  const { count, open } = useCart();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`${t.controls.cart} (${count})`}
      className="group relative grid size-10 place-items-center rounded-full border border-border/70 bg-background/40 transition-all hover:border-honey hover:text-honey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-honey-300"
    >
      <ShoppingBag className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
      <AnimatePresence>
        {count > 0 && (
          <m.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-honey px-1 text-[10px] font-bold leading-5 text-forest-950"
          >
            {count}
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}
