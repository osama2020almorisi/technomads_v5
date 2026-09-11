/* =========================================
   Rang Website - Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {

    // --- عناصر الصفحة ---
    const menuIcon = document.querySelector('.menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const overlay = document.getElementById('overlay');

    // --- فتح وإغلاق القائمة الجانبية ---
    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', function() {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function() {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // --- تشغيل القوائم المنسدلة (Submenus) ---
    const submenuParents = document.querySelectorAll('.has-submenu > a');
    
    submenuParents.forEach(parent => {
        parent.addEventListener('click', function(e) {
            e.preventDefault(); // منع الانتقال للرابط
            const submenu = this.nextElementSibling;
            const parentLi = this.parentElement;
            
            // إغلاق القوائم الأخرى
            document.querySelectorAll('.has-submenu').forEach(li => {
                if (li !== parentLi) {
                    li.classList.remove('active');
                    const otherSub = li.querySelector('.submenu');
                    if (otherSub) otherSub.style.display = 'none';
                }
            });

            // فتح/إغلاق القائمة الحالية
            if (submenu) {
                if (submenu.style.display === 'block') {
                    submenu.style.display = 'none';
                    parentLi.classList.remove('active');
                } else {
                    submenu.style.display = 'block';
                    parentLi.classList.add('active');
                }
            }
        });
    });

    // --- تفعيل أيقونة المشاركة (Share) ---
    const shareButtons = document.querySelectorAll('.share-icon');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                }).catch(console.error);
            } else {
                // نسخ الرابط كبديل
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('تم نسخ الرابط بنجاح!');
                });
            }
        });
    });

});