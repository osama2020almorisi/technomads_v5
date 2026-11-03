"use client";

import { m } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

/** زر واتساب عائم في أسفل الشاشة */
export function WhatsAppFloat() {
  const { t } = useI18n();
  return (
    <m.a
      href={whatsappUrl(t.whatsappMsg.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.common.whatsappFloat}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08, rotate: -6 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed bottom-5 end-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_40px_-10px_rgba(37,211,102,.8)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.4s]" aria-hidden />
      <WhatsAppIcon className="relative size-7" />
      <span className="pointer-events-none absolute end-16 hidden whitespace-nowrap rounded-full bg-forest-900 px-4 py-2 text-xs font-medium text-cream opacity-0 shadow-soft transition-opacity group-hover:opacity-100 sm:block">
        {t.common.whatsappFloat}
      </span>
    </m.a>
  );
}
