"use client";

import { Clock, DollarSign, MapPinned, RotateCcw } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "./page-hero";

const icons = [MapPinned, Clock, DollarSign, RotateCcw];

export function ShippingContent() {
  const { t } = useI18n();
  return (
    <>
      <PageHero eyebrow={t.shipping.eyebrow} title={t.shipping.title} subtitle={t.shipping.subtitle} crumb={t.nav.shipping} />
      <section className="py-16 lg:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {t.shipping.sections.map((s, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Reveal key={s.title} delay={i * 0.05} className="rounded-[2rem] border border-border bg-card p-7 shadow-soft sm:p-9">
                  <h2 className="mb-5 flex items-center gap-4 font-display text-2xl rtl:font-bold">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-honey/15 text-honey-700 dark:text-gold"><Icon className="size-5" aria-hidden /></span>
                    {s.title}
                  </h2>
                  <ul className="space-y-3">
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-3 leading-relaxed text-foreground/80">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-honey" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal className="grain relative overflow-hidden rounded-[2rem] bg-forest-950 p-7 text-cream">
              <div className="absolute -end-10 -top-10 size-40 rounded-full bg-gold/25 blur-3xl" aria-hidden />
              <p className="relative font-display text-5xl text-gradient-gold">${siteConfig.freeShippingThreshold}+</p>
              <p className="relative mt-2 text-sm text-cream/75">{t.shipping.sections[2].points[0]}</p>
              <hr className="relative my-6 border-cream/10" />
              <p className="relative font-semibold">{t.shipping.helpTitle}</p>
              <p className="relative mt-1 text-sm text-cream/70">{t.shipping.helpText}</p>
              <Button asChild variant="whatsapp" className="relative mt-5 w-full">
                <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-4" /> {t.cta.whatsapp}</a>
              </Button>
              {siteConfig.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} dir="ltr" className="relative mt-3 block text-center text-sm text-cream/80 hover:text-gold">{p.display}</a>
              ))}
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
