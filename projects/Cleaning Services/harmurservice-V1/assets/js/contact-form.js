/**
 * HarMur Service - Contact Form Script
 * Form validation, submission, and user feedback
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    const config = {
        // API endpoints (to be configured)
        apiEndpoint: 'https://api.harmur-service.com/contact',
        backupEndpoint: 'mailto:harmurservices@gmail.com',
        
        // Form settings
        enableLocalStorage: true,
        enablePhoneValidation: true,
        enableEmailValidation: true,
        enableSpamProtection: true,
        submitTimeout: 10000, // 10 seconds
        
        // Validation settings
        minNameLength: 2,
        maxNameLength: 100,
        phoneRegex: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        
        // Messages
        messages: {
            success: 'Vielen Dank für Ihre Anfrage! Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
            error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
            validation: {
                required: 'Dieses Feld ist erforderlich.',
                email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
                phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
                minLength: 'Muss mindestens {min} Zeichen lang sein.',
                maxLength: 'Darf maximal {max} Zeichen lang sein.',
                service: 'Bitte wählen Sie eine Dienstleistung aus.'
            },
            sending: 'Wird gesendet...',
            sent: 'Nachricht gesendet!'
        },
        
        // Styling classes
        classes: {
            success: 'form-success',
            error: 'form-error',
            warning: 'form-warning',
            loading: 'form-loading',
            valid: 'form-valid',
            invalid: 'form-invalid'
        }
    };
    
    // ============================================
    // GLOBAL VARIABLES
    // ============================================
    
    let contactForm;
    let formFields = {};
    let isSubmitting = false;
    let formDataCache = {};
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        console.log('HarMur Service Contact Form - Initializing...');
        
        // Find all contact forms on the page
        const forms = document.querySelectorAll('form[id*="contact"], form[class*="contact"], .contact-form');
        
        if (forms.length === 0) {
            console.warn('No contact forms found on the page');
            return;
        }
        
        // Initialize each form
        forms.forEach(form => {
            initForm(form);
        });
        
        // Initialize quick contact form if exists
        const quickForm = document.querySelector('.quick-contact-form');
        if (quickForm) {
            initQuickForm(quickForm);
        }
        
        // Initialize auto-save if enabled
        if (config.enableLocalStorage) {
            initAutoSave();
        }
        
        console.log('HarMur Service Contact Form - Ready!');
    }
    
    // ============================================
    // FORM INITIALIZATION
    // ============================================
    
    function initForm(form) {
        contactForm = form;
        
        // Store form fields
        cacheFormFields();
        
        // Add event listeners
        addFormEventListeners();
        
        // Load saved data
        loadSavedData();
        
        // Initialize field validation
        initFieldValidation();
        
        // Initialize character counters
        initCharacterCounters();
        
        // Initialize spam protection
        if (config.enableSpamProtection) {
            initSpamProtection();
        }
        
        // Add custom styling
        addFormStyling();
    }
    
    function initQuickForm(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleQuickFormSubmit(this);
        });
        
        // Add input validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateQuickFormField(this);
            });
        });
    }
    
    // ============================================
    // FORM FIELD MANAGEMENT
    // ============================================
    
    function cacheFormFields() {
        if (!contactForm) return;
        
        formFields = {
            name: contactForm.querySelector('#name, input[name="name"], [name*="name"]'),
            email: contactForm.querySelector('#email, input[name="email"], [name*="email"]'),
            phone: contactForm.querySelector('#phone, input[name="phone"], [name*="phone"]'),
            service: contactForm.querySelector('#service, select[name="service"], [name*="service"]'),
            message: contactForm.querySelector('#message, textarea[name="message"], [name*="message"]'),
            privacy: contactForm.querySelector('#privacy, input[name="privacy"], [name*="privacy"]')
        };
    }
    
    function addFormEventListeners() {
        if (!contactForm) return;
        
        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        Object.values(formFields).forEach(field => {
            if (field) {
                field.addEventListener('input', handleFieldInput);
                field.addEventListener('blur', handleFieldBlur);
                field.addEventListener('focus', handleFieldFocus);
            }
        });
        
        // Service selection change
        if (formFields.service) {
            formFields.service.addEventListener('change', handleServiceChange);
        }
        
        // Privacy checkbox
        if (formFields.privacy) {
            formFields.privacy.addEventListener('change', handlePrivacyChange);
        }
    }
    
    // ============================================
    // VALIDATION FUNCTIONS
    // ============================================
    
    function validateField(field, value) {
        if (!field) return { isValid: true, message: '' };
        
        const fieldName = field.name || field.id;
        const trimmedValue = value.trim();
        
        // Required field validation
        if (field.hasAttribute('required') && !trimmedValue) {
            return {
                isValid: false,
                message: config.messages.validation.required
            };
        }
        
        // Skip further validation if empty (unless required)
        if (!trimmedValue && !field.hasAttribute('required')) {
            return { isValid: true, message: '' };
        }
        
        // Field-specific validation
        switch (fieldName.toLowerCase()) {
            case 'name':
            case 'fullname':
            case 'vorname':
            case 'nachname':
                return validateName(trimmedValue);
                
            case 'email':
            case 'e-mail':
                return validateEmail(trimmedValue);
                
            case 'phone':
            case 'telefon':
            case 'telefonnummer':
                return validatePhone(trimmedValue);
                
            case 'message':
            case 'nachricht':
            case 'bemerkung':
                return validateMessage(trimmedValue);
                
            default:
                return { isValid: true, message: '' };
        }
    }
    
    function validateName(name) {
        if (name.length < config.minNameLength) {
            return {
                isValid: false,
                message: config.messages.validation.minLength.replace('{min}', config.minNameLength)
            };
        }
        
        if (name.length > config.maxNameLength) {
            return {
                isValid: false,
                message: config.messages.validation.maxLength.replace('{max}', config.maxNameLength)
            };
        }
        
        // Check for valid name format (allowing German special characters)
        const nameRegex = /^[a-zA-ZäöüÄÖÜß\s\-']+$/;
        if (!nameRegex.test(name)) {
            return {
                isValid: false,
                message: 'Bitte geben Sie einen gültigen Namen ein.'
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    function validateEmail(email) {
        if (!config.emailRegex.test(email)) {
            return {
                isValid: false,
                message: config.messages.validation.email
            };
        }
        
        // Additional email validation
        const domain = email.split('@')[1];
        const domainParts = domain.split('.');
        
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
            return {
                isValid: false,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse mit Domain ein.'
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    function validatePhone(phone) {
        if (!config.enablePhoneValidation) {
            return { isValid: true, message: '' };
        }
        
        // Clean phone number (remove spaces, dashes, parentheses)
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        
        if (!config.phoneRegex.test(cleanPhone)) {
            return {
                isValid: false,
                message: config.messages.validation.phone
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    function validateMessage(message) {
        if (message.length < 10) {
            return {
                isValid: false,
                message: 'Bitte geben Sie eine ausführlichere Nachricht ein (mindestens 10 Zeichen).'
            };
        }
        
        if (message.length > 2000) {
            return {
                isValid: false,
                message: 'Die Nachricht darf maximal 2000 Zeichen lang sein.'
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    function validateService(service) {
        if (!service || service === '') {
            return {
                isValid: false,
                message: config.messages.validation.service
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    function validatePrivacy(privacy) {
        if (privacy && !privacy.checked) {
            return {
                isValid: false,
                message: 'Bitte akzeptieren Sie die Datenschutzerklärung.'
            };
        }
        
        return { isValid: true, message: '' };
    }
    
    // ============================================
    // FORM SUBMISSION HANDLING
    // ============================================
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (isSubmitting) {
            showMessage('Bitte warten Sie, während Ihre vorherige Anfrage verarbeitet wird.', 'warning');
            return;
        }
        
        // Validate all fields
        const isValid = validateAllFields();
        
        if (!isValid) {
            showMessage('Bitte korrigieren Sie die markierten Felder.', 'error');
            scrollToFirstError();
            return;
        }
        
        // Start submission
        isSubmitting = true;
        setFormState('submitting');
        
        try {
            // Prepare form data
            const formData = getFormData();
            
            // Show sending state
            showMessage(config.messages.sending, 'info');
            
            // Submit form (choose method based on configuration)
            const result = await submitForm(formData);
            
            if (result.success) {
                // Success
                handleSubmissionSuccess(formData);
            } else {
                // API error, try fallback
                const fallbackResult = await submitFallback(formData);
                
                if (fallbackResult.success) {
                    handleSubmissionSuccess(formData);
                } else {
                    throw new Error(fallbackResult.error || 'Submission failed');
                }
            }
            
        } catch (error) {
            handleSubmissionError(error);
        } finally {
            isSubmitting = false;
            setFormState('idle');
        }
    }
    
    async function handleQuickFormSubmit(form) {
        const name = form.querySelector('input[type="text"]');
        const email = form.querySelector('input[type="email"]');
        const message = form.querySelector('textarea');
        
        // Basic validation
        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
            showQuickFormMessage('Bitte füllen Sie alle Felder aus.', 'error');
            return;
        }
        
        if (!config.emailRegex.test(email.value)) {
            showQuickFormMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }
        
        // Prepare data
        const formData = {
            name: name.value.trim(),
            email: email.value.trim(),
            message: message.value.trim(),
            source: 'quick_contact',
            timestamp: new Date().toISOString()
        };
        
        // Show sending state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = config.messages.sending;
        submitBtn.disabled = true;
        
        try {
            // Send quick form data
            await submitQuickForm(formData);
            
            // Success
            showQuickFormMessage(config.messages.sent, 'success');
            form.reset();
            
        } catch (error) {
            showQuickFormMessage('Fehler beim Senden. Bitte versuchen Sie es später erneut.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // ============================================
    // FORM SUBMISSION METHODS
    // ============================================
    
    async function submitForm(formData) {
        // For now, we'll use a simulated API call
        // In production, replace with actual API endpoint
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful submission 95% of the time
                if (Math.random() > 0.05) {
                    resolve({
                        success: true,
                        messageId: 'FORM-' + Date.now(),
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error('API error: Simulation failed'));
                }
            }, 1500);
        });
    }
    
    async function submitFallback(formData) {
        // Fallback method using mailto for emergency
        const subject = encodeURIComponent(`Anfrage von ${formData.name}`);
        const body = encodeURIComponent(`
Name: ${formData.name}
E-Mail: ${formData.email}
Telefon: ${formData.phone}
Dienstleistung: ${formData.service}
Nachricht: ${formData.message}
            
Gesendet am: ${new Date().toLocaleString('de-DE')}
        `);
        
        const mailtoLink = `${config.backupEndpoint}?subject=${subject}&body=${body}`;
        
        // Try to open mail client
        try {
            window.open(mailtoLink, '_blank');
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: 'Could not open email client' 
            };
        }
    }
    
    async function submitQuickForm(formData) {
        // Quick form submission (simplified)
        console.log('Quick form submission:', formData);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
    
    // ============================================
    // SUBMISSION HANDLERS
    // ============================================
    
    function handleSubmissionSuccess(formData) {
        // Show success message
        showMessage(config.messages.success, 'success');
        
        // Reset form
        contactForm.reset();
        
        // Clear saved data
        clearSavedData();
        
        // Send confirmation email (simulated)
        sendConfirmationEmail(formData);
        
        // Track conversion
        trackConversion(formData);
        
        // Add success animation
        addSuccessAnimation();
        
        // Reset form state after delay
        setTimeout(() => {
            setFormState('idle');
            hideMessage();
        }, 5000);
    }
    
    function handleSubmissionError(error) {
        console.error('Form submission error:', error);
        
        // Show error message
        showMessage(config.messages.error, 'error');
        
        // Enable form for retry
        enableForm();
        
        // Log error for monitoring
        logError(error);
    }
    
    // ============================================
    // FORM STATE MANAGEMENT
    // ============================================
    
    function setFormState(state) {
        if (!contactForm) return;
        
        contactForm.classList.remove(
            config.classes.loading,
            config.classes.success,
            config.classes.error
        );
        
        switch (state) {
            case 'submitting':
                contactForm.classList.add(config.classes.loading);
                disableForm();
                break;
                
            case 'success':
                contactForm.classList.add(config.classes.success);
                disableForm();
                break;
                
            case 'error':
                contactForm.classList.add(config.classes.error);
                enableForm();
                break;
                
            case 'idle':
                enableForm();
                break;
        }
    }
    
    function disableForm() {
        if (!contactForm) return;
        
        const inputs = contactForm.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = true;
        });
    }
    
    function enableForm() {
        if (!contactForm) return;
        
        const inputs = contactForm.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }
    
    // ============================================
    // VALIDATION HELPERS
    // ============================================
    
    function validateAllFields() {
        let isValid = true;
        
        // Validate each field
        Object.entries(formFields).forEach(([key, field]) => {
            if (field) {
                const value = field.value || (field.checked !== undefined ? field.checked : '');
                const validation = validateField(field, value);
                
                if (!validation.isValid) {
                    showFieldError(field, validation.message);
                    isValid = false;
                } else {
                    clearFieldError(field);
                }
            }
        });
        
        // Special validation for service
        if (formFields.service) {
            const serviceValidation = validateService(formFields.service.value);
            if (!serviceValidation.isValid) {
                showFieldError(formFields.service, serviceValidation.message);
                isValid = false;
            }
        }
        
        // Special validation for privacy
        if (formFields.privacy) {
            const privacyValidation = validatePrivacy(formFields.privacy);
            if (!privacyValidation.isValid) {
                showFieldError(formFields.privacy, privacyValidation.message);
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function initFieldValidation() {
        Object.values(formFields).forEach(field => {
            if (field) {
                field.addEventListener('input', function() {
                    const validation = validateField(this, this.value);
                    
                    if (validation.isValid) {
                        markFieldValid(this);
                    } else {
                        markFieldInvalid(this);
                    }
                });
            }
        });
    }
    
    function validateQuickFormField(field) {
        const value = field.value.trim();
        
        if (!value) {
            field.classList.add('invalid');
            return false;
        }
        
        if (field.type === 'email' && !config.emailRegex.test(value)) {
            field.classList.add('invalid');
            return false;
        }
        
        field.classList.remove('invalid');
        field.classList.add('valid');
        return true;
    }
    
    // ============================================
    // ERROR DISPLAY
    // ============================================
    
    function showFieldError(field, message) {
        // Remove any existing error
        clearFieldError(field);
        
        // Add error class
        field.classList.add(config.classes.invalid);
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        
        // Insert after field
        field.parentNode.appendChild(errorElement);
        
        // Store reference
        field.errorElement = errorElement;
    }
    
    function clearFieldError(field) {
        field.classList.remove(config.classes.invalid);
        
        if (field.errorElement) {
            field.errorElement.remove();
            field.errorElement = null;
        }
    }
    
    function markFieldValid(field) {
        field.classList.remove(config.classes.invalid);
        field.classList.add(config.classes.valid);
        clearFieldError(field);
    }
    
    function markFieldInvalid(field) {
        field.classList.remove(config.classes.valid);
        field.classList.add(config.classes.invalid);
    }
    
    function scrollToFirstError() {
        const firstError = contactForm.querySelector(`.${config.classes.invalid}`);
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Focus the field
            firstError.focus();
        }
    }
    
    // ============================================
    // MESSAGE DISPLAY
    // ============================================
    
    function showMessage(message, type = 'info') {
        // Remove existing message
        hideMessage();
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            animation: fadeIn 0.3s ease;
        `;
        
        // Style based on type
        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#d4edda';
                messageElement.style.color = '#155724';
                messageElement.style.border = '1px solid #c3e6cb';
                break;
                
            case 'error':
                messageElement.style.backgroundColor = '#f8d7da';
                messageElement.style.color = '#721c24';
                messageElement.style.border = '1px solid #f5c6cb';
                break;
                
            case 'warning':
                messageElement.style.backgroundColor = '#fff3cd';
                messageElement.style.color = '#856404';
                messageElement.style.border = '1px solid #ffeaa7';
                break;
                
            case 'info':
                messageElement.style.backgroundColor = '#d1ecf1';
                messageElement.style.color = '#0c5460';
                messageElement.style.border = '1px solid #bee5eb';
                break;
        }
        
        // Insert message
        if (contactForm) {
            contactForm.insertBefore(messageElement, contactForm.firstChild);
        }
        
        // Store reference
        if (contactForm) {
            contactForm.messageElement = messageElement;
        }
    }
    
    function hideMessage() {
        if (contactForm && contactForm.messageElement) {
            contactForm.messageElement.remove();
            contactForm.messageElement = null;
        }
    }
    
    function showQuickFormMessage(message, type) {
        const form = document.querySelector('.quick-contact-form');
        if (!form) return;
        
        // Remove existing message
        const existingMessage = form.querySelector('.quick-form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `quick-form-message quick-form-message-${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 0.75rem;
            margin: 1rem 0;
            border-radius: 6px;
            font-size: 0.9rem;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // Style
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
        } else {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
        }
        
        // Insert before submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        form.insertBefore(messageElement, submitBtn);
        
        // Auto-hide after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }
    
    // ============================================
    // AUTO-SAVE FUNCTIONALITY
    // ============================================
    
    function initAutoSave() {
        if (!config.enableLocalStorage) return;
        
        Object.values(formFields).forEach(field => {
            if (field) {
                field.addEventListener('input', debounce(saveFormData, 1000));
            }
        });
    }
    
    function saveFormData() {
        if (!contactForm) return;
        
        const data = getFormData();
        localStorage.setItem('harmur_contact_form', JSON.stringify(data));
        localStorage.setItem('harmur_contact_form_timestamp', Date.now());
    }
    
    function loadSavedData() {
        if (!contactForm || !config.enableLocalStorage) return;
        
        const savedData = localStorage.getItem('harmur_contact_form');
        const timestamp = localStorage.getItem('harmur_contact_form_timestamp');
        
        if (savedData && timestamp) {
            const data = JSON.parse(savedData);
            const age = Date.now() - parseInt(timestamp);
            
            // Only load data less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                Object.entries(formFields).forEach(([key, field]) => {
                    if (field && data[key]) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key];
                        } else {
                            field.value = data[key];
                        }
                    }
                });
                
                // Show restore notification
                showMessage('Gespeicherte Eingaben wurden wiederhergestellt.', 'info');
                setTimeout(hideMessage, 3000);
            } else {
                // Clear old data
                clearSavedData();
            }
        }
    }
    
    function clearSavedData() {
        localStorage.removeItem('harmur_contact_form');
        localStorage.removeItem('harmur_contact_form_timestamp');
    }
    
    // ============================================
    // SPAM PROTECTION
    // ============================================
    
    function initSpamProtection() {
        // Honeypot field
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.cssText = `
            position: absolute;
            left: -9999px;
            opacity: 0;
            height: 0;
            width: 0;
        `;
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.setAttribute('tabindex', '-1');
        
        if (contactForm) {
            contactForm.appendChild(honeypot);
            
            // Add event listener for honeypot
            honeypot.addEventListener('input', function() {
                this.value = ''; // Clear if somehow filled
            });
            
            // Check honeypot on submit
            contactForm.addEventListener('submit', function(e) {
                if (honeypot.value) {
                    e.preventDefault();
                    console.log('Spam detected via honeypot');
                    return false;
                }
            });
        }
        
        // Time-based spam prevention
        let formStartTime = Date.now();
        
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                const formFillTime = Date.now() - formStartTime;
                
                // If form was filled too quickly (less than 2 seconds), might be spam
                if (formFillTime < 2000) {
                    console.log('Potential spam: Form filled too quickly');
                    // You could add additional verification here
                }
            });
            
            // Reset timer on form reset
            contactForm.addEventListener('reset', function() {
                formStartTime = Date.now();
            });
        }
    }
    
    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    function handleFieldInput(e) {
        const field = e.target;
        const validation = validateField(field, field.value);
        
        if (validation.isValid) {
            markFieldValid(field);
        } else {
            markFieldInvalid(field);
        }
    }
    
    function handleFieldBlur(e) {
        const field = e.target;
        const validation = validateField(field, field.value);
        
        if (!validation.isValid) {
            showFieldError(field, validation.message);
        }
    }
    
    function handleFieldFocus(e) {
        const field = e.target;
        clearFieldError(field);
    }
    
    function handleServiceChange(e) {
        const selectedService = e.target.value;
        
        // You could add dynamic behavior based on service selection
        if (selectedService === 'other') {
            showMessage('Bitte beschreiben Sie im Nachrichtenfeld, welche Dienstleistung Sie benötigen.', 'info');
        } else {
            hideMessage();
        }
    }
    
    function handlePrivacyChange(e) {
        const isChecked = e.target.checked;
        
        if (isChecked) {
            clearFieldError(e.target);
        }
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    function getFormData() {
        const data = {};
        
        Object.entries(formFields).forEach(([key, field]) => {
            if (field) {
                if (field.type === 'checkbox') {
                    data[key] = field.checked;
                } else {
                    data[key] = field.value || '';
                }
            }
        });
        
        data.timestamp = new Date().toISOString();
        data.source = window.location.href;
        
        return data;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ============================================
    // ADDITIONAL FEATURES
    // ============================================
    
    function initCharacterCounters() {
        const textareas = contactForm?.querySelectorAll('textarea[maxlength]');
        
        if (textareas) {
            textareas.forEach(textarea => {
                const maxLength = textarea.getAttribute('maxlength');
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.style.cssText = `
                    font-size: 0.75rem;
                    color: #6c757d;
                    text-align: right;
                    margin-top: 0.25rem;
                `;
                
                textarea.parentNode.appendChild(counter);
                
                function updateCounter() {
                    const length = textarea.value.length;
                    counter.textContent = `${length}/${maxLength}`;
                    
                    if (length > maxLength * 0.9) {
                        counter.style.color = '#dc3545';
                    } else if (length > maxLength * 0.75) {
                        counter.style.color = '#ffc107';
                    } else {
                        counter.style.color = '#6c757d';
                    }
                }
                
                textarea.addEventListener('input', updateCounter);
                updateCounter(); // Initial update
            });
        }
    }
    
    function addFormStyling() {
        // Add CSS for form states
        const styles = `
            .${config.classes.valid} {
                border-color: #28a745 !important;
                background-color: rgba(40, 167, 69, 0.05) !important;
            }
            
            .${config.classes.invalid} {
                border-color: #dc3545 !important;
                background-color: rgba(220, 53, 69, 0.05) !important;
            }
            
            .${config.classes.loading} {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .field-error {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .success-animation {
                animation: successPulse 0.5s ease;
            }
            
            @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    function addSuccessAnimation() {
        if (!contactForm) return;
        
        contactForm.classList.add('success-animation');
        
        setTimeout(() => {
            contactForm.classList.remove('success-animation');
        }, 500);
    }
    
    function sendConfirmationEmail(formData) {
        // This would integrate with your email service
        console.log('Confirmation email would be sent for:', formData.email);
        
        // Example using EmailJS or similar service
        // emailjs.send('service_id', 'template_id', formData, 'user_id')
    }
    
    function trackConversion(formData) {
        // Track conversion in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                'value': 1.0,
                'currency': 'EUR',
                'transaction_id': formData.timestamp
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Contact Form Submission'
            });
        }
    }
    
    function logError(error) {
        // Log errors to your monitoring service
        console.error('Contact Form Error:', error);
        
        // Example: Send to error tracking service
        // if (typeof Sentry !== 'undefined') {
        //     Sentry.captureException(error);
        // }
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    window.HarMurContactForm = {
        // Submit form programmatically
        submit: function() {
            if (contactForm) {
                contactForm.dispatchEvent(new Event('submit'));
            }
        },
        
        // Reset form
        reset: function() {
            if (contactForm) {
                contactForm.reset();
                clearSavedData();
                hideMessage();
                
                // Clear all field errors
                Object.values(formFields).forEach(field => {
                    if (field) clearFieldError(field);
                });
            }
        },
        
        // Validate form
        validate: function() {
            return validateAllFields();
        },
        
        // Get form data
        getData: function() {
            return getFormData();
        },
        
        // Set form data
        setData: function(data) {
            Object.entries(data).forEach(([key, value]) => {
                if (formFields[key]) {
                    formFields[key].value = value;
                }
            });
        },
        
        // Show message
        showMessage: showMessage,
        
        // Hide message
        hideMessage: hideMessage
    };
    
    // ============================================
    // INITIALIZE ON LOAD
    // ============================================
    
    try {
        init();
    } catch (error) {
        console.error('Failed to initialize contact form:', error);
        
        // Fallback: Show basic form functionality
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert(config.messages.success);
                this.reset();
            });
        }
    }
    
});

// ============================================
// GLOBAL FORM HANDLING (for multiple forms)
// ============================================

// Handle form submissions from any form with class 'harmur-form'
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('harmur-form') || 
        e.target.id.includes('contact')) {
        // Let the main script handle it
        return;
    }
    
    // Handle other forms with basic validation
    const form = e.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('invalid');
            
            // Add error message
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = 'Dieses Feld ist erforderlich.';
            error.style.cssText = 'color: red; font-size: 0.875rem; margin-top: 0.25rem;';
            
            field.parentNode.appendChild(error);
        }
    });
    
    if (!isValid) {
        e.preventDefault();
    }
});