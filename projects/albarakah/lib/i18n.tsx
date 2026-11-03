"use client";

/**
 * نظام الترجمة (i18n) المخصص — EN / AR مع دعم RTL كامل
 * يحفظ اللغة المختارة ويغيّر اتجاه الصفحة (dir) تلقائياً.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, dictionaries, type Dictionary, type Locale, type LocalizedText } from "@/data/site";
import { readStore, writeStore } from "./storage";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  /** اختيار النص المناسب من كائن مترجم */
  l: (text: LocalizedText) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "abn-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // عند أول تحميل: نقرأ اللغة المحفوظة
  useEffect(() => {
    const saved = readStore<Locale | null>(STORAGE_KEY, null);
    if (saved === "en" || saved === "ar") setLocaleState(saved);
  }, []);

  // تحديث lang و dir على عنصر <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeStore(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: dictionaries[locale],
      setLocale,
      toggleLocale: () => setLocale(locale === "en" ? "ar" : "en"),
      l: (text) => text[locale],
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
