"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";
import { products } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "@/components/ui/icons";
import { whatsappUrl } from "@/lib/whatsapp";
import { Logo } from "./logo";

const socialIcons = { instagram: InstagramIcon, facebook: FacebookIcon, tiktok: TikTokIcon, youtube: YouTubeIcon } as const;

export function Footer() {
  const { t, l } = useI18n();
  const year = new Date().getFullYear();
  const socials = (Object.entries(siteConfig.social) as [keyof typeof socialIcons, string][]).filter(([, url]) => url);

  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-honey/10 blur-3xl" aria-hidden />
      <div className="container relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo invert />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/65">{t.footer.about}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold rtl:tracking-normal">{t.footer.social}</p>
          <ul className="mt-3 flex gap-2">
            {socials.map(([key, url]) => {
              const Icon = socialIcons[key];
              return (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="grid size-10 place-items-center rounded-full border border-cream/15 transition-all hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-forest-950">
                    <Icon className="size-4" />
                  </a>
                </li>
              );
            })}
            <li>
              <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full border border-cream/15 transition-all hover:-translate-y-1 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white">
                <WhatsAppIcon className="size-4" />
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label={t.footer.shop} className="lg:col-span-2">
          <h3 className="mb-5 text-sm font-semibold text-gold">{t.footer.shop}</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="transition-colors hover:text-gold">{l(p.name)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.footer.company} className="lg:col-span-2">
          <h3 className="mb-5 text-sm font-semibold text-gold">{t.footer.company}</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            {navLinks.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-gold">{t.nav[n.key]}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h3 className="mb-5 text-sm font-semibold text-gold">{t.footer.contact}</h3>
          <ul className="space-y-4 text-sm text-cream/75">
            {siteConfig.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="group flex items-center gap-3 transition-colors hover:text-gold">
                  <span className="grid size-9 place-items-center rounded-full bg-cream/5 transition-colors group-hover:bg-gold/15"><Phone className="size-4" aria-hidden /></span>
                  <span dir="ltr">{p.display}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${siteConfig.email}`} className="group flex items-center gap-3 transition-colors hover:text-gold">
                <span className="grid size-9 place-items-center rounded-full bg-cream/5 transition-colors group-hover:bg-gold/15"><Mail className="size-4" aria-hidden /></span>
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-cream/5"><Clock className="size-4" aria-hidden /></span>
              {t.contact.hours[0].day}: {t.contact.hours[0].time}
            </li>
            <li className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-cream/5"><MapPin className="size-4" aria-hidden /></span>
              {t.contact.area}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/55 sm:flex-row">
          <p>© {year} {siteConfig.name}. {t.footer.rights}</p>
          <p className="flex items-center gap-4">
            <Link href="/shipping-returns" className="hover:text-gold">{t.nav.shipping}</Link>
            <span aria-hidden>·</span>
            <span>{t.footer.made}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
