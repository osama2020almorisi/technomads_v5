"use client";

import { useI18n } from "@/lib/i18n";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="sr-only z-[100] rounded-full bg-honey px-5 py-3 font-semibold text-forest-950 focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
      {t.nav.skip}
    </a>
  );
}
