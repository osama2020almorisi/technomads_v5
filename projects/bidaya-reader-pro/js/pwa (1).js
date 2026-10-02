/* ═══ تسجيل Service Worker وإشعارات التحديث ═══ */
(async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("service-worker.js", { scope: "./" });
    // فحص التحديث كل ساعة
    setInterval(() => reg.update(), 60 * 60 * 1000);
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          UI.toast("يتوفر إصدار جديد من التطبيق", "info", 8000);
          const t = document.createElement("button");
          t.className = "btn btn-primary btn-sm";
          t.style.cssText = "position:fixed;top:70px;inset-inline-start:16px;z-index:999";
          t.textContent = "تحديث الآن";
          t.onclick = () => { sw.postMessage("SKIP_WAITING"); location.reload(); };
          document.body.appendChild(t);
        }
      });
    });
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; });
    window.addEventListener("appinstalled", () => UI.toast("تم تثبيت التطبيق بنجاح", "success"));
  } catch (e) {
    console.warn("SW:", e.message);
  }
})();

// تحذير عند فتح ملف file://
if (location.protocol === "file:") {
  window.addEventListener("load", () => {
    UI.toast("للحصول على أفضل تجربة (PWA + التخزين)، شغّل المشروع عبر خادم محلي بسيط", "warning", 7000);
  });
}