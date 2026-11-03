"use client";

import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Faq() {
  const { t } = useI18n();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section className="py-24 lg:py-32" aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} align="start" className="mb-8" />
          <Reveal className="rounded-3xl bg-forest p-7 text-cream">
            <MessageCircle className="mb-4 size-8 text-gold" aria-hidden />
            <p className="text-lg font-semibold">{t.shipping.helpTitle}</p>
            <p className="mt-1 text-sm text-cream/70">{t.shipping.helpText}</p>
            <Button asChild variant="gold" className="mt-5">
              <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer">{t.cta.whatsapp}</a>
            </Button>
          </Reveal>
        </div>
        <Reveal>
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
            {t.faq.items.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
