// ═══════════════════════════════════════════════════════════════
// Yemenia Airways - Travel Requirements System
// Professional Edition 2026
// ═══════════════════════════════════════════════════════════════

'use strict';

// ─── Configuration ───────────────────────────────────────────
const CONFIG = {
    dataUrl: 'data.json',
    animationDuration: 300,
    scrollOffset: 100,
    toastDuration: 4000
};

// ─── State Management ──────────────────────────────────────────
const State = {
    data: {},
    theme: localStorage.getItem('yemenia-theme') || 'light',
    language: localStorage.getItem('yemenia-lang') || 'ar',
    isLoading: false
};

// ─── DOM Elements ──────────────────────────────────────────────
const DOM = {
    loadingScreen: () => document.getElementById('loadingScreen'),
    nationality: () => document.getElementById('nationality'),
    destination: () => document.getElementById('destination'),
    city: () => document.getElementById('city'),
    searchBtn: () => document.getElementById('searchBtn'),
    resetBtn: () => document.getElementById('resetBtn'),
    results: () => document.getElementById('results'),
    requirementsCard: () => document.getElementById('requirementsCard'),
    generalInstructions: () => document.getElementById('generalInstructions'),
    destinationsGrid: () => document.getElementById('destinationsGrid'),
    resultNationality: () => document.getElementById('resultNationality'),
    resultDestination: () => document.getElementById('resultDestination'),
    resultCity: () => document.getElementById('resultCity'),
    themeToggle: () => document.getElementById('themeToggle'),
    scrollTop: () => document.getElementById('scrollTop'),
    toast: () => document.getElementById('toast'),
    toastMessage: () => document.getElementById('toastMessage'),
    destCount: () => document.getElementById('destCount'),
    cityCount: () => document.getElementById('cityCount')
};

// ─── Utility Functions ─────────────────────────────────────────
const Utils = {
    /**
     * Format text by replacing underscores with spaces
     */
    formatKey: (key) => {
        if (typeof key !== 'string') return key;
        return key.replace(/_/g, ' ');
    },

    /**
     * Create an icon element
     */
    createIcon: (className) => {
        const icon = document.createElement('i');
        icon.className = className;
        return icon;
    },

    /**
     * Debounce function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Smooth scroll to element
     */
    scrollTo: (element, offset = 0) => {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    },

    /**
     * Animate number counting
     */
    animateNumber: (element, target, duration = 1000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
};

// ─── Toast Notification ────────────────────────────────────────
const Toast = {
    show: (message, type = 'info') => {
        const toast = DOM.toast();
        const toastMessage = DOM.toastMessage();

        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.toastDuration);
    }
};

// ─── Data Management ─────────────────────────────────────────────
const DataManager = {
    /**
     * Load travel data from JSON
     */
    async load() {
        try {
            const response = await fetch(CONFIG.dataUrl);
            if (!response.ok) throw new Error('Failed to load data');

            State.data = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            Toast.show('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.', 'error');
            return false;
        }
    },

    /**
     * Get destination data
     */
    getDestination: (name) => State.data.destinations?.[name] || null,

    /**
     * Get all destinations
     */
    getAllDestinations: () => State.data.destinations || {},

    /**
     * Get general requirements
     */
    getGeneralRequirements: () => State.data.general_requirements || {},

    /**
     * Get general note
     */
    getGeneralNote: () => State.data.general_note || ''
};

