document.addEventListener('DOMContentLoaded', () => {
  // ===== زر القائمة (Hamburger) =====
  const menu = document.querySelector('.menu');
  const links = document.querySelector('.navlinks');
  
  if (menu && links) {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      links.classList.toggle('open');
    });

    // إغلاق القائمة عند الضغط خارجها
    document.addEventListener('click', (e) => {
      if (!links.contains(e.target) && !menu.contains(e.target)) {
        links.classList.remove('open');
      }
    });

    // إغلاق القائمة عند الضغط على أي رابط
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // ===== الوضع الداكن =====
  const toggle = document.querySelector('[data-theme]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }
  
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // ===== سنة الحقوق =====
  document.querySelectorAll('[data-year]').forEach(e => {
    e.textContent = new Date().getFullYear();
  });
});