/* ============================================================
   TechNomads — Main JS (v3.0)
   نقطة الدخول الرئيسية لجميع الوحدات
   ============================================================ */

// ===== Import Modules =====
import {initNavbar} from "./modules/navbar.js";
import {initCounters} from "./modules/counters.js";
import {initAnimations} from "./modules/animations.js";
import {initTheme} from "./modules/theme-toggle.js";
import {initLanguage} from "./modules/language.js";
import {initForms} from "./modules/form-validation.js";
import {initNewsletter} from "./modules/newsletter.js";
import {initShare} from "./modules/share.js";
import {initPWAInstall} from "./modules/pwa-install.js";
import {initOffline} from "./modules/offline-detect.js";
import {initAnalytics} from "./modules/analytics.js";
import {initChat} from "./modules/chat.js";
import {initCookies} from "./modules/cookies.js";
import {initSearch} from "./modules/search.js";
import {initLazyLoad} from "./modules/lazy-load.js";
import {initAccessibility} from "./modules/accessibility.js";
import {initMobileNav} from "./modules/mobile-nav.js";
import {initFooterEnhancer} from "./modules/footer-enhancer.js";

// ============================================================
// BOOT — تهيئة جميع الوحدات
// ============================================================
const boot = () => {
  initNavbar();
  initCounters();
  initAnimations();
  initTheme();
  initLanguage();
  initForms();
  initNewsletter();
  initShare();
  initPWAInstall();
  initOffline();
  initAnalytics();
  initChat();
  initCookies();
  initSearch();
  initLazyLoad();
  initAccessibility();
  initMobileNav();
  initFooterEnhancer();

  // إزالة الـloader بعد التهيئة
  document.querySelector(".page-loader")?.classList.add("loaded");
};

// ============================================================
// تشغيل التهيئة (مرة واحدة)
// ============================================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// ============================================================
// SERVICE WORKER — التسجيل + إدارة التحديثات
// ============================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration.scope);

        // ===== فحص التحديثات كل ساعة =====
        setInterval(() => {
          registration.update().catch(() => {});
        }, 3600000);

        // ===== إشعار عند وجود تحديث جديد =====
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // يوجد تحديث جديد جاهز
              console.log("🔄 New content is available");

              // خيار 1: إشعار بسيط بدون تأكيد (أفضل للموبايل)
              showUpdateNotification(newWorker);

              // خيار 2: تأكيد فوري (يمكن تفعيله)
              // if (confirm("يوجد تحديث جديد للموقع. هل تريد إعادة التحميل؟")) {
              //   newWorker.postMessage({ type: "SKIP_WAITING" });
              //   window.location.reload();
              // }
            }
          });
        });

        // ===== إعادة التحميل عند تغيير الـcontroller =====
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      })
      .catch((err) => {
        console.warn("⚠️ Service Worker registration failed:", err);
      });
  });
}

// ============================================================
// إشعار التحديث (أنيق بدل confirm)
// ============================================================
function showUpdateNotification(newWorker) {
  // إزالة أي إشعار سابق
  document.getElementById("sw-update-notification")?.remove();

  const notif = document.createElement("div");
  notif.id = "sw-update-notification";
  notif.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <i class="fa-solid fa-arrows-rotate" style="color:#4ECDC4;font-size:1.1rem"></i>
      <div style="flex:1">
        <strong style="display:block;font-size:.9rem;margin-bottom:2px">تحديث جديد متوفر</strong>
        <span style="font-size:.78rem;opacity:.8">أعد التحميل للحصول على آخر التحديثات</span>
      </div>
      <button id="sw-update-reload" style="background:#2A2D7C;color:#fff;border:none;padding:7px 14px;border-radius:50px;font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer">تحديث</button>
      <button id="sw-update-close" style="background:none;border:none;color:inherit;cursor:pointer;padding:4px;font-size:1rem;opacity:.6" aria-label="إغلاق">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
  `;

  notif.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(120%);
    background: #fff;
    color: #20232A;
    padding: 14px 18px;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,.2);
    z-index: 10000;
    font-family: 'Tajawal', Arial, sans-serif;
    max-width: calc(100% - 24px);
    width: 400px;
    border: 1px solid #E4E7EC;
    transition: transform .4s cubic-bezier(.2,.8,.2,1), opacity .3s;
    opacity: 0;
  `;

  // دعم الوضع الداكن
  if (document.documentElement.dataset.theme === "dark" || document.body.classList.contains("dark-mode")) {
    notif.style.background = "#191B23";
    notif.style.color = "#F3F5F8";
    notif.style.borderColor = "#303440";
  }

  document.body.appendChild(notif);

  requestAnimationFrame(() => {
    notif.style.transform = "translateX(-50%) translateY(0)";
    notif.style.opacity = "1";
  });

  const close = () => {
    notif.style.transform = "translateX(-50%) translateY(120%)";
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 400);
  };

  notif.querySelector("#sw-update-close").addEventListener("click", close);
  notif.querySelector("#sw-update-reload").addEventListener("click", () => {
    newWorker.postMessage({ type: "SKIP_WAITING" });
    // controllerchange سيتولى إعادة التحميل
  });
}