"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Leaf, Star, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // تأثير Parallax: الصورة والخلفية تتحركان بسرعات مختلفة
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-12%"]);

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-forest-950 pb-28 pt-14 text-cream sm:pt-20 lg:pb-36 lg:pt-24">
      {/* الخلفية المتدرجة الفاخرة */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#2D6A4F_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#6B4423_0%,transparent_60%)] opacity-80" aria-hidden />
      <m.div style={{ y: glowY }} className="absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-honey/25 blur-[120px]" aria-hidden />
      <m.div style={{ y: glowY }} className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gold/10 blur-[100px]" aria-hidden />
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="hero-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#F5C518" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      <div className="container relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <m.div style={{ y: textY }} className="relative z-10">
          <p
            className="animate-rise mb-7 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-medium text-gold backdrop-blur"
          >
            <Leaf className="size-3.5" aria-hidden /> {t.hero.eyebrow}
          </p>

          <h1 className="font-display text-[2.6rem] font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.6rem] rtl:font-bold rtl:leading-[1.25]">
            <span className="block animate-rise [animation-delay:80ms]">{t.hero.titleA}</span>
            <span className="text-gradient-gold block animate-rise italic [animation-delay:160ms] rtl:not-italic">{t.hero.titleB}</span>
          </h1>

          <p
            className="mt-7 animate-rise-soft max-w-xl text-pretty text-base leading-relaxed text-cream/75 sm:text-lg"
          >
            {t.hero.subtitle}
          </p>

          <div
            className="mt-10 flex animate-rise [animation-delay:300ms] flex-col gap-3 sm:flex-row"
          >
            <Button asChild variant="gold" size="lg">
              <Link href="/products">
                {t.hero.ctaPrimary}
                <ArrowRight className="transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-5 text-[#25D366]" />
                {t.hero.ctaSecondary}
              </a>
            </Button>
          </div>

          <div className="mt-10 flex animate-rise [animation-delay:420ms] items-center gap-4">
            <div className="flex -space-x-3 rtl:space-x-reverse" aria-hidden>
              {["S", "O", "J", "A"].map((c, i) => (
                <span key={c} className="grid size-10 place-items-center rounded-full border-2 border-forest-950 text-sm font-semibold text-forest-950" style={{ background: ["#F5C518", "#D4A017", "#EBC64C", "#B07F0F"][i] }}>
                  {c}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
              <p className="mt-1 text-cream/70">{t.hero.badgeRating}</p>
            </div>
          </div>
        </m.div>

        {/* الصورة مع إطار مقوس وبطاقات عائمة */}
        <div
          className="relative mx-auto animate-zoom-in w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -inset-4 rounded-b-[3rem] rounded-t-[50%_40%] border border-gold/25" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden shadow-luxe" style={{ clipPath: "inset(0 round 50% 50% 2.5rem 2.5rem / 40% 40% 2.5rem 2.5rem)" }}>
            <m.div style={{ y: imgY }} className="absolute inset-[-8%]">
              <Image
                src="/images/hero.jpg"
                alt="Honey, Medjool dates, almonds and raisins arranged on a wooden table"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 90vw"
                className="object-cover"
              />
            </m.div>
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent" aria-hidden />
          </div>

          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease }}
            className="absolute -start-4 top-[18%] sm:-start-10"
          >
            <div className="flex animate-float items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 pe-5 backdrop-blur-xl">
              <span className="grid size-10 place-items-center rounded-xl bg-forest-500 text-cream"><Leaf className="size-5" aria-hidden /></span>
              <span className="text-sm font-semibold">{t.hero.badgeNatural}</span>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.05, duration: 0.7, ease }}
            className="absolute -end-3 bottom-[14%] sm:-end-8"
          >
            <div className="flex animate-float items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 pe-5 backdrop-blur-xl [animation-delay:1.5s]">
              <span className="grid size-10 place-items-center rounded-xl bg-gold text-forest-950"><Truck className="size-5" aria-hidden /></span>
              <span className="text-sm font-semibold">{t.hero.badgeShipping}</span>
            </div>
          </m.div>
        </div>
      </div>

      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cream/50 lg:flex" aria-hidden>
        {t.hero.scroll}
        <span className="relative h-10 w-px overflow-hidden bg-cream/20">
          <m.span className="absolute inset-x-0 top-0 h-4 bg-gold" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </m.div>
    </section>
  );
}
