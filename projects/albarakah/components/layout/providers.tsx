"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion, MotionConfig } from "framer-motion";

// تحميل ميزات الحركة لاحقاً (code-splitting) لتسريع أول عرض للصفحة
const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <CartProvider>
          <LazyMotion features={loadFeatures} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LazyMotion>
        </CartProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
