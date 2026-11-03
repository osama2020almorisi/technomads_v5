import { siteConfig } from "@/data/site";

/**
 * يبني رابط wa.me مع رسالة جاهزة
 * @param message نص الرسالة (يتم ترميزه تلقائياً)
 * @param phone رقم بصيغة دولية بدون + (افتراضياً رقم المتجر)
 */
export function whatsappUrl(message: string, phone: string = siteConfig.whatsapp) {
  const clean = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
