"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { products } from "@/data/products";
import { siteConfig } from "@/data/site";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, fieldClass } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "./page-hero";

type Fields = { name: string; email: string; phone: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

export function ContactContent() {
  const { t, l } = useI18n();
  const [form, setForm] = useState<Fields>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const update = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  /** التحقق من صحة الحقول */
  const validate = () => {
    const er: Errors = {};
    if (!form.name.trim()) er.name = t.contact.required;
    if (!form.email.trim()) er.email = t.contact.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = t.contact.invalidEmail;
    if (!form.message.trim()) er.message = t.contact.required;
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const body = () =>
    [
      `${t.contact.msgIntro}`,
      `${t.contact.name}: ${form.name}`,
      `${t.contact.email}: ${form.email}`,
      form.phone ? `${t.contact.phone}: ${form.phone}` : null,
      `${t.contact.subject}: ${form.subject || t.contact.subjectNone}`,
      "",
      form.message,
    ]
      .filter((x): x is string => x !== null)
      .join("\n");

  const send = (via: "whatsapp" | "email") => {
    if (!validate()) return;
    const url =
      via === "whatsapp"
        ? whatsappUrl(body())
        : `mailto:${siteConfig.email}?subject=${encodeURIComponent(`${siteConfig.name} — ${form.subject || t.contact.subjectNone}`)}&body=${encodeURIComponent(body())}`;
    window.open(url, via === "whatsapp" ? "_blank" : "_self", "noopener,noreferrer");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  const err = (k: keyof Fields) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-xs font-medium text-destructive" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} crumb={t.nav.contact} />

      <section className="py-16 lg:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <Reveal className="rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-10">
            <h2 className="mb-8 font-display text-3xl rtl:font-bold">{t.contact.formTitle}</h2>
            <form noValidate onSubmit={(e) => { e.preventDefault(); send("whatsapp"); }} className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t.contact.name} *</Label>
                <Input id="name" name="name" autoComplete="name" value={form.name} onChange={update("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                {err("name")}
              </div>
              <div>
                <Label htmlFor="email">{t.contact.email} *</Label>
                <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" value={form.email} onChange={update("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                {err("email")}
              </div>
              <div>
                <Label htmlFor="phone">{t.contact.phone}</Label>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={update("phone")} />
              </div>
              <div>
                <Label htmlFor="subject">{t.contact.subject}</Label>
                <select id="subject" name="subject" value={form.subject} onChange={update("subject")} className={cn(fieldClass, "h-12")}>
                  <option value="">{t.contact.subjectNone}</option>
                  {products.map((p) => (
                    <option key={p.slug} value={l(p.name)}>{l(p.name)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">{t.contact.message} *</Label>
                <Textarea id="message" name="message" value={form.message} onChange={update("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
                {err("message")}
              </div>
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                <Button type="submit" variant="whatsapp" size="lg" className="w-full sm:flex-1">
                  <WhatsAppIcon className="size-5" /> {t.contact.sendWhatsapp}
                </Button>
                <Button type="button" variant="forest" size="lg" className="w-full sm:flex-1" onClick={() => send("email")}>
                  <Mail aria-hidden /> {t.contact.sendEmail}
                </Button>
              </div>
              <AnimatePresence>
                {sent && (
                  <m.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="flex items-center gap-2 rounded-xl bg-forest-50 px-4 py-3 text-sm font-medium text-forest sm:col-span-2 dark:bg-forest-800 dark:text-cream">
                    <CheckCircle2 className="size-4" aria-hidden /> {t.contact.success}
                  </m.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.05} className="rounded-[2rem] bg-forest p-7 text-cream">
              <h2 className="mb-5 flex items-center gap-2 font-semibold text-gold"><Phone className="size-4" aria-hidden /> {t.contact.phonesTitle}</h2>
              <ul className="space-y-3">
                {siteConfig.phones.map((p) => (
                  <li key={p.tel} className="flex items-center justify-between gap-3 rounded-2xl bg-cream/5 p-3 ps-4">
                    <a href={`tel:${p.tel}`} dir="ltr" className="font-semibold tabular-nums hover:text-gold">{p.display}</a>
                    <a href={whatsappUrl(t.whatsappMsg.general, p.tel)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${p.display}`} className="grid size-10 place-items-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-110">
                      <WhatsAppIcon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="rounded-[2rem] border border-border bg-card p-7">
              <h2 className="mb-5 flex items-center gap-2 font-semibold"><Clock className="size-4 text-honey" aria-hidden /> {t.contact.hoursTitle}</h2>
              <dl className="space-y-3 text-sm">
                {t.contact.hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-4 border-b border-dashed border-border pb-3 last:border-0 last:pb-0">
                    <dt className="text-muted-foreground">{h.day}</dt>
                    <dd className="text-end font-medium">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.15} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[2rem] border border-border bg-card p-7">
                <h2 className="mb-2 flex items-center gap-2 font-semibold"><Mail className="size-4 text-honey" aria-hidden /> {t.contact.emailTitle}</h2>
                <a href={`mailto:${siteConfig.email}`} className="break-all text-sm text-muted-foreground hover:text-foreground">{siteConfig.email}</a>
              </div>
              <div className="rounded-[2rem] border border-border bg-card p-7">
                <h2 className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="size-4 text-honey" aria-hidden /> {t.contact.areaTitle}</h2>
                <p className="text-sm text-muted-foreground">{t.contact.area}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
