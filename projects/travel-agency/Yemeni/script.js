// بيانات المتطلبات
let travelData = {};

// تحميل البيانات من ملف JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        travelData = await response.json();
        initializePage();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('حدث خطأ في تحميل البيانات');
    }
}

// تهيئة الصفحة
function initializePage() {
    // تعبئة خيارات الوجهات من JSON
    const destinationSelect = document.getElementById('destination');
    destinationSelect.innerHTML = '<option value="">-- اختر الوجهة --</option>';
    
    // أخذ الدول من keys الكائن destinations في JSON
    Object.keys(travelData.destinations).forEach(destination => {
        const option = document.createElement('option');
        option.value = destination;
        option.textContent = destination;
        destinationSelect.appendChild(option);
    });

    // عرض التعليمات العامة
    displayGeneralInstructions();

    // إضافة المستمعين للأحداث
    document.getElementById('destination').addEventListener('change', updateCities);
    document.getElementById('searchBtn').addEventListener('click', searchRequirements);
}

// تحديث قائمة المدن بناءً على الوجهة المختارة
function updateCities() {
    const destination = document.getElementById('destination').value;
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';

    if (destination && travelData.destinations[destination]) {
        // أخذ المدن من الوجهة المختارة في JSON
        travelData.destinations[destination].cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// عرض التعليمات العامة
function displayGeneralInstructions() {
    const generalInstructions = document.getElementById('generalInstructions');
    
    if (travelData.general_requirements) {
        let html = `
            <div class="section">
                <h3>📋 ${travelData.general_requirements.title}</h3>
                <ul>
                    ${travelData.general_requirements.instructions.map(instruction => 
                        `<li>${instruction}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h3>🎒 معلومات الأمتعة</h3>
                <div class="baggage-item">
                    <strong>حقيبة اليد:</strong> ${travelData.general_requirements.baggage.hand_baggage}
                </div>
                <div class="baggage-item">
                    <strong>الدرجة السياحية:</strong> ${travelData.general_requirements.baggage.economy}
                </div>
                <div class="baggage-item">
                    <strong>درجة رجال الأعمال والأولى:</strong> ${travelData.general_requirements.baggage.business_first}
                </div>
                <div class="baggage-item note">
                    <strong>ملاحظة:</strong> ${travelData.general_requirements.baggage.note}
                </div>
            </div>
            
            <div class="note">
                <strong>ملاحظة هامة:</strong>
                <p>${travelData.general_requirements.note}</p>
            </div>
        `;
        
        generalInstructions.innerHTML = html;
    }
}

// البحث عن المتطلبات
function searchRequirements() {
    const nationality = document.getElementById('nationality').value;
    const destination = document.getElementById('destination').value;
    const city = document.getElementById('city').value;

    if (!nationality || !destination) {
        alert('يرجى اختيار الجنسية والوجهة');
        return;
    }

    const destinationData = travelData.destinations[destination];
    
    // إذا لم تكن هناك مدن محددة، استخدم الوجهة كمدينة
    const selectedCity = city || destination;
    
    if (!destinationData) {
        alert('لا توجد بيانات لهذه الوجهة');
        return;
    }

    // عرض النتائج
    document.getElementById('results').style.display = 'block';

    // عرض البيانات حسب الوجهة
    displayDestinationRequirements(destinationData, destination, selectedCity);
    
    // التمرير إلى النتائج
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// عرض متطلبات الوجهة المحددة
function displayDestinationRequirements(destinationData, destinationName, city) {
    let html = '';

    // المتطلبات الأساسية
    if (destinationData.requirements && Array.isArray(destinationData.requirements) && destinationData.requirements.length > 0) {
        html += `
            <div class="section">
                <h3>📋 المتطلبات الأساسية</h3>
                <ul>
                    ${destinationData.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // متطلبات التأشيرة (للأردن)
    if (destinationData.visa_requirements) {
        html += `
            <div class="section">
                <h3>📄 متطلبات التأشيرة</h3>
                <div class="sub-section">
                    <h4>المعفون من التأشيرة المسبقة:</h4>
                    <ul>
                        ${destinationData.visa_requirements.المعفون.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="sub-section">
                    <h4>يحتاجون تأشيرة مسبقة:</h4>
                    <ul>
                        ${destinationData.visa_requirements.يحتاجون_تأشيرة_مسبقة.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    // متطلبات الترانزيت
    if (destinationData.transit_requirements) {
        html += `
            <div class="section">
                <h3>🔄 متطلبات الترانزيت</h3>
                ${Array.isArray(destinationData.transit_requirements) 
                    ? `<ul>${destinationData.transit_requirements.map(req => `<li>${req}</li>`).join('')}</ul>`
                    : Object.entries(destinationData.transit_requirements).map(([key, requirements]) => `
                        <div class="sub-section">
                            <h4>${key.replace(/_/g, ' ')}:</h4>
                            <ul>
                                ${requirements.map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    // المواد المسموحة
    if (destinationData.allowed_items) {
        let cityItems = destinationData.allowed_items[city];
        if (!cityItems && typeof destinationData.allowed_items === 'object') {
            cityItems = destinationData.allowed_items;
        }
        
        if (cityItems && Object.keys(cityItems).length > 0) {
            html += `
                <div class="section">
                    <h3>📦 المواد المسموحة</h3>
                    ${Object.entries(cityItems).map(([item, description]) => `
                        <div class="baggage-item">
                            <strong>${item.replace(/_/g, ' ')}:</strong> ${description}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // أسعار الوزن الزائد
    if (destinationData.excess_weight) {
        html += `
            <div class="section">
                <h3>💵 أسعار الوزن الزائد</h3>
                ${Object.entries(destinationData.excess_weight).map(([to, price]) => `
                    <div class="weight-item">
                        <strong>إلى ${to}:</strong> ${price}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // الخدمات الخاصة
    if (destinationData.special_services) {
        html += `
            <div class="section">
                <h3>♿ الخدمات الخاصة</h3>
                ${Object.entries(destinationData.special_services).map(([service, price]) => {
                    if (typeof price === 'object') {
                        return Object.entries(price).map(([subService, subPrice]) => `
                            <div class="service-item">
                                <strong>${service.replace(/_/g, ' ')} - ${subService.replace(/_/g, ' ')}:</strong> ${subPrice}
                            </div>
                        `).join('');
                    } else {
                        return `<div class="service-item"><strong>${service.replace(/_/g, ' ')}:</strong> ${price}</div>`;
                    }
                }).join('')}
                <div class="note">
                    <strong>ملاحظة:</strong> يتم إصدار قسيمة EMD للخدمة أعلاه من مكتب المبيعات أثناء الحجز
                </div>
            </div>
        `;
    }

    // مواعيد العمرة (للسعودية)
    if (destinationData.umrah_dates) {
        html += `
            <div class="section">
                <h3>🕋 مواعيد نقل المعتمرين</h3>
                <div class="baggage-item">
                    <strong>بداية دخول حاملي تأشيرات العمرة:</strong> ${destinationData.umrah_dates.بداية_الدخول}
                </div>
                <div class="baggage-item">
                    <strong>آخر موعد لدخول حاملي تأشيرة العمرة:</strong> ${destinationData.umrah_dates.آخر_موعد_لدخول}
                </div>
                <div class="baggage-item">
                    <strong>آخر موعد لمغادرة حاملي تأشيرة العمرة:</strong> ${destinationData.umrah_dates.آخر_موعد_لمغادرة}
                </div>
            </div>
        `;
    }

    // المستندات المطلوبة (للهند)
    if (destinationData.documents_required) {
        html += `
            <div class="section">
                <h3>📄 المستندات المطلوبة</h3>
                <ul>
                    ${destinationData.documents_required.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // متطلبات الحجز (للهند)
    if (destinationData.booking_requirements) {
        html += `
            <div class="section">
                <h3>🎫 متطلبات الحجز</h3>
                <ul>
                    ${destinationData.booking_requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // لوائح الاستيراد (لإثيوبيا)
    if (destinationData.import_regulations) {
        html += `
            <div class="section">
                <h3>📦 لوائح الاستيراد</h3>
                <ul>
                    ${destinationData.import_regulations.map(reg => `<li>${reg}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // متطلبات السوريين (للبنان)
    if (destinationData.syrian_nationals) {
        html += `
            <div class="section">
                <h3>🇸🇾 متطلبات الجنسية السورية</h3>
                <ul>
                    ${destinationData.syrian_nationals.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // متطلبات الأجانب (لليمن)
    if (destinationData.foreigners_requirements) {
        html += `
            <div class="section">
                <h3>👤 متطلبات الأجانب لدخول اليمن</h3>
                ${Object.entries(destinationData.foreigners_requirements).map(([airport, requirements]) => `
                    <div class="sub-section">
                        <h4>مطار ${airport}:</h4>
                        ${Object.entries(requirements).map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `
                                    <h5>${key.replace(/_/g, ' ')}:</h5>
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
    }

    // متطلبات حاملي الجوازات اليمنية (لليمن)
    if (destinationData.yemeni_passport_holders) {
        html += `
            <div class="section">
                <h3>🇾🇪 متطلبات حاملي الجوازات اليمنية</h3>
                <div class="sub-section">
                    <h4>الوثائق المطلوبة:</h4>
                    <ul>
                        ${destinationData.yemeni_passport_holders.required_documents.map(doc => `<li>${doc}</li>`).join('')}
                    </ul>
                </div>
                <div class="note">
                    <strong>ملاحظة:</strong> ${destinationData.yemeni_passport_holders.note}
                </div>
            </div>
        `;
    }

    // رسوم التحويل (للإمارات)
    if (destinationData.transfer_fees) {
        html += `
            <div class="section">
                <h3>💸 رسوم خدمة التحويل (مرحبا)</h3>
                ${Object.entries(destinationData.transfer_fees).map(([service, fee]) => `
                    <div class="service-item">
                        <strong>${service.replace(/_/g, ' ')}:</strong> ${fee}
                    </div>
                `).join('')}
            </div>
        `;
    }

    // الملاحظة النهائية
    html += `
        <div class="note">
            <strong>ملاحظة هامة:</strong>
            <p>${destinationData.note || travelData.general_note}</p>
        </div>
    `;

    document.getElementById('results').querySelector('.requirements-card').innerHTML = `
        <h2>متطلبات السفر إلى ${destinationName}${city && city !== destinationName ? ' - ' + city : ''}</h2>
        ${html}
    `;
}

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadData);
