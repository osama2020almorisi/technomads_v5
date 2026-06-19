// ============================================
// TechNomads - Customer App
// Payment Module
// ============================================

const Payment = {
    // State
    currentMethod: 'cash',
    savedCards: [],
    selectedCard: null,
    isLoading: false,

    // ============================================
    // INIT
    // ============================================
    init() {
        this.loadSavedCards();
        this.setupEventListeners();
        this.renderPaymentMethods();
    },

    // ============================================
    // LOAD SAVED CARDS
    // ============================================
    loadSavedCards() {
        const saved = localStorage.getItem('paymentCards');
        if (saved) {
            try {
                this.savedCards = JSON.parse(saved);
            } catch (e) {
                this.savedCards = [];
            }
        } else {
            // Demo data
            this.savedCards = [
                {
                    id: 'card_1',
                    type: 'visa',
                    last4: '4242',
                    expiry: '12/26',
                    name: 'محمد عبدالله',
                    isDefault: true
                },
                {
                    id: 'card_2',
                    type: 'mastercard',
                    last4: '8888',
                    expiry: '09/25',
                    name: 'محمد عبدالله',
                    isDefault: false
                }
            ];
            this.saveCards();
        }
    },

    // ============================================
    // SAVE CARDS
    // ============================================
    saveCards() {
        localStorage.setItem('paymentCards', JSON.stringify(this.savedCards));
    },

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method-option').forEach(el => {
            el.addEventListener('click', function() {
                const method = this.dataset.method;
                Payment.selectMethod(method);
            });
        });

        // Card form submission
        const cardForm = document.getElementById('cardForm');
        if (cardForm) {
            cardForm.addEventListener('submit', function(e) {
                e.preventDefault();
                Payment.addCard(this);
            });
        }

        // Pay button
        const payBtn = document.getElementById('payNowBtn');
        if (payBtn) {
            payBtn.addEventListener('click', function() {
                Payment.processPayment();
            });
        }
    },

    // ============================================
    // RENDER PAYMENT METHODS
    // ============================================
    renderPaymentMethods() {
        const container = document.getElementById('paymentMethods');
        if (!container) return;

        const methods = [
            { id: 'cash', icon: 'fa-money-bill-wave', label: 'الدفع عند الاستلام', description: 'ادفع نقداً عند استلام الطلب' },
            { id: 'card', icon: 'fa-credit-card', label: 'بطاقة ائتمان', description: 'Visa / Mastercard' },
            { id: 'wallet', icon: 'fa-wallet', label: 'المحفظة الرقمية', description: 'رصيدك الحالي: 2,450 ر.ي' }
        ];

        container.innerHTML = methods.map(method => `
            <div class="payment-method-option ${this.currentMethod === method.id ? 'active' : ''}" 
                 data-method="${method.id}" 
                 onclick="Payment.selectMethod('${method.id}')">
                <div class="method-radio">
                    <div class="radio-circle ${this.currentMethod === method.id ? 'checked' : ''}">
                        ${this.currentMethod === method.id ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                </div>
                <div class="method-icon">
                    <i class="fas ${method.icon}"></i>
                </div>
                <div class="method-info">
                    <div class="method-name">${method.label}</div>
                    <div class="method-desc">${method.description}</div>
                </div>
            </div>
        `).join('');

        // Show/hide card form
        const cardForm = document.getElementById('cardFormContainer');
        if (cardForm) {
            cardForm.style.display = this.currentMethod === 'card' ? 'block' : 'none';
        }

        // Show/hide wallet info
        const walletInfo = document.getElementById('walletInfo');
        if (walletInfo) {
            walletInfo.style.display = this.currentMethod === 'wallet' ? 'block' : 'none';
        }

        // Update pay button
        this.updatePayButton();
    },

    // ============================================
    // SELECT METHOD
    // ============================================
    selectMethod(method) {
        this.currentMethod = method;
        this.renderPaymentMethods();
    },

    // ============================================
    // ADD CARD
    // ============================================
    addCard(form) {
        const cardNumber = form.querySelector('#cardNumber')?.value?.replace(/\s/g, '');
        const cardName = form.querySelector('#cardName')?.value;
        const cardExpiry = form.querySelector('#cardExpiry')?.value;
        const cardCvv = form.querySelector('#cardCvv')?.value;

        if (!cardNumber || cardNumber.length < 16) {
            showToast('يرجى إدخال رقم بطاقة صحيح', 'error');
            return;
        }

        if (!cardName) {
            showToast('يرجى إدخال اسم صاحب البطاقة', 'error');
            return;
        }

        if (!cardExpiry || cardExpiry.length < 5) {
            showToast('يرجى إدخال تاريخ انتهاء صحيح', 'error');
            return;
        }

        if (!cardCvv || cardCvv.length < 3) {
            showToast('يرجى إدخال رمز CVV صحيح', 'error');
            return;
        }

        const newCard = {
            id: 'card_' + Date.now(),
            type: this.detectCardType(cardNumber),
            last4: cardNumber.slice(-4),
            expiry: cardExpiry,
            name: cardName,
            isDefault: this.savedCards.length === 0
        };

        this.savedCards.push(newCard);
        this.saveCards();
        this.renderSavedCards();

        showToast('تم إضافة البطاقة بنجاح!', 'success');
        form.reset();
    },

    // ============================================
    // DETECT CARD TYPE
    // ============================================
    detectCardType(number) {
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(number)) return type;
        }
        return 'unknown';
    },

    // ============================================
    // RENDER SAVED CARDS
    // ============================================
    renderSavedCards() {
        const container = document.getElementById('savedCards');
        if (!container) return;

        if (this.savedCards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <p>لا توجد بطاقات محفوظة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedCards.map(card => `
            <div class="saved-card ${card.isDefault ? 'default' : ''}" 
                 onclick="Payment.selectCard('${card.id}')">
                <div class="card-type">
                    <i class="fab fa-cc-${card.type}"></i>
                </div>
                <div class="card-info">
                    <div class="card-number">**** **** **** ${card.last4}</div>
                    <div class="card-expiry">تنتهي: ${card.expiry}</div>
                </div>
                ${card.isDefault ? '<span class="default-badge">افتراضي</span>' : ''}
                <button class="card-delete" onclick="event.stopPropagation(); Payment.deleteCard('${card.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    // ============================================
    // SELECT CARD
    // ============================================
    selectCard(cardId) {
        this.selectedCard = cardId;
        this.savedCards.forEach(c => c.isDefault = c.id === cardId);
        this.saveCards();
        this.renderSavedCards();
    },

    // ============================================
    // DELETE CARD
    // ============================================
    deleteCard(cardId) {
        if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;

        this.savedCards = this.savedCards.filter(c => c.id !== cardId);
        if (this.savedCards.length > 0) {
            this.savedCards[0].isDefault = true;
        }
        this.saveCards();
        this.renderSavedCards();
        showToast('تم حذف البطاقة', 'info');
    },

    // ============================================
    // PROCESS PAYMENT
    // ============================================
    async processPayment() {
        if (this.isLoading) return;

        const amount = this.getAmount();
        if (!amount || amount <= 0) {
            showToast('مبلغ غير صحيح', 'error');
            return;
        }

        this.isLoading = true;
        const btn = document.getElementById('payNowBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
        }

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success
            showToast(`تم الدفع بنجاح! المبلغ: ${amount.toLocaleString()} ر.ي`, 'success');

            // Clear cart or redirect
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);

        } catch (error) {
            showToast('فشل الدفع. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            this.isLoading = false;
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> تأكيد الدفع';
            }
        }
    },

    // ============================================
    // GET AMOUNT
    // ============================================
    getAmount() {
        const el = document.getElementById('paymentAmount');
        if (el) {
            return parseInt(el.textContent.replace(/[^0-9]/g, ''));
        }
        // Fallback: get from URL or localStorage
        const stored = localStorage.getItem('orderAmount');
        return stored ? parseInt(stored) : 2500;
    },

    // ============================================
    // UPDATE PAY BUTTON
    // ============================================
    updatePayButton() {
        const btn = document.getElementById('payNowBtn');
        if (!btn) return;

        const labels = {
            'cash': 'تأكيد الدفع عند الاستلام',
            'card': 'دفع بواسطة البطاقة',
            'wallet': 'دفع من المحفظة'
        };

        btn.textContent = labels[this.currentMethod] || 'تأكيد الدفع';
        btn.innerHTML = `<i class="fas fa-check"></i> ${btn.textContent}`;
    },

    // ============================================
    // FORMAT CARD NUMBER
    // ============================================
    formatCardNumber(value) {
        const cleaned = value.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    },

    // ============================================
    // FORMAT EXPIRY
    // ============================================
    formatExpiry(value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    }
};

// ============================================
// EXPOSE TO GLOBAL
// ============================================
window.Payment = Payment;

// ============================================
// AUTO-INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    Payment.init();
});

// ============================================
// CARD INPUT FORMATTING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Card number formatting
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', function() {
            this.value = Payment.formatCardNumber(this.value);
        });
    }

    // Expiry formatting
    const expiryInput = document.getElementById('cardExpiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            this.value = Payment.formatExpiry(this.value);
        });
    }

    // CVV max length
    const cvvInput = document.getElementById('cardCvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            if (this.value.length > 4) {
                this.value = this.value.slice(0, 4);
            }
        });
    }
});