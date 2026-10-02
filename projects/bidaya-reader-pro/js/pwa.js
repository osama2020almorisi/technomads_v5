/* ═══ تسجيل Service Worker + زر التثبيت + إشعارات التحديث ═══ */
(async () => {
  if (!("serviceWorker" in navigator)) return;
  let deferredPrompt = null;

  try {
    const reg = await navigator.serviceWorker.register("service-worker.js", { scope: "./" });
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
  } catch (e) {
    console.warn("SW:", e.message);
  }

  // ─── زر التثبيت ───
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    UI.toast("تم تثبيت التطبيق بنجاح 🎉", "success");
    const btn = document.getElementById("pwa-install-btn");
    if (btn) btn.remove();
    deferredPrompt = null;
  });

  function showInstallButton() {
    if (document.getElementById("pwa-install-btn")) return;
    const btn = document.createElement("button");
    btn.id = "pwa-install-btn";
    btn.className = "btn btn-primary";
    btn.style.cssText = `
      position:fixed;bottom:24px;inset-inline-end:24px;z-index:998;
      box-shadow:0 6px 20px rgba(199,155,59,.4);
      display:flex;align-items:center;gap:8px;
      animation:pwa-slide-in .4s ease;
    `;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg> تثبيت التطبيق`;
    btn.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        UI.toast("جاري التثبيت…", "info", 2000);
      } else {
        UI.toast("يمكنك التثبيت لاحقاً من قائمة المتصفح", "info", 4000);
      }
      deferredPrompt = null;
      btn.remove();
    };
    document.body.appendChild(btn);

    // إخفاء الزر بعد 10 ثواني (لا يكون مزعجاً)
    setTimeout(() => {
      if (btn.parentElement) {
        btn.style.transition = "opacity .5s, transform .5s";
        btn.style.opacity = "0";
        btn.style.transform = "translateY(20px)";
        setTimeout(() => btn.remove(), 500);
      }
    }, 15000);
  }

  // ─── إضافة أنماط حركية ───
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pwa-slide-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // ─── تحذير file:// ───
  if (location.protocol === "file:") {
    window.addEventListener("load", () => {
      UI.toast("للحصول على أفضل تجربة (PWA + التخزين)، شغّل المشروع عبر خادم محلي بسيط", "warning", 7000);
    });
  }
})();