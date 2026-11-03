/** قراءة/كتابة آمنة من التخزين المحلي (تتجاهل الأخطاء في المتصفحات المقيدة) */
export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* التخزين غير متاح — نتجاهل بهدوء */
  }
}
