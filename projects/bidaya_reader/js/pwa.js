/* ============================================================
   pwa.js — تسجيل SW + تحديث تلقائي (v2)
   - إلغاء تلقائي للـ SW القديم
   - إعادة تحميل تلقائية عند تحديث جديد
   - زر "تحديث" في Toast
   ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' })
      .then(reg => {
        console.log('✅ SW registered:', reg.scope);

        // ✅ افحص التحديثات فورًا
        reg.update().catch(() => {});

        // راقب التحديثات الجديدة
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // SW جديد جاهز
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 تحديث جديد متاح');

              // أظهر Toast مع زر
              showUpdateToast(newWorker);
            }
          });
        });
      })
      .catch(err => console.warn('⚠️ SW failed:', err));

    // إذا تغيّر الـ controller → أعد تحميل الصفحة
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('🔄 Controller changed — reloading...');
        window.location.reload();
      }
    });
  });
}

function showUpdateToast(newWorker) {
  // إذا لم يكن UI معرّفًا، استخدم toast يدويًا
  if (typeof UI !== 'undefined' && UI.toast) {
    UI.toast('🔄 تحديث جديد — أعد تحميل الصفحة', 'info', 15000);
    return;
  }

  // toast يدوي
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = 'toast toast-info';
  t.innerHTML = `
    🔄 تحديث جديد متاح
    <button
      style="margin-inline-start:8px;background:var(--gold);color:#000;border:0;border-radius:6px;padding:4px 10px;font-weight:700;cursor:pointer"
      onclick="updateSW()"
    >تحديث الآن</button>
  `;
  c.appendChild(t);

  window.updateSW = () => {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
  };
}