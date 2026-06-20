// ============================================================
// SCRIPT.JS - النسخة المحسنة والمتقنة
// الخطوط الجوية اليمنية - متطلبات السفر
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // 1. المتغيرات العامة
    // ============================================================
    let travelData = {};
    let currentResults = null;
    const DOM = {};

    // ============================================================
    // 2. DOM Elements - تجميع المراجع
    // ============================================================
    function cacheDomElements() {
        DOM.loader = document.getElementById('loader');
        DOM.mainContent = document.getElementById('mainContent');
        DOM.nationality = document.getElementById('nationality');
        DOM.destination = document.getElementById('destination');
        DOM.city = document.getElementById('city');
        DOM.searchBtn = document.getElementById('searchBtn');
        DOM.clearBtn = document.getElementById('clearBtn');
        DOM.results = document.getElementById('results');
        DOM.resultsCard = document.getElementById('requirementsCard');
        DOM.resultTitle = document.getElementById('resultTitle');
        DOM.closeResults = document.getElementById('closeResults');
        DOM.generalBody = document.getElementById('generalBody');
        DOM.toggleGeneral = document.getElementById('toggleGeneral');
        DOM.searchIndicator = document.getElementById('searchIndicator');
        DOM.scrollTop = document.getElementById('scrollTop');
        DOM.updateDate = document.getElementById('updateDate');
    }

    // ============================================================
    // 3. تحميل البيانات
    // ============================================================
    async function loadData() {
        try {
            showLoader(true);
            const response = await fetch('data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            travelData = await response.json();
            
            // التحقق من صحة البيانات
            if (!travelData.destinations || Object.keys(travelData.destinations).length === 0) {
                throw new Error('البيانات غير صالحة أو فارغة');
            }
            
            initializePage();
            showLoader(false);
            DOM.mainContent.style.display = 'block';
            
            // تحديث تاريخ الصفحة
            if (DOM.updateDate) {
                const now = new Date();
                DOM.updateDate.textContent = now.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            showLoader(false);
            showError('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        }
    }

    // ============================================================
    // 4. عرض/إخفاء شريط التحميل
    // ============================================================
    function showLoader(show) {
        if (DOM.loader) {
            if (show) {
                DOM.loader.classList.remove('hidden');
            } else {
                DOM.loader.classList.add('hidden');
            }
        }
    }

    // ============================================================
    // 5. عرض رسالة خطأ
    // ============================================================
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 20px 25px;
            border-radius: 12px;
            border-right: 4px solid #c62828;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 1.1rem;
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.prepend(errorDiv);
            setTimeout(() => {
                errorDiv.style.opacity = '0';
                errorDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => errorDiv.remove(), 500);
            }, 8000);
        }
    }

    // ============================================================
    // 6. تهيئة الصفحة
    // ============================================================
    function initializePage() {
        populateDestinations();
        populateGeneralInfo();
        setupEventListeners();
        setupScrollTop();
        checkUrlParams();
    }

    // ============================================================
    // 7. تعبئة قائمة الوجهات
    // ============================================================
    function populateDestinations() {
        const destinationSelect = DOM.destination;
        if (!destinationSelect) return;

        // حفظ القيمة المحددة مسبقاً
        const previousValue = destinationSelect.value;
        
        destinationSelect.innerHTML = '<option value="">-- اختر الوجهة --</option>';
        
        // ترتيب الوجهات أبجدياً
        const destinations = Object.keys(travelData.destinations).sort((a, b) => 
            a.localeCompare(b, 'ar')
        );
        
        destinations.forEach(destination => {
            const option = document.createElement('option');
            option.value = destination;
            option.textContent = destination;
            option.dataset.hasCities = travelData.destinations[destination].cities ? 'true' : 'false';
            destinationSelect.appendChild(option);
        });
        
        // استعادة القيمة السابقة إن وجدت
        if (previousValue && destinations.includes(previousValue)) {
            destinationSelect.value = previousValue;
            updateCities();
        }
    }

    // ============================================================
    // 8. تعبئة التعليمات العامة
    // ============================================================
    function populateGeneralInfo() {
        if (!DOM.generalBody || !travelData.general_requirements) return;
        
        const req = travelData.general_requirements;
        let html = '';
        
        // التعليمات
        if (req.instructions && req.instructions.length > 0) {
            html += `
                <div class="section">
                    <h3><i class="fas fa-list-ul"></i> ${req.title || 'التعليمات العامة'}</h3>
                    <ul>
                        ${req.instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // الأمتعة
        if (req.baggage) {
            html += `
                <div class="section">
                    <h3><i class="fas fa-suitcase"></i> معلومات الأمتعة</h3>
                    <div class="baggage-item">
                        <strong><i class="fas fa-hand-bag"></i> حقيبة اليد:</strong>
                        <span>${req.baggage.hand_baggage || 'غير محدد'}</span>
                    </div>
                    <div class="baggage-item">
                        <strong><i class="fas fa-chair"></i> الدرجة السياحية:</strong>
                        <span>${req.baggage.economy || 'غير محدد'}</span>
                    </div>
                    <div class="baggage-item">
                        <strong><i class="fas fa-crown"></i> درجة رجال الأعمال والأولى:</strong>
                        <span>${req.baggage.business_first || 'غير محدد'}</span>
                    </div>
                    ${req.baggage.note ? `
                        <div class="baggage-item note">
                            <strong><i class="fas fa-info-circle"></i> ملاحظة:</strong>
                            <span>${req.baggage.note}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        // الملاحظة العامة
        if (req.note) {
            html += `
                <div class="note">
                    <strong><i class="fas fa-exclamation-triangle"></i> ملاحظة هامة:</strong>
                    <p>${req.note}</p>
                </div>
            `;
        }
        
        DOM.generalBody.innerHTML = html || '<p>لا توجد تعليمات عامة متاحة</p>';
    }

    // ============================================================
    // 9. تحديث قائمة المدن
    // ============================================================
    function updateCities() {
        const destination = DOM.destination.value;
        const citySelect = DOM.city;
        if (!citySelect) return;
        
        citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
        
        if (destination && travelData.destinations[destination]) {
            const cities = travelData.destinations[destination].cities || [];
            if (cities.length > 0) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);
                });
            } else {
                // إذا لم توجد مدن، نضيف خيار "الوجهة نفسها"
                const option = document.createElement('option');
                option.value = destination;
                option.textContent = destination;
                citySelect.appendChild(option);
            }
        }
    }

    // ============================================================
    // 10. البحث عن المتطلبات
    // ============================================================
    function searchRequirements() {
        const nationality = DOM.nationality.value;
        const destination = DOM.destination.value;
        const city = DOM.city.value;
        
        // التحقق من المدخلات
        if (!nationality) {
            showToast('يرجى اختيار الجنسية', 'warning');
            DOM.nationality.focus();
            return;
        }
        
        if (!destination) {
            showToast('يرجى اختيار الوجهة', 'warning');
            DOM.destination.focus();
            return;
        }
        
        // إظهار مؤشر البحث
        if (DOM.searchIndicator) {
            DOM.searchIndicator.style.display = 'flex';
        }
        
        // محاكاة تأخير البحث (لتحسين تجربة المستخدم)
        setTimeout(() => {
            const destinationData = travelData.destinations[destination];
            const selectedCity = city || destination;
            
            // إخفاء مؤشر البحث
            if (DOM.searchIndicator) {
                DOM.searchIndicator.style.display = 'none';
            }
            
            if (!destinationData) {
                showToast('لا توجد بيانات لهذه الوجهة', 'error');
                return;
            }
            
            // عرض النتائج
            displayResults(destinationData, destination, selectedCity, nationality);
            
            // التمرير إلى النتائج
            if (DOM.results) {
                DOM.results.style.display = 'block';
                DOM.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
        }, 400);
    }

    // ============================================================
    // 11. عرض النتائج
    // ============================================================
    function displayResults(destinationData, destinationName, city, nationality) {
        if (!DOM.resultsCard) return;
        
        let html = '';
        let hasContent = false;
        
        // العنوان
        const titleParts = [destinationName];
        if (city && city !== destinationName) titleParts.push(`- ${city}`);
        if (nationality) titleParts.push(`(الجنسية: ${nationality})`);
        
        DOM.resultTitle.textContent = `متطلبات السفر إلى ${titleParts.join(' ')}`;
        
        // ===== 1. المتطلبات الأساسية =====
        if (destinationData.requirements && Array.isArray(destinationData.requirements) && destinationData.requirements.length > 0) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-clipboard-check"></i> المتطلبات الأساسية</h3>
                    <ul>
                        ${destinationData.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 2. متطلبات التأشيرة (الأردن) =====
        if (destinationData.visa_requirements) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-passport"></i> متطلبات التأشيرة</h3>
                    ${destinationData.visa_requirements.المعفون ? `
                        <div class="sub-section">
                            <h4><i class="fas fa-check-circle" style="color:#2e7d32;"></i> المعفون من التأشيرة المسبقة</h4>
                            <ul>
                                ${destinationData.visa_requirements.المعفون.map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${destinationData.visa_requirements['يحتاجون_تأشيرة_مسبقة'] ? `
                        <div class="sub-section">
                            <h4><i class="fas fa-exclamation-circle" style="color:#c62828;"></i> يحتاجون تأشيرة مسبقة</h4>
                            <ul>
                                ${destinationData.visa_requirements['يحتاجون_تأشيرة_مسبقة'].map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 3. متطلبات الترانزيت =====
        if (destinationData.transit_requirements) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-exchange-alt"></i> متطلبات الترانزيت</h3>
                    ${Array.isArray(destinationData.transit_requirements) 
                        ? `<ul>${destinationData.transit_requirements.map(req => `<li>${req}</li>`).join('')}</ul>`
                        : Object.entries(destinationData.transit_requirements).map(([key, requirements]) => `
                            <div class="sub-section">
                                <h4>${key.replace(/_/g, ' ')}</h4>
                                <ul>
                                    ${requirements.map(req => `<li>${req}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')
                    }
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 4. المواد المسموحة =====
        if (destinationData.allowed_items) {
            let cityItems = destinationData.allowed_items[city];
            if (!cityItems && typeof destinationData.allowed_items === 'object') {
                // محاولة العثور على المفتاح المناسب
                const keys = Object.keys(destinationData.allowed_items);
                for (const key of keys) {
                    if (key.includes(city) || city.includes(key)) {
                        cityItems = destinationData.allowed_items[key];
                        break;
                    }
                }
                if (!cityItems) {
                    // استخدام أول عنصر
                    cityItems = destinationData.allowed_items[keys[0]] || destinationData.allowed_items;
                }
            }
            
            if (cityItems && Object.keys(cityItems).length > 0) {
                html += `
                    <div class="section fade-in">
                        <h3><i class="fas fa-box"></i> المواد المسموحة</h3>
                        ${Object.entries(cityItems).map(([item, description]) => `
                            <div class="baggage-item">
                                <strong>${item.replace(/_/g, ' ')}:</strong>
                                <span>${description}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                hasContent = true;
            }
        }
        
        // ===== 5. أسعار الوزن الزائد =====
        if (destinationData.excess_weight) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-weight"></i> أسعار الوزن الزائد</h3>
                    ${Object.entries(destinationData.excess_weight).map(([to, price]) => `
                        <div class="weight-item">
                            <strong>إلى ${to}:</strong>
                            <span>${price}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 6. الخدمات الخاصة =====
        if (destinationData.special_services) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-wheelchair"></i> الخدمات الخاصة</h3>
                    ${Object.entries(destinationData.special_services).map(([service, price]) => {
                        if (typeof price === 'object') {
                            return Object.entries(price).map(([subService, subPrice]) => `
                                <div class="service-item">
                                    <strong>${service.replace(/_/g, ' ')} - ${subService.replace(/_/g, ' ')}:</strong>
                                    <span>${subPrice}</span>
                                </div>
                            `).join('');
                        } else {
                            return `
                                <div class="service-item">
                                    <strong>${service.replace(/_/g, ' ')}:</strong>
                                    <span>${price}</span>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 7. مواعيد العمرة (السعودية) =====
        if (destinationData.umrah_dates) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-mosque"></i> مواعيد نقل المعتمرين</h3>
                    <div class="baggage-item">
                        <strong>بداية دخول حاملي تأشيرات العمرة:</strong>
                        <span>${destinationData.umrah_dates.بداية_الدخول}</span>
                    </div>
                    <div class="baggage-item">
                        <strong>آخر موعد لدخول حاملي تأشيرة العمرة:</strong>
                        <span>${destinationData.umrah_dates.آخر_موعد_لدخول}</span>
                    </div>
                    <div class="baggage-item">
                        <strong>آخر موعد لمغادرة حاملي تأشيرة العمرة:</strong>
                        <span>${destinationData.umrah_dates.آخر_موعد_لمغادرة}</span>
                    </div>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 8. المستندات المطلوبة (الهند) =====
        if (destinationData.documents_required) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-file-alt"></i> المستندات المطلوبة</h3>
                    <ul>
                        ${destinationData.documents_required.map(doc => `<li>${doc}</li>`).join('')}
                    </ul>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 9. متطلبات الحجز (الهند) =====
        if (destinationData.booking_requirements) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-ticket-alt"></i> متطلبات الحجز</h3>
                    <ul>
                        ${destinationData.booking_requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 10. لوائح الاستيراد (إثيوبيا) =====
        if (destinationData.import_regulations) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-truck-loading"></i> لوائح الاستيراد</h3>
                    <ul>
                        ${destinationData.import_regulations.map(reg => `<li>${reg}</li>`).join('')}
                    </ul>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 11. متطلبات السوريين (لبنان) =====
        if (destinationData.syrian_nationals) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-users"></i> متطلبات الجنسية السورية</h3>
                    <ul>
                        ${destinationData.syrian_nationals.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 12. متطلبات الأجانب (اليمن) =====
        if (destinationData.foreigners_requirements) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-globe-asia"></i> متطلبات الأجانب لدخول اليمن</h3>
                    ${Object.entries(destinationData.foreigners_requirements).map(([airport, requirements]) => `
                        <div class="sub-section">
                            <h4><i class="fas fa-plane"></i> مطار ${airport}</h4>
                            ${Object.entries(requirements).map(([key, value]) => {
                                if (Array.isArray(value)) {
                                    return `
                                        <h5>${key.replace(/_/g, ' ')}</h5>
                                        <ul>
                                            ${value.map(item => `<li>${item}</li>`).join('')}
                                        </ul>
                                    `;
                                } else {
                                    return `<p><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</p>`;
                                }
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 13. متطلبات حاملي الجوازات اليمنية (اليمن) =====
        if (destinationData.yemeni_passport_holders) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-id-card"></i> متطلبات حاملي الجوازات اليمنية</h3>
                    <div class="sub-section">
                        <h4>الوثائق المطلوبة</h4>
                        <ul>
                            ${destinationData.yemeni_passport_holders.required_documents.map(doc => `<li>${doc}</li>`).join('')}
                        </ul>
                    </div>
                    ${destinationData.yemeni_passport_holders.note ? `
                        <div class="note" style="margin-top:12px;">
                            <strong>ملاحظة:</strong>
                            <p>${destinationData.yemeni_passport_holders.note}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 14. رسوم التحويل (الإمارات) =====
        if (destinationData.transfer_fees) {
            html += `
                <div class="section fade-in">
                    <h3><i class="fas fa-money-bill-wave"></i> رسوم خدمة التحويل (مرحبا)</h3>
                    ${Object.entries(destinationData.transfer_fees).map(([service, fee]) => `
                        <div class="service-item">
                            <strong>${service.replace(/_/g, ' ')}:</strong>
                            <span>${fee}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            hasContent = true;
        }
        
        // ===== 15. الملاحظة النهائية =====
        const finalNote = destinationData.note || travelData.general_note;
        if (finalNote) {
            html += `
                <div class="note fade-in">
                    <strong><i class="fas fa-exclamation-triangle"></i> ملاحظة هامة:</strong>
                    <p>${finalNote}</p>
                </div>
            `;
        }
        
        // ===== إذا لم يوجد محتوى =====
        if (!hasContent) {
            html = `
                <div class="empty-state" style="text-align:center;padding:40px 20px;">
                    <i class="fas fa-search" style="font-size:3rem;color:#bdbdbd;margin-bottom:15px;display:block;"></i>
                    <h3 style="color:#757575;">لا توجد متطلبات محددة لهذه الوجهة</h3>
                    <p style="color:#9e9e9e;">يرجى التحقق من الوجهة المختارة أو المحاولة مرة أخرى</p>
                </div>
            `;
        }
        
        DOM.resultsCard.innerHTML = html;
        DOM.results.style.display = 'block';
        
        // حفظ النتائج الحالية
        currentResults = { destinationData, destinationName, city, nationality };
    }

    // ============================================================
    // 12. إظهار رسائل Toast
    // ============================================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            success: 'fa-check-circle'
        };
        
        const colors = {
            info: '#2196f3',
            warning: '#ff9800',
            error: '#f44336',
            success: '#4caf50'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}" style="color:${colors[type] || colors.info};"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 14px;
            z-index: 10000;
            max-width: 400px;
            font-size: 1rem;
            border-right: 4px solid ${colors[type] || colors.info};
            animation: slideUp 0.4s ease;
            direction: rtl;
        `;
        
        // إضافة زر الإغلاق
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        });
        
        document.body.appendChild(toast);
        
        // إزالة تلقائية بعد 5 ثواني
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // ============================================================
    // 13. إعداد مستمعات الأحداث
    // ============================================================
    function setupEventListeners() {
        // تغيير الوجهة -> تحديث المدن
        DOM.destination.addEventListener('change', updateCities);
        
        // زر البحث
        DOM.searchBtn.addEventListener('click', searchRequirements);
        
        // زر مسح
        DOM.clearBtn.addEventListener('click', clearSearch);
        
        // إغلاق النتائج
        DOM.closeResults.addEventListener('click', () => {
            DOM.results.style.display = 'none';
            DOM.resultsCard.innerHTML = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // طي/فك التعليمات العامة
        DOM.toggleGeneral.addEventListener('click', toggleGeneralInfo);
        
        // زر العودة للأعلى
        DOM.scrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // البحث عند الضغط على Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                if (active && (active.id === 'nationality' || active.id === 'destination' || active.id === 'city')) {
                    searchRequirements();
                }
            }
        });
        
        // إظهار/إخفاء زر العودة للأعلى عند التمرير
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                DOM.scrollTop.classList.add('show');
                DOM.scrollTop.style.display = 'flex';
            } else {
                DOM.scrollTop.classList.remove('show');
                DOM.scrollTop.style.display = 'none';
            }
        });
    }

    // ============================================================
    // 14. مسح البحث
    // ============================================================
    function clearSearch() {
        DOM.nationality.value = '';
        DOM.destination.value = '';
        DOM.city.innerHTML = '<option value="">-- اختر المدينة --</option>';
        DOM.results.style.display = 'none';
        DOM.resultsCard.innerHTML = '';
        DOM.resultTitle.textContent = 'متطلبات السفر';
        
        // إعادة تعيين الوجهات
        populateDestinations();
        
        showToast('تم مسح البحث', 'info');
    }

    // ============================================================
    // 15. طي/فك التعليمات العامة
    // ============================================================
    function toggleGeneralInfo() {
        const body = DOM.generalBody;
        const btn = DOM.toggleGeneral;
        
        if (body.classList.contains('collapsed')) {
            body.classList.remove('collapsed');
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            body.classList.add('collapsed');
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }

    // ============================================================
    // 16. إعداد زر العودة للأعلى
    // ============================================================
    function setupScrollTop() {
        // يتم التعامل معه في مستمع التمرير
    }

    // ============================================================
    // 17. التحقق من معلمات URL
    // ============================================================
    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const dest = params.get('destination');
        const city = params.get('city');
        const nat = params.get('nationality');
        
        if (dest && travelData.destinations[dest]) {
            DOM.destination.value = dest;
            updateCities();
            
            if (city && travelData.destinations[dest].cities.includes(city)) {
                DOM.city.value = city;
            }
            
            if (nat) {
                // محاولة العثور على الجنسية في القائمة
                const options = DOM.nationality.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === nat || options[i].text.includes(nat)) {
                        DOM.nationality.value = options[i].value;
                        break;
                    }
                }
            }
            
            // تنفيذ البحث تلقائياً
            setTimeout(searchRequirements, 500);
        }
    }

    // ============================================================
    // 18. تصدير الوظائف العامة (للاستخدام في وحدة التحكم)
    // ============================================================
    window.YemeniaTravel = {
        loadData,
        searchRequirements,
        clearSearch,
        travelData: () => travelData,
        refresh: loadData
    };

    // ============================================================
    // 19. تشغيل التطبيق
    // ============================================================
    document.addEventListener('DOMContentLoaded', () => {
        cacheDomElements();
        loadData();
        
        // إضافة أنماط إضافية للتوست
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .toast button {
                background: none;
                border: none;
                cursor: pointer;
                color: #9e9e9e;
                font-size: 1.1rem;
                padding: 4px;
                transition: color 0.3s;
            }
            .toast button:hover {
                color: #424242;
            }
        `;
        document.head.appendChild(style);
    });

})();