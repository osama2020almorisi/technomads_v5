"use client";

import Image from "next/image";
import { Gem, HandHeart, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "./page-hero";
import { Stats } from "./stats";
import { FinalCta } from "./final-cta";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const valueIcons = [Gem, Scale, HandHeart];

export function AboutContent() {
  const { t } = useI18n();
  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} subtitle={t.about.intro} crumb={t.nav.about} />

      <section className="py-20 lg:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-luxe">
              <Image src="/images/about.jpg" alt="Date palm orchard at golden hour with crates of fresh harvest" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 end-6 hidden w-44 overflow-hidden rounded-3xl border-4 border-background shadow-luxe sm:block">
              <div className="relative aspect-square">
                <Image src="/images/honey.jpg" alt="Raw honey jar" fill sizes="180px" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl font-medium leading-tight sm:text-4xl rtl:font-bold rtl:leading-[1.35]">{t.about.storyTitle}</h2>
            {t.about.story.map((p) => (
              <p key={p.slice(0, 20)} className="mt-5 text-pretty leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </Reveal>
        </div>
      </section>

      <Stats />

      <section className="py-20 lg:py-28">
        <div className="container">
          <SectionHeading title={t.about.valuesTitle} />
          <div className="grid gap-6 md:grid-cols-3">
            {t.about.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <Reveal key={v.title} delay={i * 0.1} className="group glass rounded-3xl p-8 text-center shadow-soft">
                  <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-gradient-to-br from-gold to-honey-600 text-forest-950 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon className="size-7" aria-hidden />
                  </span>
                  <h3 className="font-display text-2xl rtl:font-bold">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
