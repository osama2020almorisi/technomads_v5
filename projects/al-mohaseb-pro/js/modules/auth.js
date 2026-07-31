/**
 * المحاسب المالي Pro - Auth Module
 */

class AuthModule {
  init() {
    this.setupLoginForm();
    this.setupRegisterForm();
  }

  setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = form.querySelector('[name="email"]')?.value.trim();
      const password = form.querySelector('[name="password"]')?.value;

      if (!email || !password) {
        this.showAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }

      const users = Storage.getAll('users');
      const user = users.find(u => u.email === email);

      if (!user) {
        this.showAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      // Simple password check (in production use bcrypt)
      const storedPass = user.password || '';
      if (password !== storedPass) {
        this.showAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      Storage.setCurrentUser(user);

      // Redirect to dashboard
      window.location.href = '../pages/dashboard.html';
    });
  }

  setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const validation = UI.validateForm(form, {
        name: [{ required: true, message: 'الاسم مطلوب' }],
        email: [{ required: true, email: true, message: 'بريد إلكتروني صحيح مطلوب' }],
        password: [{ required: true, minLength: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }],
        confirmPassword: [{ required: true, match: 'password', message: 'كلمتا المرور غير متطابقتين' }]
      });

      if (!validation.isValid) {
        this.showAuthError('يرجى تصحيح الأخطاء في النموذج');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const users = Storage.getAll('users');
      if (users.some(u => u.email === data.email)) {
        this.showAuthError('هذا البريد الإلكتروني مستخدم بالفعل');
        return;
      }

      const newUser = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: 'admin',
        status: 'active',
        password: data.password
      };

      const created = Storage.create('users', newUser);
      Storage.setCurrentUser(created);

      UI.success('تم إنشاء الحساب بنجاح!');
      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 1000);
    });
  }

  showAuthError(message) {
    const errorEl = document.getElementById('authError');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
    } else {
      alert(message);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Auth = new AuthModule();
  Auth.init();
});