// نظام إدارة المرضى المحسن مع البيانات الحقيقية
class PatientsManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filteredPatients = [];
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupMobileMenu();
        this.setupEventListeners();
        this.setupViewToggle();
        this.loadPatients();
        this.updateStats();
        this.updateUserInfo();
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

        // إغلاق القائمة عند النقر على رابط
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
        const searchInput = document.getElementById('patient-search');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    if (searchClear) searchClear.style.display = 'block';
                } else {
                    if (searchClear) searchClear.style.display = 'none';
                }
                this.filterPatients();
            });

            if (searchClear) {
                searchClear.addEventListener('click', () => {
                    searchInput.value = '';
                    searchClear.style.display = 'none';
                    this.filterPatients();
                });
            }
        }

        // التصفية
        const genderFilter = document.getElementById('gender-filter');
        const sortBy = document.getElementById('sort-by');

        if (genderFilter) {
            genderFilter.addEventListener('change', () => this.filterPatients());
        }

        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterPatients());
        }

        // التصدير
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPatients());
        }

        // التصفح
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // نموذج المريض
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePatient();
            });
        }

        // تأكيد الحذف
        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deletePatient());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hidePatientModal();
                this.hideDeleteModal();
            });
        });

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

        // تبديل اللغة
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const currentLang = document.documentElement.lang;
                if (currentLang === 'ar') {
                    this.switchToEnglish();
                } else {
                    this.switchToArabic();
                }
            });
        }
    }

    switchToEnglish() {
        if (window.languageManager) {
            window.languageManager.switchLanguage('en');
        }
    }

    switchToArabic() {
        if (window.languageManager) {
            window.languageManager.switchLanguage('ar');
        }
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

    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const patientsContainer = document.getElementById('patients-container');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                if (patientsContainer) {
                    patientsContainer.className = `patients-container ${this.currentView}-view`;
                }
                
                this.renderPatients();
            });
        });
    }

    loadPatients() {
        // تحميل المرضى الخاصة بالمستخدم الحالي فقط
        this.userPatients = this.patients.filter(patient => 
            patient.createdBy === this.currentUser?.id
        );
        this.filterPatients();
    }

    filterPatients() {
        const searchInput = document.getElementById('patient-search');
        const genderFilter = document.getElementById('gender-filter');
        const sortBy = document.getElementById('sort-by');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const genderValue = genderFilter ? genderFilter.value : '';
        const sortValue = sortBy ? sortBy.value : 'newest';

        this.filteredPatients = this.userPatients.filter(patient => {
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                (patient.medicalId && patient.medicalId.toLowerCase().includes(searchTerm));
            
            const matchesGender = !genderValue || patient.gender === genderValue;
            
            return matchesSearch && matchesGender;
        });

        // الترتيب
        this.sortPatients(sortValue);
        
        this.currentPage = 1;
        this.renderPatients();
        this.updatePagination();
    }

    sortPatients(sortBy) {
        switch (sortBy) {
            case 'newest':
                this.filteredPatients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                this.filteredPatients.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                this.filteredPatients.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
        }
    }

    renderPatients() {
        const container = document.getElementById('patients-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPatients = this.filteredPatients.slice(startIndex, endIndex);

        if (currentPatients.length === 0) {
            container.innerHTML = this.getEmptyState();
            const paginationFooter = document.querySelector('.pagination-footer');
            if (paginationFooter) paginationFooter.style.display = 'none';
            return;
        }

        if (this.currentView === 'grid') {
            container.innerHTML = currentPatients.map(patient => this.createPatientCard(patient)).join('');
        } else {
            container.innerHTML = currentPatients.map(patient => this.createPatientListItem(patient)).join('');
        }

        const paginationFooter = document.querySelector('.pagination-footer');
        if (paginationFooter) paginationFooter.style.display = 'flex';
    }

    createPatientCard(patient) {
        const age = this.calculateAge(patient.birthDate);
        const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');
        const testCount = this.tests.filter(test => test.patientId === patient.id).length;

        return `
            <div class="patient-card" data-patient-id="${patient.id}">
                <div class="patient-header">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h3 class="patient-name">${patient.name}</h3>
                    <div class="patient-medical-id">${patient.medicalId}</div>
                </div>
                <div class="patient-body">
                    <div class="patient-info">
                        <div class="info-item">
                            <span class="info-label">العمر</span>
                            <span class="info-value">${age} سنة</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">الجنس</span>
                            <span class="info-value">${patient.gender}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">فصيلة الدم</span>
                            <span class="info-value">${patient.bloodType || 'غير محدد'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">عدد التحاليل</span>
                            <span class="info-value">${testCount}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">تاريخ الإضافة</span>
                            <span class="info-value">${createdAt}</span>
                        </div>
                    </div>
                </div>
                <div class="patient-footer">
                    <button class="btn-icon btn-edit" onclick="patientsManager.editPatient('${patient.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-tests" onclick="patientsManager.viewTests('${patient.id}')" title="التحاليل">
                        <i class="fas fa-vial"></i>
                        <span class="test-count">${testCount}</span>
                    </button>
                    <button class="btn-icon btn-delete" onclick="patientsManager.showDeleteModal('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createPatientListItem(patient) {
        const age = this.calculateAge(patient.birthDate);
        const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');
        const testCount = this.tests.filter(test => test.patientId === patient.id).length;

        return `
            <div class="patient-item" data-patient-id="${patient.id}">
                <div class="list-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="list-info">
                    <div class="list-name">${patient.name}</div>
                    <div class="list-medical-id">${patient.medicalId}</div>
                    <div class="list-detail">${age} سنة</div>
                    <div class="list-detail">${patient.gender}</div>
                    <div class="list-detail">${patient.bloodType || 'غير محدد'}</div>
                    <div class="list-detail">${testCount} تحليل</div>
                </div>
                <div class="list-actions">
                    <button class="btn-icon btn-edit" onclick="patientsManager.editPatient('${patient.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-tests" onclick="patientsManager.viewTests('${patient.id}')" title="التحاليل">
                        <i class="fas fa-vial"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="patientsManager.showDeleteModal('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3 data-i18n="no_patients_title">لا يوجد مرضى مسجلين بعد</h3>
                <p data-i18n="no_patients_description">ابدأ بإضافة أول مريض إلى النظام</p>
                <button class="btn-primary" onclick="patientsManager.showPatientModal()" data-i18n="add_first_patient">إضافة أول مريض</button>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
        const currentCount = Math.min(this.itemsPerPage, this.filteredPatients.length - ((this.currentPage - 1) * this.itemsPerPage));
        
        const currentCountElem = document.getElementById('current-count');
        const totalCountElem = document.getElementById('total-count');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (currentCountElem) currentCountElem.textContent = currentCount;
        if (totalCountElem) totalCountElem.textContent = this.filteredPatients.length;
        
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
            pagesHtml += `<span class="page-number ${active}" onclick="patientsManager.goToPage(${i})">${i}</span>`;
        }
        
        pageNumbers.innerHTML = pagesHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderPatients();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPatients();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderPatients();
            this.updatePagination();
        }
    }

    updateStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const recentPatients = this.userPatients.filter(patient => {
            const patientDate = new Date(patient.createdAt);
            return patientDate.getMonth() === thisMonth && patientDate.getFullYear() === thisYear;
        });

        const malePatients = this.userPatients.filter(p => p.gender === 'ذكر').length;
        const femalePatients = this.userPatients.filter(p => p.gender === 'أنثى').length;

        const totalCountElem = document.getElementById('total-patients-count');
        const maleCountElem = document.getElementById('male-patients-count');
        const femaleCountElem = document.getElementById('female-patients-count');
        const recentCountElem = document.getElementById('recent-patients-count');

        if (totalCountElem) totalCountElem.textContent = this.userPatients.length;
        if (maleCountElem) maleCountElem.textContent = malePatients;
        if (femaleCountElem) femaleCountElem.textContent = femalePatients;
        if (recentCountElem) recentCountElem.textContent = recentPatients.length;
    }

    calculateAge(birthDate) {
        if (!birthDate) return 'غير محدد';
        
        try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            
            return age;
        } catch (error) {
            return 'غير محدد';
        }
    }

    showPatientModal(patientId = null) {
        const modal = document.getElementById('patientModal');
        const title = document.getElementById('patient-modal-title');
        const submitText = document.getElementById('submit-btn-text');
        
        if (!modal || !title || !submitText) return;

        if (patientId) {
            // وضع التعديل
            if (window.languageManager) {
                title.textContent = window.languageManager.translate('edit_patient_modal_title');
            } else {
                title.textContent = 'تعديل بيانات المريض';
            }
            submitText.textContent = window.languageManager?.translate('save_changes_button') || 'حفظ التعديلات';
            this.fillPatientForm(patientId);
        } else {
            // وضع الإضافة
            if (window.languageManager) {
                title.textContent = window.languageManager.translate('add_patient_modal_title');
            } else {
                title.textContent = 'إضافة مريض جديد';
            }
            submitText.textContent = window.languageManager?.translate('add_patient_button') || 'إضافة المريض';
            this.clearPatientForm();
        }
        
        modal.classList.add('show');
    }

    hidePatientModal() {
        const modal = document.getElementById('patientModal');
        if (modal) modal.classList.remove('show');
    }

    clearPatientForm() {
        const form = document.getElementById('patientForm');
        if (form) form.reset();
        
        const patientId = document.getElementById('patient-id');
        if (patientId) patientId.value = '';
        
        // تعيين الرقم الطبي التلقائي
        const medicalId = document.getElementById('patient-medical-id');
        if (medicalId) {
            const nextId = this.generateMedicalId();
            medicalId.value = nextId;
        }
    }

    fillPatientForm(patientId) {
        const patient = this.userPatients.find(p => p.id === patientId);
        if (!patient) return;

        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };

        setValue('patient-id', patient.id);
        setValue('patient-name', patient.name);
        setValue('patient-medical-id', patient.medicalId);
        setValue('patient-gender', patient.gender);
        setValue('patient-birthdate', patient.birthDate);
        setValue('patient-email', patient.email);
        setValue('patient-phone', patient.phone);
        setValue('patient-height', patient.height);
        setValue('patient-weight', patient.weight);
        setValue('patient-blood-type', patient.bloodType);
        setValue('patient-address', patient.address);
        setValue('patient-notes', patient.notes);
    }

    generateMedicalId() {
        const lastPatient = this.userPatients[this.userPatients.length - 1];
        if (!lastPatient || !lastPatient.medicalId) return 'MED000001';
        
        const lastNumber = parseInt(lastPatient.medicalId.replace('MED', '')) || 0;
        const nextNumber = lastNumber + 1;
        return 'MED' + nextNumber.toString().padStart(6, '0');
    }

    savePatient() {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : '';
        };

        const patientId = getValue('patient-id');
        
        // التحقق من البيانات المطلوبة - الطريقة الصحيحة
        const requiredFields = [
            { id: 'patient-name', name: 'الاسم' },
            { id: 'patient-medical-id', name: 'الرقم الطبي' },
            { id: 'patient-gender', name: 'الجنس' },
            { id: 'patient-birthdate', name: 'تاريخ الميلاد' }
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

        const patientData = {
            name: getValue('patient-name'),
            medicalId: getValue('patient-medical-id'),
            gender: getValue('patient-gender'),
            birthDate: getValue('patient-birthdate'),
            email: getValue('patient-email'),
            phone: getValue('patient-phone'),
            height: getValue('patient-height'),
            weight: getValue('patient-weight'),
            bloodType: getValue('patient-blood-type'),
            address: getValue('patient-address'),
            notes: getValue('patient-notes'),
            updatedAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };

        if (patientId) {
            // تحديث المريض الموجود
            const index = this.patients.findIndex(p => p.id === patientId);
            if (index !== -1) {
                this.patients[index] = { ...this.patients[index], ...patientData };
            }
        } else {
            // إضافة مريض جديد
            patientData.id = 'patient_' + Date.now();
            patientData.createdAt = new Date().toISOString();
            this.patients.push(patientData);
            this.userPatients.push(patientData);
        }

        localStorage.setItem('medical_patients', JSON.stringify(this.patients));
        this.hidePatientModal();
        this.filterPatients();
        this.updateStats();
        
        // إظهار رسالة نجاح
        const message = patientId ? 
            (window.languageManager?.translate('patient_updated_success') || 'تم تحديث بيانات المريض بنجاح') :
            (window.languageManager?.translate('patient_added_success') || 'تم إضافة المريض بنجاح');
        
        this.showNotification(message, 'success');
    }

    editPatient(patientId) {
        this.showPatientModal(patientId);
    }

    showDeleteModal(patientId) {
        this.currentDeleteId = patientId;
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.add('show');
    }

    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('show');
        this.currentDeleteId = null;
    }

    deletePatient() {
        if (!this.currentDeleteId) return;

        const patientIndex = this.patients.findIndex(p => p.id === this.currentDeleteId);
        const userPatientIndex = this.userPatients.findIndex(p => p.id === this.currentDeleteId);
        
        if (patientIndex !== -1) {
            // حذف المريض من القائمة العامة
            this.patients.splice(patientIndex, 1);
            localStorage.setItem('medical_patients', JSON.stringify(this.patients));
            
            // حذف المريض من قائمة المستخدم
            if (userPatientIndex !== -1) {
                this.userPatients.splice(userPatientIndex, 1);
            }
            
            // حذف التحاليل المرتبطة بالمريض
            this.tests = this.tests.filter(test => test.patientId !== this.currentDeleteId);
            localStorage.setItem('medical_tests', JSON.stringify(this.tests));
            
            this.filterPatients();
            this.updateStats();
            this.hideDeleteModal();
            
            this.showNotification(
                window.languageManager?.translate('patient_deleted_success') || 'تم حذف المريض بنجاح', 
                'success'
            );
        }
    }

    viewTests(patientId) {
        // حفظ معرف المريض في sessionStorage للاستخدام في صفحة التحاليل
        sessionStorage.setItem('currentPatientId', patientId);
        window.location.href = 'analysis.html';
    }

    exportPatients() {
        if (this.userPatients.length === 0) {
            this.showNotification(
                window.languageManager?.translate('no_data_to_export') || 'لا توجد بيانات للتصدير', 
                'warning'
            );
            return;
        }

        const csvContent = this.convertToCSV(this.userPatients);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(
            window.languageManager?.translate('export_success') || 'تم تصدير بيانات المرضى بنجاح', 
            'success'
        );
    }

    convertToCSV(patients) {
        const headers = ['الاسم', 'الرقم الطبي', 'الجنس', 'تاريخ الميلاد', 'العمر', 'البريد الإلكتروني', 'الهاتف', 'الطول', 'الوزن', 'فصيلة الدم', 'العنوان', 'تاريخ الإضافة'];
        const csvRows = [headers.join(',')];
        
        patients.forEach(patient => {
            const age = this.calculateAge(patient.birthDate);
            const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');
            
            const row = [
                `"${patient.name}"`,
                patient.medicalId,
                patient.gender,
                patient.birthDate,
                age,
                patient.email || '',
                patient.phone || '',
                patient.height || '',
                patient.weight || '',
                patient.bloodType || '',
                `"${patient.address || ''}"`,
                createdAt
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    showNotification(message, type = 'info') {
        // استخدام نظام الإشعارات من authManager إذا كان متاحاً
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            // تنفيذ بدائي للإشعارات
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border-right: 4px solid ${type === 'success' ? '#2ecc71' : '#f39c12'};
                z-index: 3000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // الانتظار حتى يتم تحميل نظام اللغة أولاً
    if (window.languageManager && window.languageManager.isReady()) {
        window.patientsManager = new PatientsManager();
    } else {
        // إذا لم يكن نظام اللغة جاهزاً، ننتظر حتى يصبح جاهزاً
        const checkLanguageManager = setInterval(() => {
            if (window.languageManager && window.languageManager.isReady()) {
                clearInterval(checkLanguageManager);
                window.patientsManager = new PatientsManager();
            }
        }, 100);
    }
});