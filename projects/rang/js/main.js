/* =====================================================================
   رَنْج - ملف الجافاسكربت الرئيسي
   - قائمة الجوال | الهيدر عند التمرير | فلترة المعرض | الأسئلة الشائعة
   - الظهور عند التمرير | نموذج Formspree | زر العودة للأعلى
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. قائمة الجوال (الهامبرغر) ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
      navToggle.classList.toggle("active");
      navToggle.setAttribute(
        "aria-expanded",
        mainNav.classList.contains("open") ? "true" : "false"
      );
    });

    // إغلاق القائمة عند النقر على أي رابط داخلها
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.classList.remove("active");
      });
    });
  }

  /* ---------- 2. تأثير الهيدر وزر العودة عند التمرير ---------- */
  var header = document.querySelector(".site-header");
  var backTop = document.getElementById("backTop");

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (backTop) backTop.classList.toggle("show", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 3. الظهور التدريجي للعناصر عند التمرير ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 4. فلترة معرض الأعمال ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var galleryItems = document.querySelectorAll(".gallery-item");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // تفعيل الزر المحدد
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-cat") === filter;
        item.classList.toggle("hidden", !match);
      });
    });
  });

  /* ---------- 5. الأسئلة الشائعة (أكورديون) ---------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.parentElement;
      var wasOpen = item.classList.contains("open");
      // إغلاق الكل ثم فتح المحدد
      document.querySelectorAll(".faq-item").forEach(function (i) {
        i.classList.remove("open");
      });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* ---------- 6. نموذج التواصل (Formspree) ---------- */
  // مهم: استبدل YOUR_FORM_ID في سمة action داخل contact.html
  // بمعرف النموذج الذي تحصل عليه من موقع formspree.io
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "جارٍ الإرسال...";
      status.style.display = "block";

      var data = new FormData(form);

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            status.className = "form-status ok";
            status.textContent = "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً بإذن الله.";
            form.reset();
          } else {
            throw new Error("فشل الإرسال");
          }
        })
        .catch(function () {
          status.className = "form-status err";
          status.textContent = "حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.";
        });
    });
  }

  /* ---------- 7. سنة حقوق النشر تلقائياً ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
