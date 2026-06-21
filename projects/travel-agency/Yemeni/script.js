// ========================================
// البيانات الرئيسية
// ========================================
let travelData = {};
let isDataLoaded = false;

// ========================================
// تحميل البيانات من ملف JSON
// ========================================
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('فشل تحميل البيانات');
        travelData = await response.json();
        isDataLoaded = true;
        initializePage();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        document.getElementById('generalInstructions').innerHTML = `
            <div class="note-box" style="background:#f8d7da;border-color:#f5c6cb;">
                <strong style="color:#721c24;">⚠️ حدث خطأ</strong>
                <p style="color:#721c24;">تعذر تحميل البيانات. يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>
            </div>
        `;
    }
}

// ========================================
// تهيئة الصفحة
// ========================================
function initializePage() {
    const destinationSelect = document.getElementById('destination');
    destinationSelect.innerHTML = '<option value="">-- اختر الوجهة --</option>';
    
    // تعبئة الوجهات
    Object.keys(travelData.destinations).forEach(destination => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
        destinationSelect.appendChild(option);
    });

    displayGeneralInstructions();
    
    // مستمعي الأحداث
    document.getElementById('destination').addEventListener('change', updateCities);
    document.getElementById('searchBtn').addEventListener('click', searchRequirements);
    
    // البحث بالضغط على Enter
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchRequirements();
        });
    });
}

