"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { Ban, HandHeart, HeartHandshake, MapPinned, PackageCheck, Sprout } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const icons = [Sprout, Ban, PackageCheck, MapPinned, HeartHandshake, HandHeart];

export function WhyUs() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden py-24 lg:py-32" aria-labelledby="why-title">
      <div className="absolute -start-40 top-20 h-96 w-96 rounded-full bg-honey/10 blur-3xl" aria-hidden />
      <div className="container relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} align="start" className="mb-8 md:mb-10" />
          <Reveal className="relative hidden aspect-[4/3] overflow-hidden rounded-[2rem] shadow-luxe lg:block">
            <Image src="/images/about.jpg" alt="Date palm orchard at golden hour with crates of harvested dates and almonds" fill sizes="40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-forest-950/50 to-transparent" aria-hidden />
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {t.why.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={item.title} delay={(i % 2) * 0.1} className="h-full">
                <m.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group glass relative h-full overflow-hidden rounded-3xl p-7 shadow-soft"
                >
                  <span className="absolute end-5 top-3 font-display text-6xl font-semibold text-honey/10 transition-colors group-hover:text-honey/20" aria-hidden>
                    0{i + 1}
                  </span>
                  <span className="relative mb-5 grid size-14 place-items-center rounded-2xl bg-forest text-gold transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-honey group-hover:text-forest-950 dark:bg-forest-500">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="relative text-lg font-semibold">{item.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </m.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
