"use client";

import { m } from "framer-motion";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Stars } from "@/components/ui/stars";

export function Testimonials() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-cream-200/50 py-24 dark:bg-forest-900/40 lg:py-32" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHeading eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {t.testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08} className="h-full">
              <m.figure
                whileHover={{ y: -8, rotate: i % 2 ? 0.6 : -0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative flex h-full flex-col rounded-3xl border border-border/70 bg-card p-7 shadow-soft"
              >
                <Quote className="mb-5 size-9 fill-honey/20 text-honey rtl:-scale-x-100" aria-hidden />
                <Stars rating={5} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">“{item.text}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold to-honey-600 font-semibold text-forest-950" aria-hidden>
                    {item.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.location} · {item.product}
                    </span>
                  </span>
                </figcaption>
              </m.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
