document.addEventListener('DOMContentLoaded', () => {

  // ===== رقم الواتساب (بدون + وبدون مسافات) =====
  const WHATSAPP_NUMBER = '967770200970';

  // ===== البريد الإلكتروني =====
  const EMAIL = '2025ooss@gmail.com';

  // ===== دالة إرسال عبر واتساب =====
  function sendToWhatsApp(form) {
    const formData = new FormData(form);
    let message = '';

    formData.forEach((value, key) => {
      if (value && key !== 'form-name') {
        message += `${key}: ${value}\n`;
      }
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // ===== دالة إرسال عبر البريد =====
  function sendToEmail(form) {
    const formData = new FormData(form);
    const subject = 'طلب جديد من موقع YUNES Travel & Education';
    let body = '';

    formData.forEach((value, key) => {
      if (value && key !== 'form-name') {
        body += `${key}: ${value}\n`;
      }
    });

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  // ===== ربط أزرار النماذج =====
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = e.submitter || form.querySelector('button[type="submit"], button:not([type])');
      const sendMethod = submitBtn ? submitBtn.dataset.method : 'whatsapp';

      if (sendMethod === 'email') {
        sendToEmail(form);
      } else {
        sendToWhatsApp(form);
      }

      const toast = document.querySelector('.toast');
      if (toast) {
        const msg = sendMethod === 'email'
          ? '✅ تم فتح بريدك الإلكتروني. اضغط إرسال لإكمال طلبك.'
          : '✅ تم فتح واتساب. اضغط إرسال لإكمال طلبك.';
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
      }

      setTimeout(() => form.reset(), 2000);
    });
  });

  // ===== زر واتساب سريع =====
  document.querySelectorAll('[data-whatsapp]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
    });
  });

  // ===== زر البريد السريع =====
  document.querySelectorAll('[data-email]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `mailto:${EMAIL}`;
    });
  });

});