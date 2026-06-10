// Settings management functions

// Load settings page
function loadSettings() {
    const settings = getSettings();
    
    // تعبئة النموذج بالإعدادات الحالية
    document.getElementById('companyName').value = settings.company_name || 'شركتي';
    document.getElementById('companyTaxNumber').value = settings.company_tax_number || '';
    document.getElementById('companyAddress').value = settings.company_address || '';
    document.getElementById('companyPhone').value = settings.company_phone || '';
    document.getElementById('defaultTaxRate').value = settings.tax_rate || 15;
    document.getElementById('currency').value = settings.currency || 'ريال';
    document.getElementById('language').value = settings.language || 'ar';
}

// Save settings
function saveSettingsForm(event) {
    event.preventDefault();
    
    const settings = {
        company_name: document.getElementById('companyName').value,
        company_tax_number: document.getElementById('companyTaxNumber').value,
        company_address: document.getElementById('companyAddress').value,
        company_phone: document.getElementById('companyPhone').value,
        tax_rate: parseFloat(document.getElementById('defaultTaxRate').value) || 15,
        currency: document.getElementById('currency').value,
        language: document.getElementById('language').value
    };
    
    saveSettings(settings);
    showAlert('success', 'تم حفظ الإعدادات بنجاح');
}

// Reset to default settings
function resetSettings() {
    if (confirm('هل تريد استعادة الإعدادات الافتراضية؟')) {
        const defaultSettings = {
            company_name: 'شركتي',
            company_tax_number: '',
            company_address: '',
            company_phone: '',
            tax_rate: 15,
            currency: 'ريال',
            language: 'ar',
            company_logo: ''
        };
        
        saveSettings(defaultSettings);
        loadSettings();
        showAlert('success', 'تم استعادة الإعدادات الافتراضية');
    }
}

// Initialize settings page
function initSettingsPage() {
    loadSettings();
    
    // إضافة event listeners
    document.getElementById('settingsForm').addEventListener('submit', saveSettingsForm);
    document.getElementById('resetBtn').addEventListener('click', resetSettings);
}