// ─── UI Components ─────────────────────────────────────────────
const UI = {
    /**
     * Hide loading screen
     */
    hideLoading: () => {
        const loader = DOM.loadingScreen();
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    },

    /**
     * Populate destination dropdown
     */
    populateDestinations: () => {
        const select = DOM.destination();
        const destinations = DataManager.getAllDestinations();

        select.innerHTML = '<option value="" disabled selected>-- اختر الوجهة --</option>';

        Object.keys(destinations).forEach(destination => {
            const option = document.createElement('option');
            option.value = destination;
            option.textContent = destination;
            select.appendChild(option);
        });
    },

    /**
     * Update city dropdown based on destination
     */
    updateCities: (destinationName) => {
        const select = DOM.city();
        const destination = DataManager.getDestination(destinationName);

        select.innerHTML = '<option value="" disabled selected>-- اختر المدينة --</option>';

        if (destination && destination.cities) {
            destination.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            });
        }

        // Reset city selection
        select.value = '';
    },

    /**
     * Render general instructions
     */
    renderGeneralInstructions: () => {
        const container = DOM.generalInstructions();
        const general = DataManager.getGeneralRequirements();

        if (!general) return;

        let html = '';

        // Instructions section
        if (general.instructions && general.instructions.length > 0) {
            html += `
                <div class="info-card">
                    <div class="info-card-header">
                        <div class="info-icon"><i class="fas fa-clipboard-list"></i></div>
                        <h3>${general.title || 'الشروط العامة'}</h3>
                    </div>
                    <div class="info-card-body">
                        <ul class="instruction-list">
                            ${general.instructions.map((instruction, index) => `
                                <li class="instruction-item" style="animation-delay: ${index * 0.05}s">
                                    <span class="instruction-number">${index + 1}</span>
                                    <span class="instruction-text">${instruction}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Baggage section
        if (general.baggage) {
            html += `
                <div class="info-card">
                    <div class="info-card-header">
                        <div class="info-icon"><i class="fas fa-suitcase"></i></div>
                        <h3>معلومات الأمتعة</h3>
                    </div>
                    <div class="info-card-body">
                        <div class="baggage-grid">
                            <div class="baggage-item-card">
                                <div class="baggage-icon"><i class="fas fa-hand-holding"></i></div>
                                <h4>حقيبة اليد</h4>
                                <p>${general.baggage.hand_baggage || 'غير محدد'}</p>
                            </div>
                            <div class="baggage-item-card">
                                <div class="baggage-icon"><i class="fas fa-couch"></i></div>
                                <h4>الدرجة السياحية</h4>
                                <p>${general.baggage.economy || 'غير محدد'}</p>
                            </div>
                            <div class="baggage-item-card">
                                <div class="baggage-icon"><i class="fas fa-crown"></i></div>
                                <h4>درجة رجال الأعمال والأولى</h4>
                                <p>${general.baggage.business_first || 'غير محدد'}</p>
                            </div>
                        </div>
                        ${general.baggage.note ? `
                            <div class="baggage-note">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>${general.baggage.note}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // General note
        if (general.note) {
            html += `
                <div class="info-card warning">
                    <div class="info-card-header">
                        <div class="info-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <h3>تنبيه هام</h3>
                    </div>
                    <div class="info-card-body">
                        <p class="warning-text">${general.note}</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Render destinations grid
     */
    renderDestinations: () => {
        const container = DOM.destinationsGrid();
        const destinations = DataManager.getAllDestinations();

        let html = '';
        Object.entries(destinations).forEach(([name, data], index) => {
            const cityCount = data.cities ? data.cities.length : 0;
            const citiesText = cityCount > 0 ? data.cities.join(' • ') : 'غير محدد';

            html += `
                <div class="destination-card" style="animation-delay: ${index * 0.1}s">
                    <div class="destination-header">
                        <div class="destination-flag">${getFlagEmoji(name)}</div>
                        <h4>${name}</h4>
                    </div>
                    <div class="destination-body">
                        <div class="destination-cities">
                            <i class="fas fa-city"></i>
                            <span>${citiesText}</span>
                        </div>
                        <div class="destination-meta">
                            <span class="meta-badge">
                                <i class="fas fa-building"></i>
                                ${cityCount} ${cityCount === 1 ? 'مدينة' : 'مدن'}
                            </span>
                        </div>
                    </div>
                    <button class="destination-btn" onclick="selectDestination('${name}')">
                        <i class="fas fa-search"></i>
                        عرض المتطلبات
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Render requirements results
     */
    renderRequirements: (nationality, destinationName, cityName) => {
        const destination = DataManager.getDestination(destinationName);
        const card = DOM.requirementsCard();

        if (!destination) {
            Toast.show('لا توجد بيانات لهذه الوجهة', 'error');
            return;
        }

        let html = '';

        // Basic requirements
        if (destination.requirements && destination.requirements.length > 0) {
            html += createSection('المتطلبات الأساسية', 'fa-clipboard-check', destination.requirements);
        }

        // Visa requirements
        if (destination.visa_requirements) {
            html += createVisaSection(destination.visa_requirements);
        }

        // Transit requirements
        if (destination.transit_requirements) {
            html += createTransitSection(destination.transit_requirements);
        }

        // Documents required
        if (destination.documents_required) {
            html += createSection('المستندات المطلوبة', 'fa-file-alt', destination.documents_required);
        }

        // Booking requirements
        if (destination.booking_requirements) {
            html += createSection('متطلبات الحجز', 'fa-ticket-alt', destination.booking_requirements);
        }

        // Syrian nationals
        if (destination.syrian_nationals && nationality === 'سوري') {
            html += createSection('متطلبات الجنسية السورية', 'fa-flag', destination.syrian_nationals, 'special');
        }

        // Foreigners requirements (for Yemen)
        if (destination.foreigners_requirements) {
            html += createForeignersSection(destination.foreigners_requirements);
        }

        // Yemeni passport holders
        if (destination.yemeni_passport_holders && nationality === 'يمني') {
            html += createYemeniSection(destination.yemeni_passport_holders);
        }

        // Umrah dates (for Saudi)
        if (destination.umrah_dates) {
            html += createUmrahSection(destination.umrah_dates);
        }

        // Import regulations
        if (destination.import_regulations) {
            html += createSection('لوائح الاستيراد', 'fa-box-open', destination.import_regulations);
        }

        // Allowed items
        if (destination.allowed_items) {
            html += createAllowedItemsSection(destination.allowed_items, cityName);
        }

        // Excess weight
        if (destination.excess_weight) {
            html += createExcessWeightSection(destination.excess_weight);
        }

        // Special services
        if (destination.special_services) {
            html += createSpecialServicesSection(destination.special_services);
        }

        // Transfer fees (for UAE)
        if (destination.transfer_fees) {
            html += createTransferFeesSection(destination.transfer_fees);
        }

        // Note
        const note = destination.note || DataManager.getGeneralNote();
        if (note) {
            html += `
                <div class="result-note">
                    <div class="note-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="note-content">
                        <h4>ملاحظة هامة</h4>
                        <p>${note}</p>
                    </div>
                </div>
            `;
        }

        card.innerHTML = html;

        // Update results meta
        DOM.resultNationality().textContent = `الجنسية: ${nationality}`;
        DOM.resultDestination().textContent = `الوجهة: ${destinationName}`;
        DOM.resultCity().textContent = `المدينة: ${cityName || destinationName}`;

        // Show results
        DOM.results().style.display = 'block';
        Utils.scrollTo(DOM.results(), CONFIG.scrollOffset);
    }
};

// ─── Helper Functions for Rendering ────────────────────────────

function createSection(title, icon, items, type = 'default') {
    const typeClass = type === 'special' ? 'section-special' : '';
    return `
        <div class="result-section ${typeClass}">
            <div class="section-header-bar">
                <i class="fas ${icon}"></i>
                <h4>${title}</h4>
            </div>
            <ul class="section-list">
                ${items.map(item => `<li><i class="fas fa-check-circle"></i><span>${item}</span></li>`).join('')}
            </ul>
        </div>
    `;
}

function createVisaSection(visaData) {
    let html = `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-passport"></i>
                <h4>متطلبات التأشيرة</h4>
            </div>
    `;

    if (visaData.المعفون) {
        html += `
            <div class="sub-section">
                <h5><i class="fas fa-check"></i> المعفون من التأشيرة المسبقة</h5>
                <ul class="section-list">
                    ${visaData.المعفون.map(item => `<li><i class="fas fa-check-circle"></i><span>${item}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (visaData.يحتاجون_تأشيرة_مسبقة) {
        html += `
            <div class="sub-section">
                <h5><i class="fas fa-times"></i> يحتاجون تأشيرة مسبقة</h5>
                <ul class="section-list">
                    ${visaData.يحتاجون_تأشيرة_مسبقة.map(item => `<li><i class="fas fa-times-circle"></i><span>${item}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (visaData.يحتاجون_فيزا_مسبقة) {
        html += `
            <div class="sub-section">
                <h5><i class="fas fa-times"></i> يحتاجون تأشيرة مسبقة</h5>
                <ul class="section-list">
                    ${visaData.يحتاجون_فيزا_مسبقة.map(item => `<li><i class="fas fa-times-circle"></i><span>${item}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function createTransitSection(transitData) {
    let html = `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-exchange-alt"></i>
                <h4>متطلبات الترانزيت</h4>
            </div>
    `;

    if (Array.isArray(transitData)) {
        html += `
            <ul class="section-list">
                ${transitData.map(item => `<li><i class="fas fa-check-circle"></i><span>${item}</span></li>`).join('')}
            </ul>
        `;
    } else {
        Object.entries(transitData).forEach(([key, items]) => {
            html += `
                <div class="sub-section">
                    <h5><i class="fas fa-route"></i> ${Utils.formatKey(key)}</h5>
                    <ul class="section-list">
                        ${items.map(item => `<li><i class="fas fa-check-circle"></i><span>${item}</span></li>`).join('')}
                    </ul>
                </div>
            `;
        });
    }

    html += '</div>';
    return html;
}

function createForeignersSection(foreignersData) {
    let html = `
        <div class="result-section section-special">
            <div class="section-header-bar">
                <i class="fas fa-user-shield"></i>
                <h4>متطلبات الأجانب لدخول اليمن</h4>
            </div>
    `;

    Object.entries(foreignersData).forEach(([airport, requirements]) => {
        html += `
            <div class="sub-section">
                <h5><i class="fas fa-plane-arrival"></i> مطار ${airport.replace(/_/g, ' ')}</h5>
        `;

        Object.entries(requirements).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                html += `
                    <h6>${Utils.formatKey(key)}</h6>
                    <ul class="section-list">
                        ${value.map(item => `<li><i class="fas fa-check-circle"></i><span>${item}</span></li>`).join('')}
                    </ul>
                `;
            } else {
                html += `<p class="requirement-text"><strong>${Utils.formatKey(key)}:</strong> ${value}</p>`;
            }
        });

        html += '</div>';
    });

    html += '</div>';
    return html;
}

function createYemeniSection(yemeniData) {
    return `
        <div class="result-section section-special">
            <div class="section-header-bar">
                <i class="fas fa-flag"></i>
                <h4>متطلبات حاملي الجوازات اليمنية</h4>
            </div>
            <div class="sub-section">
                <h5><i class="fas fa-file-alt"></i> الوثائق المطلوبة</h5>
                <ul class="section-list">
                    ${yemeniData.required_documents.map(doc => `<li><i class="fas fa-check-circle"></i><span>${doc}</span></li>`).join('')}
                </ul>
            </div>
            ${yemeniData.note ? `
                <div class="sub-note">
                    <i class="fas fa-info-circle"></i>
                    <p>${yemeniData.note}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function createUmrahSection(umrahData) {
    return `
        <div class="result-section section-umrah">
            <div class="section-header-bar">
                <i class="fas fa-kaaba"></i>
                <h4>مواعيد نقل المعتمرين</h4>
            </div>
            <div class="umrah-grid">
                <div class="umrah-item">
                    <div class="umrah-icon"><i class="fas fa-door-open"></i></div>
                    <h5>بداية الدخول</h5>
                    <p>${umrahData.بداية_الدخول || 'غير محدد'}</p>
                </div>
                <div class="umrah-item">
                    <div class="umrah-icon"><i class="fas fa-hourglass-half"></i></div>
                    <h5>آخر موعد للدخول</h5>
                    <p>${umrahData.آخر_موعد_لدخول || 'غير محدد'}</p>
                </div>
                <div class="umrah-item">
                    <div class="umrah-icon"><i class="fas fa-plane-departure"></i></div>
                    <h5>آخر موعد للمغادرة</h5>
                    <p>${umrahData.آخر_موعد_لمغادرة || 'غير محدد'}</p>
                </div>
            </div>
        </div>
    `;
}

function createAllowedItemsSection(allowedItems, cityName) {
    let cityItems = allowedItems[cityName];

    if (!cityItems && typeof allowedItems === 'object') {
        // Try to get first available city data
        const firstCity = Object.keys(allowedItems)[0];
        cityItems = allowedItems[firstCity];
    }

    if (!cityItems || Object.keys(cityItems).length === 0) return '';

    return `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-box"></i>
                <h4>المواد المسموحة</h4>
            </div>
            <div class="items-grid">
                ${Object.entries(cityItems).map(([item, description]) => `
                    <div class="item-card">
                        <div class="item-icon"><i class="fas fa-box-open"></i></div>
                        <h5>${Utils.formatKey(item)}</h5>
                        <p>${description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createExcessWeightSection(excessWeight) {
    return `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-weight-hanging"></i>
                <h4>أسعار الوزن الزائد</h4>
            </div>
            <div class="weight-grid">
                ${Object.entries(excessWeight).map(([to, price]) => `
                    <div class="weight-card">
                        <div class="weight-route">
                            <i class="fas fa-arrow-left"></i>
                            <span>إلى ${to}</span>
                        </div>
                        <div class="weight-price">${price}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createSpecialServicesSection(services) {
    return `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-wheelchair"></i>
                <h4>الخدمات الخاصة</h4>
            </div>
            <div class="services-grid">
                ${Object.entries(services).map(([service, price]) => {
                    if (typeof price === 'object') {
                        return Object.entries(price).map(([subService, subPrice]) => `
                            <div class="service-card">
                                <div class="service-icon"><i class="fas fa-hand-holding-medical"></i></div>
                                <h5>${Utils.formatKey(service)} - ${Utils.formatKey(subService)}</h5>
                                <div class="service-price">${subPrice}</div>
                            </div>
                        `).join('');
                    } else {
                        return `
                            <div class="service-card">
                                <div class="service-icon"><i class="fas fa-hand-holding-medical"></i></div>
                                <h5>${Utils.formatKey(service)}</h5>
                                <div class="service-price">${price}</div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
            <div class="emd-note">
                <i class="fas fa-info-circle"></i>
                <p>يتم إصدار قسيمة EMD للخدمة أعلاه من مكتب المبيعات أثناء الحجز</p>
            </div>
        </div>
    `;
}

function createTransferFeesSection(fees) {
    return `
        <div class="result-section">
            <div class="section-header-bar">
                <i class="fas fa-hand-holding-usd"></i>
                <h4>رسوم خدمة التحويل (مرحبا)</h4>
            </div>
            <div class="fees-grid">
                ${Object.entries(fees).map(([service, fee]) => `
                    <div class="fee-card">
                        <h5>${Utils.formatKey(service)}</h5>
                        <p>${fee}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getFlagEmoji(countryName) {
    const flags = {
        'السعودية': '🇸🇦',
        'الأردن': '🇯🇴',
        'مصر': '🇪🇬',
        'السودان': '🇸🇩',
        'جيبوتي': '🇩🇯',
        'لبنان': '🇱🇧',
        'ماليزيا': '🇲🇾',
        'الهند': '🇮🇳',
        'إثيوبيا': '🇪🇹',
        'اليمن': '🇾🇪',
        'الإمارات': '🇦🇪',
        'الكويت': '🇰🇼'
    };
    return flags[countryName] || '🌍';
}

// ─── Event Handlers ────────────────────────────────────────────

function handleDestinationChange() {
    const destination = DOM.destination().value;
    UI.updateCities(destination);
}

function handleSearch() {
    const nationality = DOM.nationality().value;
    const destination = DOM.destination().value;
    const city = DOM.city().value;

    if (!nationality) {
        Toast.show('يرجى اختيار الجنسية', 'warning');
        DOM.nationality().focus();
        return;
    }

    if (!destination) {
        Toast.show('يرجى اختيار الوجهة', 'warning');
        DOM.destination().focus();
        return;
    }

    UI.renderRequirements(nationality, destination, city);
}

function handleReset() {
    DOM.nationality().value = '';
    DOM.destination().value = '';
    DOM.city().innerHTML = '<option value="" disabled selected>-- اختر المدينة --</option>';
    DOM.results().style.display = 'none';

    // Scroll to search
    Utils.scrollTo(DOM.searchBtn(), CONFIG.scrollOffset);
    Toast.show('تم إعادة تعيين البحث', 'success');
}

function handleThemeToggle() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    State.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('yemenia-theme', State.theme);

    const icon = DOM.themeToggle().querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

function handleScroll() {
    const scrollTop = DOM.scrollTop();
    if (window.pageYOffset > 500) {
        scrollTop.classList.add('show');
    } else {
        scrollTop.classList.remove('show');
    }
}

function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNavClick(e) {
    if (e.target.classList.contains('nav-link')) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
    }
}

// ─── Global Functions ────────────────────────────────────────

window.selectDestination = (destinationName) => {
    DOM.destination().value = destinationName;
    UI.updateCities(destinationName);
    Utils.scrollTo(DOM.searchBtn(), CONFIG.scrollOffset);
    Toast.show(`تم اختيار ${destinationName}. يرجى اختيار الجنسية والمدينة`, 'info');
};

// ─── Initialization ──────────────────────────────────────────────

async function init() {
    // Show loading
    DOM.loadingScreen().style.display = 'flex';

    // Load theme
    if (State.theme === 'dark') {
        document.body.classList.add('dark-theme');
        DOM.themeToggle().querySelector('i').className = 'fas fa-sun';
    }

    // Load data
    const loaded = await DataManager.load();
    if (!loaded) return;

    // Initialize UI
    UI.populateDestinations();
    UI.renderGeneralInstructions();
    UI.renderDestinations();

    // Animate stats
    const destinations = DataManager.getAllDestinations();
    const destCount = Object.keys(destinations).length;
    let cityCount = 0;
    Object.values(destinations).forEach(d => {
        if (d.cities) cityCount += d.cities.length;
    });

    Utils.animateNumber(DOM.destCount(), destCount);
    Utils.animateNumber(DOM.cityCount(), cityCount);

    // Add event listeners
    DOM.destination().addEventListener('change', handleDestinationChange);
    DOM.searchBtn().addEventListener('click', handleSearch);
    DOM.resetBtn().addEventListener('click', handleReset);
    DOM.themeToggle().addEventListener('click', handleThemeToggle);
    DOM.scrollTop().addEventListener('click', handleScrollTop);
    document.querySelector('.main-nav').addEventListener('click', handleNavClick);
    window.addEventListener('scroll', Utils.debounce(handleScroll, 100));

    // Hide loading
    setTimeout(() => {
        UI.hideLoading();
    }, 800);
}

// ─── Start Application ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);