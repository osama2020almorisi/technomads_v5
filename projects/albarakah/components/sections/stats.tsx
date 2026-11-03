"use client";

import { siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/ui/reveal";

export function Stats() {
  const { t, l } = useI18n();
  return (
    <section aria-label={t.stats.title} className="grain relative overflow-hidden bg-forest py-16 text-cream lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(245,197,24,.18),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(212,160,23,.15),transparent_40%)]" aria-hidden />
      <div className="container relative">
        <Reveal>
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold rtl:tracking-normal">{t.stats.title}</p>
        </Reveal>
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {siteConfig.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.1} className="relative flex flex-col-reverse text-center lg:[&:not(:first-child)]:before:absolute lg:[&:not(:first-child)]:before:inset-y-2 lg:[&:not(:first-child)]:before:start-0 lg:[&:not(:first-child)]:before:w-px lg:[&:not(:first-child)]:before:bg-cream/15">
              <dt className="mt-2 text-sm text-cream/70">{l(s.label)}</dt>
              <dd className="font-display text-5xl font-medium text-gradient-gold sm:text-6xl" dir="ltr">
                <Counter value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
