// نظام إدارة التحاليل الطبية مع البيانات الحقيقية
class AnalysisManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        this.currentView = 'detailed';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredTests = [];
        this.currentDeleteId = null;
        this.currentTestId = null;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupMobileMenu();
        this.setupEventListeners();
        this.setupViewToggle();
        this.loadTests();
        this.updateStats();
        this.updateUserInfo();
        this.loadPatientOptions();
    }

    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('show');
                if (overlay) overlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('show');
                if (overlay) overlay.style.display = 'none';
                document.body.style.overflow = '';
            });
        });
    }

    setupEventListeners() {
        // البحث
        const searchInput = document.getElementById('test-search');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    if (searchClear) searchClear.style.display = 'block';
                } else {
                    if (searchClear) searchClear.style.display = 'none';
                }
                this.filterTests();
            });

            if (searchClear) {
                searchClear.addEventListener('click', () => {
                    searchInput.value = '';
                    searchClear.style.display = 'none';
                    this.filterTests();
                });
            }
        }

        // التصفية
        const typeFilter = document.getElementById('test-type-filter');
        const statusFilter = document.getElementById('status-filter');
        const dateFilter = document.getElementById('date-filter');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterTests());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterTests());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterTests());
        }

        // نموذج التحليل
        const testForm = document.getElementById('testForm');
        if (testForm) {
            testForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTest();
            });
        }

        // تأكيد الحذف
        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteTest());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideTestModal();
                this.hideDeleteModal();
                this.hideResultsModal();
            });
        });

        // تبديل نوع التحليل
        const testTypeSelect = document.getElementById('test-type');
        if (testTypeSelect) {
            testTypeSelect.addEventListener('change', (e) => {
                this.updateTestFields(e.target.value);
            });
        }

        // تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.authManager) {
                    window.authManager.logout();
                } else {
                    localStorage.removeItem('medical_currentUser');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const testsContainer = document.getElementById('tests-container');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                if (testsContainer) {
                    testsContainer.className = `tests-container ${this.currentView}-view`;
                }
                
                this.renderTests();
            });
        });
    }

    loadPatientOptions() {
        const patientSelect = document.getElementById('test-patient');
        if (!patientSelect) return;

        const userPatients = this.patients.filter(patient => 
            patient.createdBy === this.currentUser.id
        );

        patientSelect.innerHTML = '<option value="">اختر المريض</option>' +
            userPatients.map(patient => 
                `<option value="${patient.id}">${patient.name} - ${patient.medicalId}</option>`
            ).join('');

        // تحميل المريض المحدد من sessionStorage إذا كان موجوداً
        const currentPatientId = sessionStorage.getItem('currentPatientId');
        if (currentPatientId && userPatients.find(p => p.id === currentPatientId)) {
            patientSelect.value = currentPatientId;
            sessionStorage.removeItem('currentPatientId'); // تنظيف بعد الاستخدام
        }
    }

    updateTestFields(testType) {
        const fieldsContainer = document.getElementById('test-fields');
        if (!fieldsContainer) return;

        const fields = this.getTestFields(testType);
        fieldsContainer.innerHTML = fields;
    }

    getTestFields(testType) {
        const fields = {
            'سكر الدم': `
                <div class="test-field-group">
                    <h4>قياس السكر في الدم</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="glucose-fasting">السكر الصائم (mg/dL)</label>
                            <input type="number" id="glucose-fasting" min="50" max="500" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="glucose-postprandial">السكر بعد الأكل (mg/dL)</label>
                            <input type="number" id="glucose-postprandial" min="50" max="500" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="hba1c">الهيموجلوبين السكري (%)</label>
                            <input type="number" id="hba1c" min="4" max="15" step="0.1">
                        </div>
                    </div>
                </div>
            `,
            'وظائف الكبد': `
                <div class="test-field-group">
                    <h4>إنزيمات الكبد</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="alt">ALT (SGPT) U/L</label>
                            <input type="number" id="alt" min="0" max="500" step="1">
                        </div>
                        <div class="field-item">
                            <label for="ast">AST (SGOT) U/L</label>
                            <input type="number" id="ast" min="0" max="500" step="1">
                        </div>
                        <div class="field-item">
                            <label for="alp">ALP U/L</label>
                            <input type="number" id="alp" min="0" max="1000" step="1">
                        </div>
                    </div>
                </div>
                <div class="test-field-group">
                    <h4>بروتينات الكبد</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="bilirubin-total">البيليروبين الكلي (mg/dL)</label>
                            <input type="number" id="bilirubin-total" min="0" max="10" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="albumin">الألبومين (g/dL)</label>
                            <input type="number" id="albumin" min="1" max="6" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="total-protein">البروتين الكلي (g/dL)</label>
                            <input type="number" id="total-protein" min="4" max="10" step="0.1">
                        </div>
                    </div>
                </div>
            `,
            'وظائف الكلى': `
                <div class="test-field-group">
                    <h4>وظائف الكلى</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="creatinine">الكرياتينين (mg/dL)</label>
                            <input type="number" id="creatinine" min="0.1" max="10" step="0.01">
                        </div>
                        <div class="field-item">
                            <label for="urea">اليوريا (mg/dL)</label>
                            <input type="number" id="urea" min="5" max="200" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="egfr">معدل الترشيح eGFR (mL/min)</label>
                            <input type="number" id="egfr" min="10" max="200" step="1">
                        </div>
                    </div>
                </div>
            `,
            'تحليل الدم الكامل': `
                <div class="test-field-group">
                    <h4>خلايا الدم</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="wbc">كريات الدم البيضاء (10³/μL)</label>
                            <input type="number" id="wbc" min="1" max="50" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="rbc">كريات الدم الحمراء (10⁶/μL)</label>
                            <input type="number" id="rbc" min="2" max="8" step="0.1">
                        </div>
                        <div class="field-item">
                            <label for="hemoglobin">الهيموجلوبين (g/dL)</label>
                            <input type="number" id="hemoglobin" min="5" max="20" step="0.1">
                        </div>
                    </div>
                </div>
                <div class="test-field-group">
                    <h4>الصفائح الدموية</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="platelets">الصفائح الدموية (10³/μL)</label>
                            <input type="number" id="platelets" min="50" max="800" step="1">
                        </div>
                        <div class="field-item">
                            <label for="hematocrit">الهيماتوكريت (%)</label>
                            <input type="number" id="hematocrit" min="20" max="60" step="0.1">
                        </div>
                    </div>
                </div>
            `,
            'الكوليسترول': `
                <div class="test-field-group">
                    <h4>مستويات الدهون</h4>
                    <div class="field-row">
                        <div class="field-item">
                            <label for="cholesterol-total">الكوليسترول الكلي (mg/dL)</label>
                            <input type="number" id="cholesterol-total" min="100" max="400" step="1">
                        </div>
                        <div class="field-item">
                            <label for="cholesterol-ldl">الكوليسترول الضار LDL (mg/dL)</label>
                            <input type="number" id="cholesterol-ldl" min="50" max="300" step="1">
                        </div>
                        <div class="field-item">
                            <label for="cholesterol-hdl">الكوليسترول النافع HDL (mg/dL)</label>
                            <input type="number" id="cholesterol-hdl" min="20" max="100" step="1">
                        </div>
                        <div class="field-item">
                            <label for="triglycerides">الدهون الثلاثية (mg/dL)</label>
                            <input type="number" id="triglycerides" min="50" max="500" step="1">
                        </div>
                    </div>
                </div>
            `
        };

        return fields[testType] || `
            <div class="test-field-group">
                <h4>بيانات التحليل</h4>
                <div class="field-row">
                    <div class="field-item">
                        <label for="test-value">قيمة التحليل</label>
                        <input type="text" id="test-value" placeholder="أدخل نتيجة التحليل">
                    </div>
                    <div class="field-item">
                        <label for="test-unit">الوحدة</label>
                        <input type="text" id="test-unit" placeholder="أدخل وحدة القياس">
                    </div>
                </div>
            </div>
        `;
    }

    loadTests() {
        // تحميل تحاليل المستخدم الحالي فقط
        this.userTests = this.tests.filter(test => 
            test.createdBy === this.currentUser.id
        );
        this.filterTests();
    }

    filterTests() {
        const searchInput = document.getElementById('test-search');
        const typeFilter = document.getElementById('test-type-filter');
        const statusFilter = document.getElementById('status-filter');
        const dateFilter = document.getElementById('date-filter');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const typeValue = typeFilter ? typeFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        const dateValue = dateFilter ? dateFilter.value : '';

        this.filteredTests = this.userTests.filter(test => {
            const patient = this.patients.find(p => p.id === test.patientId);
            const patientName = patient ? patient.name.toLowerCase() : '';
            
            const matchesSearch = !searchTerm || 
                patientName.includes(searchTerm) ||
                test.testType.toLowerCase().includes(searchTerm);
            
            const matchesType = !typeValue || test.testType === typeValue;
            const matchesStatus = !statusValue || test.status === statusValue;
            const matchesDate = this.matchesDateFilter(test.createdAt, dateValue);
            
            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });

        // الترتيب بالأحدث أولاً
        this.filteredTests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        this.currentPage = 1;
        this.renderTests();
        this.updatePagination();
    }

    matchesDateFilter(testDate, filter) {
        if (!filter || filter === 'all') return true;
        
        const test = new Date(testDate);
        const today = new Date();
        
        switch (filter) {
            case 'today':
                return test.toDateString() === today.toDateString();
            case 'week':
                const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
                return test >= weekAgo;
            case 'month':
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                return test >= monthAgo;
            case 'year':
                const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                return test >= yearAgo;
            default:
                return true;
        }
    }

    renderTests() {
        const container = document.getElementById('tests-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentTests = this.filteredTests.slice(startIndex, endIndex);

        if (currentTests.length === 0) {
            container.innerHTML = this.getEmptyState();
            const paginationFooter = document.querySelector('.pagination-footer');
            if (paginationFooter) paginationFooter.style.display = 'none';
            return;
        }

        if (this.currentView === 'detailed') {
            container.innerHTML = currentTests.map(test => this.createTestItem(test)).join('');
        } else {
            container.innerHTML = currentTests.map(test => this.createTestCard(test)).join('');
        }

        const paginationFooter = document.querySelector('.pagination-footer');
        if (paginationFooter) paginationFooter.style.display = 'flex';
    }

    createTestItem(test) {
        const patient = this.patients.find(p => p.id === test.patientId);
        const testDate = new Date(test.createdAt).toLocaleDateString('ar-EG');
        const testTime = new Date(test.createdAt).toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="test-item ${test.status === 'critical' ? 'high-priority' : test.status === 'warning' ? 'medium-priority' : ''}">
                <div class="test-header">
                    <div class="test-basic-info">
                        <div class="test-icon ${this.getTestIconClass(test.testType)}">
                            <i class="${this.getTestIcon(test.testType)}"></i>
                        </div>
                        <div class="test-main-info">
                            <h4>${test.testType}</h4>
                            <div class="test-patient-info">
                                <strong>${patient ? patient.name : 'مريض محذوف'}</strong>
                                <span> - ${patient ? patient.medicalId : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="test-status ${test.status}">
                        <i class="fas ${this.getStatusIcon(test.status)}"></i>
                        ${this.getStatusText(test.status)}
                    </div>
                </div>
                
                <div class="test-details">
                    <div class="detail-item">
                        <div class="detail-label">التاريخ</div>
                        <div class="detail-value">${testDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">الوقت</div>
                        <div class="detail-value">${testTime}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">المختبر</div>
                        <div class="detail-value">${test.lab || 'غير محدد'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">الحالة</div>
                        <div class="detail-value ${test.status}">${this.getStatusText(test.status)}</div>
                    </div>
                </div>

                ${test.results ? `
                <div class="test-results">
                    <div class="results-summary">
                        <h5>ملخص النتائج:</h5>
                        <p class="summary-text">${test.results.summary || 'لا توجد نتائج'}</p>
                    </div>
                </div>
                ` : ''}

                <div class="test-actions">
                    <button class="btn-primary" onclick="analysisManager.showResults('${test.id}')">
                        <i class="fas fa-chart-line"></i>
                        عرض النتائج
                    </button>
                    <button class="btn-secondary" onclick="analysisManager.editTest('${test.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn-danger" onclick="analysisManager.showDeleteModal('${test.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `;
    }

    createTestCard(test) {
        const patient = this.patients.find(p => p.id === test.patientId);
        const testDate = new Date(test.createdAt).toLocaleDateString('ar-EG');

        return `
            <div class="test-card">
                <div class="test-card-header">
                    <div class="test-card-type">
                        <i class="${this.getTestIcon(test.testType)}"></i>
                        <span>${test.testType}</span>
                    </div>
                    <div class="test-status ${test.status}">
                        ${this.getStatusText(test.status)}
                    </div>
                </div>
                
                <div class="test-card-patient">
                    <strong>${patient ? patient.name : 'مريض محذوف'}</strong>
                    <span>${patient ? patient.medicalId : 'N/A'}</span>
                </div>
                
                <div class="test-card-details">
                    <span>${testDate}</span>
                    <span>${test.lab || 'غير محدد'}</span>
                </div>

                ${test.results ? `
                <div class="test-card-results ${test.status}">
                    <p>${test.results.summary ? test.results.summary.substring(0, 100) + '...' : 'لا توجد نتائج'}</p>
                </div>
                ` : ''}

                <div class="test-card-actions">
                    <button class="btn-primary btn-sm" onclick="analysisManager.showResults('${test.id}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn-secondary btn-sm" onclick="analysisManager.editTest('${test.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-sm" onclick="analysisManager.showDeleteModal('${test.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getTestIcon(testType) {
        const icons = {
            'سكر الدم': 'fas fa-tint',
            'وظائف الكبد': 'fas fa-liver',
            'وظائف الكلى': 'fas fa-kidneys',
            'تحليل الدم الكامل': 'fas fa-vial',
            'الكوليسترول': 'fas fa-chart-pie'
        };
        return icons[testType] || 'fas fa-vial';
    }

    getTestIconClass(testType) {
        const classes = {
            'سكر الدم': 'blood',
            'وظائف الكبد': 'liver',
            'وظائف الكلى': 'kidney',
            'تحليل الدم الكامل': 'blood-full',
            'الكوليسترول': 'cholesterol'
        };
        return classes[testType] || 'blood';
    }

    getStatusIcon(status) {
        const icons = {
            'normal': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'critical': 'fa-exclamation-circle'
        };
        return icons[status] || 'fa-question-circle';
    }

    getStatusText(status) {
        const texts = {
            'normal': 'طبيعي',
            'warning': 'يحتاج مراجعة',
            'critical': 'حرج'
        };
        return texts[status] || 'غير محدد';
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-vial"></i>
                <h3>لا توجد تحاليل مسجلة بعد</h3>
                <p>ابدأ بإضافة أول تحليل للمريض</p>
                <button class="btn-primary" onclick="analysisManager.showTestModal()">إضافة أول تحليل</button>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredTests.length / this.itemsPerPage);
        const currentCount = Math.min(this.itemsPerPage, this.filteredTests.length - ((this.currentPage - 1) * this.itemsPerPage));
        
        const currentCountElem = document.getElementById('current-count');
        const totalCountElem = document.getElementById('total-count');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (currentCountElem) currentCountElem.textContent = currentCount;
        if (totalCountElem) totalCountElem.textContent = this.filteredTests.length;
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.querySelector('.page-numbers');
        if (!pageNumbers) return;
        
        let pagesHtml = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const active = i === this.currentPage ? 'active' : '';
            pagesHtml += `<span class="page-number ${active}" onclick="analysisManager.goToPage(${i})">${i}</span>`;
        }
        
        pageNumbers.innerHTML = pagesHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTests();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTests();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTests.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTests();
            this.updatePagination();
        }
    }

    updateStats() {
        const totalTests = this.userTests.length;
        const normalTests = this.userTests.filter(t => t.status === 'normal').length;
        const warningTests = this.userTests.filter(t => t.status === 'warning').length;
        const criticalTests = this.userTests.filter(t => t.status === 'critical').length;

        const totalCountElem = document.getElementById('total-tests-count');
        const normalCountElem = document.getElementById('normal-tests-count');
        const warningCountElem = document.getElementById('warning-tests-count');
        const criticalCountElem = document.getElementById('critical-tests-count');

        if (totalCountElem) totalCountElem.textContent = totalTests;
        if (normalCountElem) normalCountElem.textContent = normalTests;
        if (warningCountElem) warningCountElem.textContent = warningTests;
        if (criticalCountElem) criticalCountElem.textContent = criticalTests;
    }

    updateUserInfo() {
        const userName = document.getElementById('user-display-name');
        const userSpecialty = document.getElementById('user-specialty');

        if (this.currentUser) {
            const displayName = `د. ${this.currentUser.firstName} ${this.currentUser.lastName}`;
            const specialty = this.getSpecialtyText(this.currentUser.specialty);

            if (userName) userName.textContent = displayName;
            if (userSpecialty) userSpecialty.textContent = specialty;
        }
    }

    getSpecialtyText(specialty) {
        const specialties = {
            'general': 'طب عام',
            'internal': 'باطنية',
            'cardiology': 'قلب',
            'endocrinology': 'غدد صماء',
            'other': 'طبيب'
        };
        return specialties[specialty] || 'طبيب';
    }

    showTestModal(testId = null) {
        const modal = document.getElementById('testModal');
        const title = document.getElementById('test-modal-title');
        const submitText = document.getElementById('submit-btn-text');
        
        if (!modal || !title || !submitText) return;

        if (testId) {
            // وضع التعديل
            title.textContent = 'تعديل التحليل';
            submitText.textContent = 'حفظ التعديلات';
            this.fillTestForm(testId);
        } else {
            // وضع الإضافة
            title.textContent = 'إضافة تحليل جديد';
            submitText.textContent = 'تحليل النتائج';
            this.clearTestForm();
        }
        
        modal.classList.add('show');
    }

    hideTestModal() {
        const modal = document.getElementById('testModal');
        if (modal) modal.classList.remove('show');
    }

    clearTestForm() {
        const form = document.getElementById('testForm');
        if (form) form.reset();
        
        const testId = document.getElementById('test-id');
        if (testId) testId.value = '';
        
        // تعيين التاريخ الحالي
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('test-date');
        if (dateInput) dateInput.value = today;
        
        // تحديث الحقول حسب النوع الافتراضي
        this.updateTestFields('سكر الدم');
    }

    fillTestForm(testId) {
        const test = this.userTests.find(t => t.id === testId);
        if (!test) return;

        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };

        setValue('test-id', test.id);
        setValue('test-patient', test.patientId);
        setValue('test-type', test.testType);
        setValue('test-date', test.testDate || test.createdAt.split('T')[0]);
        setValue('test-lab', test.lab);
        setValue('test-notes', test.notes);

        // تحديث الحقول الخاصة بنوع التحليل
        this.updateTestFields(test.testType);
        
        // ملء الحقول الخاصة (سيتم تطوير هذا أكثر)
        if (test.results) {
            Object.entries(test.results).forEach(([key, value]) => {
                const field = document.getElementById(key);
                if (field) field.value = value;
            });
        }
    }

    saveTest() {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : '';
        };

        const testId = getValue('test-id');
        
        // التحقق من البيانات المطلوبة
        const requiredFields = [
            { id: 'test-patient', name: 'المريض' },
            { id: 'test-type', name: 'نوع التحليل' },
            { id: 'test-date', name: 'تاريخ التحليل' }
        ];
        
        let missingFields = [];
        for (let field of requiredFields) {
            const value = getValue(field.id);
            if (!value) {
                missingFields.push(field.name);
            }
        }
        
        if (missingFields.length > 0) {
            this.showNotification(`يرجى ملء الحقول التالية: ${missingFields.join('، ')}`, 'error');
            return;
        }

        // جمع نتائج التحليل حسب النوع
        const testType = getValue('test-type');
        const results = this.collectTestResults(testType);

        const testData = {
            patientId: getValue('test-patient'),
            testType: testType,
            testDate: getValue('test-date'),
            lab: getValue('test-lab'),
            notes: getValue('test-notes'),
            results: results,
            status: this.analyzeResults(results, testType),
            updatedAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };

        if (testId) {
            // تحديث التحليل الموجود
            const index = this.tests.findIndex(t => t.id === testId);
            if (index !== -1) {
                this.tests[index] = { ...this.tests[index], ...testData };
            }
        } else {
            // إضافة تحليل جديد
            testData.id = 'test_' + Date.now();
            testData.createdAt = new Date().toISOString();
            this.tests.push(testData);
            this.userTests.push(testData);
        }

        localStorage.setItem('medical_tests', JSON.stringify(this.tests));
        this.hideTestModal();
        this.filterTests();
        this.updateStats();
        
        // إظهار النتائج إذا كان تحليل جديد
        if (!testId) {
            this.showResults(testData.id);
        } else {
            this.showNotification('تم تحديث التحليل بنجاح', 'success');
        }
    }

    collectTestResults(testType) {
        const results = {};
        
        // جمع الحقول حسب نوع التحليل
        switch (testType) {
            case 'سكر الدم':
                results.glucoseFasting = document.getElementById('glucose-fasting')?.value;
                results.glucosePostprandial = document.getElementById('glucose-postprandial')?.value;
                results.hba1c = document.getElementById('hba1c')?.value;
                break;
            case 'وظائف الكبد':
                results.alt = document.getElementById('alt')?.value;
                results.ast = document.getElementById('ast')?.value;
                results.alp = document.getElementById('alp')?.value;
                results.bilirubinTotal = document.getElementById('bilirubin-total')?.value;
                results.albumin = document.getElementById('albumin')?.value;
                results.totalProtein = document.getElementById('total-protein')?.value;
                break;
            case 'وظائف الكلى':
                results.creatinine = document.getElementById('creatinine')?.value;
                results.urea = document.getElementById('urea')?.value;
                results.egfr = document.getElementById('egfr')?.value;
                break;
            case 'تحليل الدم الكامل':
                results.wbc = document.getElementById('wbc')?.value;
                results.rbc = document.getElementById('rbc')?.value;
                results.hemoglobin = document.getElementById('hemoglobin')?.value;
                results.platelets = document.getElementById('platelets')?.value;
                results.hematocrit = document.getElementById('hematocrit')?.value;
                break;
            case 'الكوليسترول':
                results.cholesterolTotal = document.getElementById('cholesterol-total')?.value;
                results.cholesterolLdl = document.getElementById('cholesterol-ldl')?.value;
                results.cholesterolHdl = document.getElementById('cholesterol-hdl')?.value;
                results.triglycerides = document.getElementById('triglycerides')?.value;
                break;
        }

        // إضافة ملخص النتائج
        results.summary = this.generateResultsSummary(results, testType);
        
        return results;
    }

    analyzeResults(results, testType) {
        // تحليل مبسط للنتائج (في التطبيق الحقيقي سيكون أكثر تعقيداً)
        let criticalCount = 0;
        let warningCount = 0;

        Object.entries(results).forEach(([key, value]) => {
            if (value && !isNaN(value)) {
                const numValue = parseFloat(value);
                const status = this.evaluateValue(key, numValue, testType);
                if (status === 'critical') criticalCount++;
                if (status === 'warning') warningCount++;
            }
        });

        if (criticalCount > 0) return 'critical';
        if (warningCount > 0) return 'warning';
        return 'normal';
    }

    evaluateValue(parameter, value, testType) {
        // قيم مرجعية مبسطة (في التطبيق الحقيقي ستكون أكثر دقة)
        const ranges = {
            'glucoseFasting': { normal: [70, 100], warning: [100, 126], critical: [126, 500] },
            'hba1c': { normal: [4, 5.7], warning: [5.7, 6.4], critical: [6.4, 15] },
            'creatinine': { normal: [0.6, 1.2], warning: [1.2, 2.0], critical: [2.0, 10] },
            'cholesterolLdl': { normal: [0, 100], warning: [100, 160], critical: [160, 300] }
        };

        const range = ranges[parameter];
        if (!range) return 'normal';

        if (value >= range.critical[0] && value < range.critical[1]) return 'critical';
        if (value >= range.warning[0] && value < range.warning[1]) return 'warning';
        if (value >= range.normal[0] && value < range.normal[1]) return 'normal';
        
        return 'normal';
    }

    generateResultsSummary(results, testType) {
        const summaries = {
            'سكر الدم': `تحليل سكر الدم: ${results.glucoseFasting || 'N/A'} صائم, ${results.glucosePostprandial || 'N/A'} بعد الأكل, الهيموجلوبين السكري ${results.hba1c || 'N/A'}%`,
            'وظائف الكبد': `وظائف الكبد: ALT ${results.alt || 'N/A'}, AST ${results.ast || 'N/A'}, البيليروبين ${results.bilirubinTotal || 'N/A'}`,
            'وظائف الكلى': `وظائف الكلى: كرياتينين ${results.creatinine || 'N/A'}, يوريا ${results.urea || 'N/A'}, eGFR ${results.egfr || 'N/A'}`,
            'تحليل الدم الكامل': `تحليل الدم: هيموجلوبين ${results.hemoglobin || 'N/A'}, كريات بيضاء ${results.wbc || 'N/A'}, صفائح دموية ${results.platelets || 'N/A'}`,
            'الكوليسترول': `الدهون: كوليسترول كلي ${results.cholesterolTotal || 'N/A'}, LDL ${results.cholesterolLdl || 'N/A'}, HDL ${results.cholesterolHdl || 'N/A'}`
        };

        return summaries[testType] || 'تم إجراء التحليل بنجاح';
    }

    editTest(testId) {
        this.showTestModal(testId);
    }

    showDeleteModal(testId) {
        this.currentDeleteId = testId;
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.add('show');
    }

    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('show');
        this.currentDeleteId = null;
    }

    deleteTest() {
        if (!this.currentDeleteId) return;

        const testIndex = this.tests.findIndex(t => t.id === this.currentDeleteId);
        const userTestIndex = this.userTests.findIndex(t => t.id === this.currentDeleteId);
        
        if (testIndex !== -1) {
            this.tests.splice(testIndex, 1);
            localStorage.setItem('medical_tests', JSON.stringify(this.tests));
            
            if (userTestIndex !== -1) {
                this.userTests.splice(userTestIndex, 1);
            }
            
            this.filterTests();
            this.updateStats();
            this.hideDeleteModal();
            
            this.showNotification('تم حذف التحليل بنجاح', 'success');
        }
    }

    showResults(testId) {
        this.currentTestId = testId;
        const test = this.userTests.find(t => t.id === testId);
        if (!test) return;

        const modal = document.getElementById('resultsModal');
        const container = document.getElementById('results-container');
        
        container.innerHTML = this.generateResultsView(test);
        modal.classList.add('show');
    }

    hideResultsModal() {
        const modal = document.getElementById('resultsModal');
        if (modal) modal.classList.remove('show');
        this.currentTestId = null;
    }

    generateResultsView(test) {
        const patient = this.patients.find(p => p.id === test.patientId);
        const testDate = new Date(test.createdAt).toLocaleDateString('ar-EG');

        return `
            <div class="results-container">
                <div class="results-header">
                    <div class="results-patient-info">
                        <div class="results-patient-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="results-patient-details">
                            <h4>${patient ? patient.name : 'مريض محذوف'}</h4>
                            <p>${test.testType} - ${testDate}</p>
                        </div>
                    </div>
                    <div class="test-status ${test.status}">
                        <i class="fas ${this.getStatusIcon(test.status)}"></i>
                        ${this.getStatusText(test.status)}
                    </div>
                </div>

                <div class="results-overview">
                    <div class="overview-card ${test.status}">
                        <div class="overview-icon ${test.status}">
                            <i class="fas ${this.getStatusIcon(test.status)}"></i>
                        </div>
                        <div class="overview-title">الحالة العامة</div>
                        <div class="overview-description">
                            ${this.getStatusDescription(test.status)}
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-vial"></i>
                        </div>
                        <div class="overview-title">نوع التحليل</div>
                        <div class="overview-description">${test.testType}</div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="overview-icon">
                            <i class="fas fa-hospital"></i>
                        </div>
                        <div class="overview-title">المختبر</div>
                        <div class="overview-description">${test.lab || 'غير محدد'}</div>
                    </div>
                </div>

                ${test.results ? `
                <div class="results-details">
                    <h4>النتائج التفصيلية</h4>
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>المعامل</th>
                                <th>القيمة</th>
                                <th>الحالة</th>
                                <th>المدى الطبيعي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(test.results)
                                .filter(([key]) => !['summary'].includes(key))
                                .map(([key, value]) => {
                                    if (!value || key === 'summary') return '';
                                    const status = this.evaluateValue(key, parseFloat(value), test.testType);
                                    return `
                                        <tr>
                                            <td>${this.getParameterName(key)}</td>
                                            <td class="result-value ${status}">${value}</td>
                                            <td>
                                                <span class="result-status ${status}">
                                                    ${this.getStatusText(status)}
                                                </span>
                                            </td>
                                            <td>${this.getNormalRange(key)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="recommendations-section">
                    <h4><i class="fas fa-stethoscope"></i> التوصيات الطبية</h4>
                    <div class="recommendation-category">
                        <div class="category-title">
                            <i class="fas fa-heartbeat"></i>
                            <span>توصيات عامة</span>
                        </div>
                        <div class="recommendation-list">
                            ${this.generateRecommendations(test).map(rec => `
                                <div class="recommendation-item">
                                    <i class="fas fa-check-circle"></i>
                                    <div class="recommendation-text">${rec}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : `
                <div class="empty-state">
                    <i class="fas fa-vial"></i>
                    <h3>لا توجد نتائج للعرض</h3>
                    <p>لم يتم إدخال نتائج لهذا التحليل بعد</p>
                </div>
                `}

                <div class="results-actions">
                    <div class="print-actions">
                        <button class="btn-primary" onclick="window.print()">
                            <i class="fas fa-print"></i>
                            طباعة النتائج
                        </button>
                        <button class="btn-secondary" onclick="analysisManager.hideResultsModal()">
                            <i class="fas fa-times"></i>
                            إغلاق
                        </button>
                    </div>
                    <div class="doctor-signature">
                        <div>د. ${this.currentUser.firstName} ${this.currentUser.lastName}</div>
                        <div>${this.getSpecialtyText(this.currentUser.specialty)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    getParameterName(key) {
        const names = {
            'glucoseFasting': 'السكر الصائم',
            'glucosePostprandial': 'السكر بعد الأكل',
            'hba1c': 'الهيموجلوبين السكري',
            'alt': 'ALT',
            'ast': 'AST',
            'alp': 'ALP',
            'bilirubinTotal': 'البيليروبين الكلي',
            'albumin': 'الألبومين',
            'totalProtein': 'البروتين الكلي',
            'creatinine': 'الكرياتينين',
            'urea': 'اليوريا',
            'egfr': 'معدل الترشيح eGFR',
            'wbc': 'كريات الدم البيضاء',
            'rbc': 'كريات الدم الحمراء',
            'hemoglobin': 'الهيموجلوبين',
            'platelets': 'الصفائح الدموية',
            'hematocrit': 'الهيماتوكريت',
            'cholesterolTotal': 'الكوليسترول الكلي',
            'cholesterolLdl': 'الكوليسترول الضار LDL',
            'cholesterolHdl': 'الكوليسترول النافع HDL',
            'triglycerides': 'الدهون الثلاثية'
        };
        return names[key] || key;
    }

    getNormalRange(key) {
        const ranges = {
            'glucoseFasting': '70 - 100 mg/dL',
            'glucosePostprandial': '< 140 mg/dL',
            'hba1c': '< 5.7%',
            'alt': '7 - 56 U/L',
            'ast': '10 - 40 U/L',
            'alp': '44 - 147 U/L',
            'bilirubinTotal': '0.1 - 1.2 mg/dL',
            'albumin': '3.4 - 5.4 g/dL',
            'totalProtein': '6.0 - 8.3 g/dL',
            'creatinine': '0.6 - 1.2 mg/dL',
            'urea': '7 - 20 mg/dL',
            'egfr': '> 90 mL/min',
            'wbc': '4.5 - 11.0 10³/μL',
            'rbc': '4.2 - 5.9 10⁶/μL',
            'hemoglobin': '12.0 - 16.0 g/dL',
            'platelets': '150 - 450 10³/μL',
            'hematocrit': '36 - 48%',
            'cholesterolTotal': '< 200 mg/dL',
            'cholesterolLdl': '< 100 mg/dL',
            'cholesterolHdl': '> 40 mg/dL',
            'triglycerides': '< 150 mg/dL'
        };
        return ranges[key] || 'غير محدد';
    }

    getStatusDescription(status) {
        const descriptions = {
            'normal': 'جميع النتائج ضمن المعدل الطبيعي',
            'warning': 'بعض النتائج تحتاج مراجعة طبية',
            'critical': 'هناك نتائج حرجة تحتاج تدخل فوري'
        };
        return descriptions[status] || 'حالة غير محددة';
    }

    generateRecommendations(test) {
        const recommendations = [];
        
        if (test.status === 'critical') {
            recommendations.push('يوصى بمراجعة الطبيب المختص في أقرب وقت');
            recommendations.push('المتابعة الدورية كل أسبوع حتى استقرار الحالة');
        } else if (test.status === 'warning') {
            recommendations.push('مراجعة الطبيب خلال الأسبوع القادم');
            recommendations.push('إعادة الفحص بعد شهر لمتابعة التطور');
        } else {
            recommendations.push('مواصلة النظام الصحي الحالي');
            recommendations.push('إعادة الفحص الدوري كل 6 أشهر');
        }

        // توصيات إضافية حسب نوع التحليل
        if (test.testType === 'سكر الدم') {
            recommendations.push('الالتزام بنظام غذائي متوازن');
            recommendations.push('ممارسة الرياضة بانتظام');
        } else if (test.testType === 'الكوليسترول') {
            recommendations.push('تقليل الدهون المشبعة في الغذاء');
            recommendations.push('زيادة النشاط البدني اليومي');
        }

        return recommendations;
    }

    showNotification(message, type = 'info') {
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.analysisManager = new AnalysisManager();
});

// دالة مساعدة لعرض نموذج إضافة تحليل
function showTestModal() {
    if (window.analysisManager) {
        window.analysisManager.showTestModal();
    }
}