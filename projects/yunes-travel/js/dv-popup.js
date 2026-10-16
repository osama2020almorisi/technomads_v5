/* ============================================
   🔔 إشعار DV-2027 المنبثق
   يظهر مرة واحدة فقط في الجلسة
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('dv-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('.dv-popup-close');
  const overlay = popup;
  const SESSION_KEY = 'dvPopupShown_v1';

  // ✅ التحقق: إذا تم عرضه في هذه الجلسة → لا تعرضه مرة أخرى
  const alreadyShown = sessionStorage.getItem(SESSION_KEY);
  if (alreadyShown) return;

  // 🎬 عرض الإشعار بعد 1.5 ثانية من دخول الزائر
  setTimeout(() => {
    popup.classList.add('show');
    sessionStorage.setItem(SESSION_KEY, '1');

    // منع تمرير الصفحة أثناء عرض الإشعار
    document.body.style.overflow = 'hidden';
  }, 1500);

  // ❌ إغلاق الإشعار
  function closePopup() {
    popup.classList.remove('show');
    document.body.style.overflow = '';
  }

  // زر الإغلاق
  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }

  // الضغط على الخلفية خارج البطاقة
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  // الضغط على ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
      closePopup();
    }
  });
});