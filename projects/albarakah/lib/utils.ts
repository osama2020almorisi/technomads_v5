import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/data/site";

/** دمج كلاسات Tailwind بدون تعارض */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** تنسيق السعر بالدولار حسب اللغة */
export function formatPrice(value: number, locale: Locale = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
