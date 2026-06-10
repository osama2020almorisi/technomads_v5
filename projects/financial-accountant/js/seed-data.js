// js/seed-data.js

// بيانات تجريبية للتطبيق
function seedDemoData() {
    if (confirm('هل تريد تحميل بيانات تجريبية؟ سيتم مسح أي بيانات موجودة.')) {
        const demoData = {
            users: [
                {
                    id: "user1",
                    name: "محمد أحمد",
                    email: "demo@example.com",
                    company: "شركة التقنية المحدودة",
                    phone: "+966501234567",
                    password: "123456",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            customers: [
                {
                    id: "cust1",
                    name: "أحمد السعدي",
                    email: "ahmed@example.com",
                    phone: "+966502345678",
                    address: "الرياض، حي الملز",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: "cust2",
                    name: "شركة النهضة",
                    email: "info@nahda.com",
                    phone: "+966112345679",
                    address: "جدة، حي الصفا",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            products: [
                {
                    id: "prod1",
                    name: "تصميم موقع إلكتروني",
                    description: "تصميم متجاوب واحترافي للمواقع الإلكترونية",
                    price: 2500,
                    type: "service",
                    category: "design",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: "prod2",
                    name: "استضافة سنوية",
                    description: "باقة استضافة مشتركة بسعة 10GB",
                    price: 1200,
                    type: "service",
                    category: "hosting",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            invoices: [],
            expenses: [],
            settings: {
                company: {
                    name: "شركتك",
                    taxNumber: "310123456789",
                    address: "عنوان شركتك",
                    phone: "+966112345678",
                    email: "info@yourcompany.com"
                },
                taxRate: 15,
                currency: "ر.س"
            }
        };
        
        // حفظ البيانات
        localStorage.setItem('financial_accountant_data', JSON.stringify(demoData));
        alert('تم تحميل البيانات التجريبية بنجاح! يمكنك تسجيل الدخول باستخدام: demo@example.com / 123456');
        window.location.href = 'auth/login.html';
    }
}

// إضافة زر لتحميل البيانات التجريبية في صفحة التسجيل
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('register.html')) {
        const authFooter = document.querySelector('.auth-footer');
        if (authFooter) {
            const demoButton = document.createElement('button');
            demoButton.textContent = 'تحميل بيانات تجريبية';
            demoButton.className = 'btn-secondary';
            demoButton.style.marginTop = '1rem';
            demoButton.onclick = seedDemoData;
            authFooter.appendChild(demoButton);
        }
    }
});