"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Home, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo";

export function NotFoundContent() {
  const { t } = useI18n();
  return (
    <section className="grain relative flex min-h-[75vh] items-center overflow-hidden bg-forest-950 py-24 text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,160,23,.25),transparent_50%)]" aria-hidden />
      <div className="container relative text-center">
        <div className="relative mx-auto mb-8 flex items-center justify-center font-display text-[9rem] font-medium leading-none sm:text-[13rem]" aria-hidden dir="ltr">
          <span className="text-gradient-gold">4</span>
          <m.span animate={{ rotate: [0, -8, 8, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="mx-2 inline-block">
            <LogoMark className="size-28 sm:size-40" />
          </m.span>
          <span className="text-gradient-gold">4</span>
        </div>
        <h1 className="text-balance font-display text-3xl font-medium sm:text-5xl rtl:font-bold">{t.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-lg text-cream/70">{t.notFound.text}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="gold" size="lg"><Link href="/"><Home aria-hidden /> {t.notFound.home}</Link></Button>
          <Button asChild variant="glass" size="lg"><Link href="/products"><ShoppingBag aria-hidden /> {t.notFound.shop}</Link></Button>
        </div>
      </div>
    </section>
  );
}
