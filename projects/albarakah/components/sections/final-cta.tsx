"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="pb-24 lg:pb-32" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="grain relative overflow-hidden rounded-[2.5rem] bg-forest-950 px-6 py-16 text-center text-cream shadow-luxe sm:px-12 lg:py-24">
          <Image src="/images/honey.jpg" alt="" fill sizes="100vw" className="object-cover opacity-50" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-forest-950/95 via-forest-950/75 to-cocoa-dark/70" aria-hidden />
          <div className="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gold/25 blur-[100px]" aria-hidden />
          <div className="relative mx-auto max-w-3xl">
            <h2 id="cta-title" className="text-balance font-display text-4xl font-medium leading-[1.08] sm:text-5xl lg:text-6xl rtl:font-bold rtl:leading-[1.3]">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-cream/75 sm:text-lg">{t.cta.subtitle}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="whatsapp" size="lg" className="animate-soft-pulse">
                <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> {t.cta.whatsapp}
                </a>
              </Button>
              {siteConfig.phones.map((p) => (
                <Button key={p.tel} asChild variant="glass" size="lg">
                  <a href={`tel:${p.tel}`} aria-label={`${t.cta.call} ${p.display}`}>
                    <Phone className="transition-transform group-hover/btn:rotate-12" aria-hidden /> <span dir="ltr">{p.display}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