// ========================================
// تحديث قائمة المدن
// ========================================
function updateCities() {
    const destination = document.getElementById('destination').value;
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';

    if (destination && travelData.destinations[destination]) {
        travelData.destinations[destination].cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// ========================================
// عرض التعليمات العامة
// ========================================
function displayGeneralInstructions() {
    const container = document.getElementById('generalInstructions');
    const req = travelData.general_requirements;
    
    if (!req) return;

    let html = `
        <div class="section">
            <h3><i class="fas fa-list-ul section-icon"></i> ${req.title}</h3>
            <ul>
                ${req.instructions.map(inst => `<li>${inst}</li>`).join('')}
            </ul>
        </div>
        
        <div class="section">
            <h3><i class="fas fa-suitcase section-icon"></i> معلومات الأمتعة</h3>
            <div class="baggage-item"><strong>👜 حقيبة اليد:</strong> ${req.baggage.hand_baggage}</div>
            <div class="baggage-item"><strong>🎫 الدرجة السياحية:</strong> ${req.baggage.economy}</div>
            <div class="baggage-item"><strong>💎 درجة رجال الأعمال والأولى:</strong> ${req.baggage.business_first}</div>
            <div class="baggage-item note"><strong>⚠️ ملاحظة:</strong> ${req.baggage.note}</div>
        </div>
        
        <div class="note-box">
            <strong>📌 ملاحظة هامة:</strong>
            <p>${req.note}</p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ========================================
// البحث عن المتطلبات (الوظيفة الرئيسية)
// ========================================
function searchRequirements() {
    const nationality = document.getElementById('nationality').value;
    const destination = document.getElementById('destination').value;
    const city = document.getElementById('city').value;

    if (!nationality || !destination) {
        alert('⚠️ يرجى اختيار الجنسية والوجهة');
        return;
    }

    const loading = document.getElementById('loadingIndicator');
    loading.style.display = 'flex';
    document.getElementById('searchBtn').disabled = true;

    // محاكاة تحميل سريع
    setTimeout(() => {
        const destinationData = travelData.destinations[destination];
        const selectedCity = city || destination;
        
        if (!destinationData) {
            alert('❌ لا توجد بيانات لهذه الوجهة');
            loading.style.display = 'none';
            document.getElementById('searchBtn').disabled = false;
            return;
        }

        displayDestinationRequirements(destinationData, destination, selectedCity);
        
        loading.style.display = 'none';
        document.getElementById('searchBtn').disabled = false;
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
}

// ========================================
// عرض متطلبات الوجهة (المطورة بالكامل)
// ========================================
function displayDestinationRequirements(destinationData, destinationName, city) {
    let html = '';

    // ======== العنوان ========
    html += `
        <div class="destination-title">
            <i class="fas fa-map-marker-alt"></i>
            <h2>متطلبات السفر إلى ${destinationName}${city && city !== destinationName ? ` - ${city}` : ''}</h2>
        </div>
    `;

    // ======== المتطلبات الأساسية ========
    if (destinationData.requirements?.length > 0) {
        html += `
            <div class="section">
                <h3><i class="fas fa-check-circle section-icon" style="color:#28a745;"></i> المتطلبات الأساسية</h3>
                <ul>${destinationData.requirements.map(req => `<li>${req}</li>`).join('')}</ul>
            </div>
        `;
    }

    // ======== متطلبات التأشيرة (الأردن) ========
    if (destinationData.visa_requirements) {
        html += `
            <div class="section">
                <h3><i class="fas fa-passport section-icon"></i> متطلبات التأشيرة</h3>
        `;
        
        if (destinationData.visa_requirements.المعفون?.length > 0) {
            html += `
                <div class="sub-section">
                    <h4>✅ المعفون من التأشيرة المسبقة</h4>
                    <ul>${destinationData.visa_requirements.المعفون.map(req => `<li>${req}</li>`).join('')}</ul>
                </div>
            `;
        }
        
        if (destinationData.visa_requirements.يحتاجون_تأشيرة_مسبقة?.length > 0) {
            html += `
                <div class="sub-section">
                    <h4>📌 يحتاجون تأشيرة مسبقة</h4>
                    <ul>${destinationData.visa_requirements.يحتاجون_تأشيرة_مسبقة.map(req => `<li>${req}</li>`).join('')}</ul>
                </div>
            `;
        }
        
        html += `</div>`;
    }

    // ======== متطلبات الترانزيت ========
    if (destinationData.transit_requirements) {
        html += `
            <div class="section">
                <h3><i class="fas fa-exchange-alt section-icon"></i> متطلبات الترانزيت</h3>
        `;
        
        if (Array.isArray(destinationData.transit_requirements)) {
            html += `<ul>${destinationData.transit_requirements.map(req => `<li>${req}</li>`).join('')}</ul>`;
        } else {
            Object.entries(destinationData.transit_requirements).forEach(([key, requirements]) => {
                html += `
                    <div class="sub-section">
                        <h4>${key.replace(/_/g, ' ')}</h4>
                        <ul>${requirements.map(req => `<li>${req}</li>`).join('')}</ul>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
    }

    // ======== المواد المسموحة (الحل المطور) ========
    if (destinationData.allowed_items) {
        let cityItems = destinationData.allowed_items[city] || destinationData.allowed_items;
        
        // إذا كانت cityItems كائن وليست مصفوفة
        if (cityItems && typeof cityItems === 'object' && !Array.isArray(cityItems)) {
            const hasItems = Object.keys(cityItems).length > 0;
            
            if (hasItems) {
                html += `
                    <div class="section">
                        <h3><i class="fas fa-boxes section-icon"></i> المواد المسموحة</h3>
                `;
                
                Object.entries(cityItems).forEach(([item, description]) => {
                    // ====== الحل الأساسي للمشكلة ======
                    let displayText = description;
                    
                    // إذا كانت القيمة مصفوفة، حولها إلى نص
                    if (Array.isArray(displayText)) {
                        displayText = displayText.join('');
                    }
                    
                    // إذا كانت القيمة كائن (في حالة وجود بيانات معقدة)
                    if (typeof displayText === 'object' && displayText !== null) {
                        displayText = JSON.stringify(displayText);
                    }
                    
                    html += `
                        <div class="baggage-item">
                            <strong>${item.replace(/_/g, ' ')}:</strong> ${displayText}
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
        }
    }

    // ======== أسعار الوزن الزائد ========
    if (destinationData.excess_weight) {
        html += `
            <div class="section">
                <h3><i class="fas fa-weight-hanging section-icon"></i> أسعار الوزن الزائد</h3>
                ${Object.entries(destinationData.excess_weight).map(([to, price]) => `
                    <div class="weight-item"><strong>إلى ${to}:</strong> ${price}</div>
                `).join('')}
            </div>
        `;
    }

    // ======== الخدمات الخاصة ========
    if (destinationData.special_services) {
        html += `
            <div class="section">
                <h3><i class="fas fa-wheelchair section-icon"></i> الخدمات الخاصة</h3>
        `;
        
        Object.entries(destinationData.special_services).forEach(([service, price]) => {
            if (typeof price === 'object' && price !== null) {
                Object.entries(price).forEach(([subService, subPrice]) => {
                    html += `
                        <div class="service-item">
                            <strong>${service.replace(/_/g, ' ')} - ${subService.replace(/_/g, ' ')}:</strong> ${subPrice}
                        </div>
                    `;
                });
            } else {
                html += `
                    <div class="service-item">
                        <strong>${service.replace(/_/g, ' ')}:</strong> ${price}
                    </div>
                `;
            }
        });
        
        html += `
                <div class="note-box" style="margin-top:12px;">
                    <strong>📌 ملاحظة:</strong>
                    <p>يتم إصدار قسيمة EMD للخدمة أعلاه من مكتب المبيعات أثناء الحجز</p>
                </div>
            </div>
        `;
    }

    // ======== مواعيد العمرة (السعودية) ========
    if (destinationData.umrah_dates) {
        html += `
            <div class="section">
                <h3><i class="fas fa-kaaba section-icon"></i> مواعيد نقل المعتمرين</h3>
                <div class="baggage-item"><strong>🕋 بداية دخول حاملي تأشيرات العمرة:</strong> ${destinationData.umrah_dates.بداية_الدخول}</div>
                <div class="baggage-item"><strong>📅 آخر موعد لدخول حاملي تأشيرة العمرة:</strong> ${destinationData.umrah_dates.آخر_موعد_لدخول}</div>
                <div class="baggage-item"><strong>📅 آخر موعد لمغادرة حاملي تأشيرة العمرة:</strong> ${destinationData.umrah_dates.آخر_موعد_لمغادرة}</div>
            </div>
        `;
    }

    // ======== المستندات المطلوبة (الهند) ========
    if (destinationData.documents_required?.length > 0) {
        html += `
            <div class="section">
                <h3><i class="fas fa-file-alt section-icon"></i> المستندات المطلوبة</h3>
                <ul>${destinationData.documents_required.map(doc => `<li>${doc}</li>`).join('')}</ul>
            </div>
        `;
    }

    // ======== متطلبات الحجز (الهند) ========
    if (destinationData.booking_requirements?.length > 0) {
        html += `
            <div class="section">
                <h3><i class="fas fa-ticket-alt section-icon"></i> متطلبات الحجز</h3>
                <ul>${destinationData.booking_requirements.map(req => `<li>${req}</li>`).join('')}</ul>
            </div>
        `;
    }

    // ======== لوائح الاستيراد (إثيوبيا) ========
    if (destinationData.import_regulations?.length > 0) {
        html += `
            <div class="section">
                <h3><i class="fas fa-truck-loading section-icon"></i> لوائح الاستيراد</h3>
                <ul>${destinationData.import_regulations.map(reg => `<li>${reg}</li>`).join('')}</ul>
            </div>
        `;
    }

    // ======== متطلبات السوريين (لبنان) ========
    if (destinationData.syrian_nationals?.length > 0) {
        html += `
            <div class="section">
                <h3><i class="fas fa-flag section-icon" style="color:#d4a017;"></i> متطلبات الجنسية السورية</h3>
                <ul>${destinationData.syrian_nationals.map(req => `<li>${req}</li>`).join('')}</ul>
            </div>
        `;
    }

    // ======== متطلبات الأجانب (اليمن) ========
    if (destinationData.foreigners_requirements) {
        html += `
            <div class="section">
                <h3><i class="fas fa-users section-icon"></i> متطلبات الأجانب لدخول اليمن</h3>
        `;
        
        Object.entries(destinationData.foreigners_requirements).forEach(([airport, requirements]) => {
            html += `
                <div class="sub-section">
                    <h4>✈️ مطار ${airport}</h4>
            `;
            
            Object.entries(requirements).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    html += `
                        <h5>${key.replace(/_/g, ' ')}</h5>
                        <ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>
                    `;
                } else {
                    html += `<p><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</p>`;
                }
            });
            
            html += `</div>`;
        });
        
        html += `</div>`;
    }

    // ======== حاملي الجوازات اليمنية (اليمن) ========
    if (destinationData.yemeni_passport_holders) {
        html += `
            <div class="section">
                <h3><i class="fas fa-id-card section-icon"></i> متطلبات حاملي الجوازات اليمنية</h3>
                <div class="sub-section">
                    <h4>📄 الوثائق المطلوبة</h4>
                    <ul>${destinationData.yemeni_passport_holders.required_documents.map(doc => `<li>${doc}</li>`).join('')}</ul>
                </div>
                <div class="note-box">
                    <strong>📌 ملاحظة:</strong>
                    <p>${destinationData.yemeni_passport_holders.note}</p>
                </div>
            </div>
        `;
    }

    // ======== رسوم التحويل (الإمارات) ========
    if (destinationData.transfer_fees) {
        html += `
            <div class="section">
                <h3><i class="fas fa-coins section-icon"></i> رسوم خدمة التحويل (مرحبا)</h3>
                ${Object.entries(destinationData.transfer_fees).map(([service, fee]) => `
                    <div class="service-item"><strong>${service.replace(/_/g, ' ')}:</strong> ${fee}</div>
                `).join('')}
            </div>
        `;
    }

    // ======== الملاحظة النهائية ========
    html += `
        <div class="note-box">
            <strong>⚠️ ملاحظة هامة:</strong>
            <p>${destinationData.note || travelData.general_note || 'يرجى التأكد من جميع المتطلبات قبل السفر'}</p>
        </div>
    `;

    document.getElementById('requirementsCard').innerHTML = html;
}

// ========================================
// تشغيل التطبيق
// ========================================
document.addEventListener('DOMContentLoaded', loadData);