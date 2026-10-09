import {CONFIG} from "../core/config.js";

const items = [
  {href: "index.html",     label: "الرئيسية",    icon: "fa-house"},
  {href: "services.html",  label: "الخدمات",     icon: "fa-table-cells-large"},
  {href: "portfolio.html", label: "المشاريع",    icon: "fa-layer-group"},
  {href: "about.html",     label: "من نحن",      icon: "fa-circle-info"},
  {href: "contact.html#project-form", label: "اطلب مشروع", icon: "fa-rocket"}
];

// الصفحات التي لا يظهر فيها الشريط السفلي
const hideOn = ["privacy.html", "terms.html", "faq.html", "404.html", "offline.html"];

export function initMobileNav(){
  // منع التكرار
  if(document.querySelector(".mobile-bottom-nav")) return;

  // الحصول على الصفحة الحالية
  const current = location.pathname.split("/").pop() || "index.html";

  // إخفاء على صفحات معينة
  if(hideOn.includes(current)) return;

  // إنشاء الشريط
  const nav = document.createElement("nav");
  nav.className = "mobile-bottom-nav";
  nav.setAttribute("aria-label", "التنقل السريع");
  nav.innerHTML = `
    <div class="mobile-bottom-nav__inner">
      ${items.map(i => `
        <a class="mobile-bottom-nav__item" href="${i.href}">
          <span class="mobile-bottom-nav__icon">
            <i class="fa-solid ${i.icon}" aria-hidden="true"></i>
          </span>
          <span>${i.label}</span>
        </a>
      `).join("")}
    </div>
  `;
  document.body.appendChild(nav);

  // تفعيل الرابط الحالي
  nav.querySelectorAll("a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if(href.split("#")[0] === current){
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}