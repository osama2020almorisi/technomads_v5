"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Menu, Phone, Truck, X } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { CartButton } from "./cart-button";

export function Header() {
  const { t, dir } = useI18n();
  const slide = dir === "rtl" ? "-100%" : "100%";
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <>
      {/* شريط الإعلانات العلوي */}
      <div className="relative z-50 bg-forest-900 text-cream">
        <div className="container flex h-9 items-center justify-center gap-6 text-xs sm:justify-between">
          <p className="flex items-center gap-2">
            <Truck className="size-3.5 text-gold" aria-hidden />
            <span>
              {t.product.freeShip} ${siteConfig.freeShippingThreshold}
              <span className="hidden sm:inline"> · {t.features[0].title}</span>
            </span>
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            {siteConfig.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} dir="ltr" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
                <Phone className="size-3" aria-hidden /> {p.display}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled
            ? "border-b border-border/60 bg-background/70 shadow-[0_10px_40px_-20px_rgba(12,33,24,.35)] backdrop-blur-xl backdrop-saturate-150"
            : "bg-background/30 backdrop-blur-sm"
        )}
      >
        <div className={cn("container flex items-center justify-between gap-4 transition-all duration-500", scrolled ? "h-16" : "h-20")}>
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-honey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-honey-300",
                      isActive(link.href) ? "text-forest dark:text-gold" : "text-foreground/75"
                    )}
                  >
                    {isActive(link.href) && (
                      <m.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-honey/15" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <CartButton />
            <Button asChild variant="gold" className="hidden animate-soft-pulse md:inline-flex">
              <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                {t.nav.orderNow}
              </a>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid size-10 place-items-center rounded-full border border-border/70 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* القائمة الجانبية للموبايل */}
      <AnimatePresence>
        {open && (
          <m.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label={t.nav.closeMenu} className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <m.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.menu}
              initial={{ x: slide }}
              animate={{ x: 0 }}
              exit={{ x: slide }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-background p-6 shadow-luxe"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} aria-label={t.nav.closeMenu} autoFocus className="grid size-10 place-items-center rounded-full border border-border">
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <nav aria-label="Mobile">
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <m.li key={link.href} initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "block rounded-2xl px-4 py-3.5 font-display text-2xl rtl:font-arabic rtl:font-bold transition-colors",
                          isActive(link.href) ? "bg-honey/15 text-forest dark:text-gold" : "hover:bg-muted"
                        )}
                      >
                        {t.nav[link.key]}
                      </Link>
                    </m.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto space-y-3 pt-6">
                <LanguageToggle className="w-full justify-center" />
                <Button asChild variant="whatsapp" className="w-full">
                  <a href={whatsappUrl(t.whatsappMsg.general)} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-4" /> {t.nav.orderNow}
                  </a>
                </Button>
                {siteConfig.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} dir="ltr" className="flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium">
                    <Phone className="size-4 text-honey" aria-hidden /> {p.display}
                  </a>
                ))}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
