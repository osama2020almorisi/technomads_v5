// إدارة التقارير والطباعة - معدل ليعمل ببيانات حقيقية
class ReportsManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('medical_currentUser')) || null;
        this.patients = JSON.parse(localStorage.getItem('medical_patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medical_tests')) || [];
        this.reports = JSON.parse(localStorage.getItem('savedReports')) || [];
        this.currentReport = null;
        
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.setupEventListeners();
        this.loadCharts();
        this.updateKPIs();
        this.loadSavedReports();
        this.loadPatientOptions();
    }

    setupEventListeners() {
        // نطاق التاريخ المخصص
        const dateRange = document.getElementById('report-date-range');
        const customRange = document.getElementById('custom-date-range');

        if (dateRange && customRange) {
            dateRange.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customRange.style.display = 'grid';
                } else {
                    customRange.style.display = 'none';
                }
            });
        }

        // أزرار إنشاء التقارير
        const reportCards = document.querySelectorAll('.report-type-card');
        reportCards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showReportModal(type);
            });
        });

        // التقارير السريعة
        const quickReports = document.querySelectorAll('.quick-report-card .btn-primary');
        quickReports.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('onclick');
                if (action.includes('printDailyReport')) {
                    this.printDailyReport();
                } else if (action.includes('printCriticalReport')) {
                    this.printCriticalReport();
                } else if (action.includes('printAppointmentsReport')) {
                    this.printAppointmentsReport();
                }
            });
        });

        // معاينة التقارير السريعة
        const previewBtns = document.querySelectorAll('.quick-report-card .btn-secondary');
        previewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('onclick');
                if (action.includes('generateDailyReport')) {
                    this.generateDailyReport();
                } else if (action.includes('generateCriticalReport')) {
                    this.generateCriticalReport();
                } else if (action.includes('generateAppointmentsReport')) {
                    this.generateAppointmentsReport();
                }
            });
        });

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideReportModal();
                this.hidePreviewModal();
                this.hideSavedReportsModal();
            });
        });

        // نموذج التقرير
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateReport();
            });
        }

        // معاينة التقرير
        const previewBtn = document.querySelector('.btn-primary[onclick*="previewReport"]');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previewReport();
            });
        }
    }

    loadPatientOptions() {
        const patientSelect = document.getElementById('report-patient');
        if (!patientSelect) return;

        // تحميل مرضى المستخدم الحالي فقط
        const userPatients = this.patients.filter(patient => 
            patient.createdBy === this.currentUser.id
        );

        patientSelect.innerHTML = '<option value="">اختر المريض</option>' +
            userPatients.map(patient => 
                `<option value="${patient.id}">${patient.name} - ${patient.medicalId}</option>`
            ).join('');
    }

    showReportModal(type) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('report-modal-title');
        document.getElementById('report-type').value = type;

        const titles = {
            'patient': 'تقرير مريض',
            'tests': 'تقرير التحاليل',
            'statistics': 'تقرير إحصائي',
            'financial': 'تقرير مالي'
        };

        if (window.languageManager) {
            title.textContent = window.languageManager.translate(`report_type_${type}`) || titles[type];
        } else {
            title.textContent = titles[type] || 'إنشاء تقرير جديد';
        }
        
        modal.classList.add('show');
    }

    hideReportModal() {
        const modal = document.getElementById('reportModal');
        modal.classList.remove('show');
    }

    previewReport() {
        const type = document.getElementById('report-type').value;
        const patientId = document.getElementById('report-patient').value;
        const dateRange = document.getElementById('report-date-range').value;
        
        this.currentReport = {
            type,
            patientId,
            dateRange,
            timestamp: new Date().toISOString()
        };

        this.showPreview();
    }

    showPreview() {
        const modal = document.getElementById('previewModal');
        const preview = document.getElementById('report-preview');
        
        preview.innerHTML = this.generateReportPreview();
        modal.classList.add('show');
    }

    hidePreviewModal() {
        const modal = document.getElementById('previewModal');
        modal.classList.remove('show');
    }

    closePreview() {
        this.hidePreviewModal();
        this.showReportModal(this.currentReport.type);
    }

    generateReportPreview() {
        if (!this.currentReport) return '';

        const { type, patientId } = this.currentReport;
        const patient = this.patients.find(p => p.id === patientId);
        
        // تحميل تحاليل المستخدم الحالي فقط
        const userTests = this.tests.filter(test => 
            test.createdBy === this.currentUser.id
        );

        switch (type) {
            case 'patient':
                return this.generatePatientReportPreview(patient, userTests);
            case 'tests':
                return this.generateTestsReportPreview(userTests);
            case 'statistics':
                return this.generateStatisticsReportPreview(userTests);
            case 'financial':
                return this.generateFinancialReportPreview();
            default:
                return this.generateDefaultReportPreview();
        }
    }

    generatePatientReportPreview(patient, userTests) {
        if (!patient) {
            return `
                <div class="report-preview-container">
                    <div class="report-header">
                        <h1>تقرير المريض</h1>
                        <div class="clinic-info">عيادة Pulse الطبية</div>
                        <div class="report-meta">
                            <div class="meta-item">
                                <div class="meta-label">تاريخ التقرير</div>
                                <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">نوع التقرير</div>
                                <div class="meta-value">تقرير مريض</div>
                            </div>
                        </div>
                    </div>
                    <div class="report-body">
                        <div class="empty-state">
                            <i class="fas fa-user-slash"></i>
                            <h3>لم يتم اختيار مريض</h3>
                            <p>يرجى اختيار مريض لإنشاء التقرير</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const patientTests = userTests.filter(t => t.patientId === patient.id);
        const criticalTests = patientTests.filter(t => t.status === 'critical');
        const recentTests = patientTests.slice(0, 5);

        return `
            <div class="report-preview-container">
                <div class="report-header">
                    <h1>تقرير المريض</h1>
                    <div class="clinic-info">عيادة Pulse الطبية</div>
                    <div class="report-meta">
                        <div class="meta-item">
                            <div class="meta-label">اسم المريض</div>
                            <div class="meta-value">${patient.name}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">الرقم الطبي</div>
                            <div class="meta-value">${patient.medicalId}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">تاريخ التقرير</div>
                            <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                        </div>
                    </div>
                </div>

                <div class="report-body">
                    <div class="report-section">
                        <h2>المعلومات الشخصية</h2>
                        <div class="patient-summary">
                            <div class="summary-item">
                                <h3>البيانات الأساسية</h3>
                                <p>الاسم: ${patient.name}</p>
                                <p>الجنس: ${patient.gender}</p>
                                <p>فصيلة الدم: ${patient.bloodType || 'غير محدد'}</p>
                            </div>
                            <div class="summary-item">
                                <h3>المعلومات الطبية</h3>
                                <p>الطول: ${patient.height || 'غير محدد'} سم</p>
                                <p>الوزن: ${patient.weight || 'غير محدد'} كجم</p>
                                <p>العمر: ${this.calculateAge(patient.birthDate) || 'غير محدد'} سنة</p>
                            </div>
                            <div class="summary-item">
                                <h3>معلومات الاتصال</h3>
                                <p>البريد: ${patient.email || 'غير محدد'}</p>
                                <p>الهاتف: ${patient.phone || 'غير محدد'}</p>
                                <p>العنوان: ${patient.address || 'غير محدد'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h2>الإحصائيات</h2>
                        <div class="statistics-grid">
                            <div class="stat-card">
                                <h4>إجمالي التحاليل</h4>
                                <div class="stat-value">${patientTests.length}</div>
                                <div class="stat-label">تحليل طبي</div>
                            </div>
                            <div class="stat-card">
                                <h4>الحالات الحرجة</h4>
                                <div class="stat-value">${criticalTests.length}</div>
                                <div class="stat-label">تحتاج متابعة</div>
                            </div>
                            <div class="stat-card">
                                <h4>آخر تحليل</h4>
                                <div class="stat-value">${patientTests.length > 0 ? new Date(patientTests[0].createdAt).toLocaleDateString('ar-EG') : 'لا يوجد'}</div>
                                <div class="stat-label">تاريخ</div>
                            </div>
                        </div>
                    </div>

                    ${recentTests.length > 0 ? `
                    <div class="report-section">
                        <h2>أحدث التحاليل</h2>
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>نوع التحليل</th>
                                    <th>التاريخ</th>
                                    <th>الحالة</th>
                                    <th>النتيجة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentTests.map(test => `
                                    <tr>
                                        <td>${test.testType}</td>
                                        <td>${new Date(test.createdAt).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <span class="result-status ${test.status}">
                                                ${this.getStatusText(test.status)}
                                            </span>
                                        </td>
                                        <td>${test.analysis ? test.analysis.substring(0, 50) + '...' : 'لم يتم التحليل'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : ''}

                    ${patient.notes ? `
                    <div class="report-section">
                        <h2>ملاحظات طبية</h2>
                        <div class="summary-item">
                            <p>${patient.notes}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="report-footer">
                    <div class="footer-notes">
                        هذا التقرير تم إنشاؤه تلقائياً من نظام Pulse الطبي. يوصى بمراجعة الطبيب المختص لتفسير النتائج بدقة.
                    </div>
                    <div class="doctor-signature">
                        <div>د. ${this.currentUser.firstName} ${this.currentUser.lastName}</div>
                        <div>${this.getSpecialtyText(this.currentUser.specialty)}</div>
                        <div class="signature-line"></div>
                        <div>التوقيع</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTestsReportPreview(userTests) {
        const totalTests = userTests.length;
        const normalTests = userTests.filter(t => t.status === 'normal').length;
        const warningTests = userTests.filter(t => t.status === 'warning').length;
        const criticalTests = userTests.filter(t => t.status === 'critical').length;

        const testTypes = {};
        userTests.forEach(test => {
            testTypes[test.testType] = (testTypes[test.testType] || 0) + 1;
        });

        return `
            <div class="report-preview-container">
                <div class="report-header">
                    <h1>تقرير التحاليل الطبية</h1>
                    <div class="clinic-info">عيادة Pulse الطبية</div>
                    <div class="report-meta">
                        <div class="meta-item">
                            <div class="meta-label">الفترة</div>
                            <div class="meta-value">${this.getDateRangeText()}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">إجمالي التحاليل</div>
                            <div class="meta-value">${totalTests}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">تاريخ التقرير</div>
                            <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                        </div>
                    </div>
                </div>

                <div class="report-body">
                    <div class="report-section">
                        <h2>نظرة عامة</h2>
                        <div class="statistics-grid">
                            <div class="stat-card">
                                <h4>إجمالي التحاليل</h4>
                                <div class="stat-value">${totalTests}</div>
                                <div class="stat-label">تحليل طبي</div>
                            </div>
                            <div class="stat-card">
                                <h4>نتائج طبيعية</h4>
                                <div class="stat-value">${normalTests}</div>
                                <div class="stat-label">${totalTests > 0 ? Math.round((normalTests / totalTests) * 100) : 0}%</div>
                            </div>
                            <div class="stat-card">
                                <h4>تحتاج مراجعة</h4>
                                <div class="stat-value">${warningTests}</div>
                                <div class="stat-label">${totalTests > 0 ? Math.round((warningTests / totalTests) * 100) : 0}%</div>
                            </div>
                            <div class="stat-card">
                                <h4>حالات حرجة</h4>
                                <div class="stat-value">${criticalTests}</div>
                                <div class="stat-label">${totalTests > 0 ? Math.round((criticalTests / totalTests) * 100) : 0}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h2>توزيع أنواع التحاليل</h2>
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>نوع التحليل</th>
                                    <th>عدد التحاليل</th>
                                    <th>النسبة</th>
                                    <th>آخر تحليل</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(testTypes).map(([type, count]) => {
                                    const lastTest = userTests
                                        .filter(t => t.testType === type)
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                                    
                                    return `
                                        <tr>
                                            <td>${type}</td>
                                            <td>${count}</td>
                                            <td>${totalTests > 0 ? Math.round((count / totalTests) * 100) : 0}%</td>
                                            <td>${lastTest ? new Date(lastTest.createdAt).toLocaleDateString('ar-EG') : 'لا يوجد'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="report-section">
                        <h2>التحاليل الحرجة</h2>
                        ${criticalTests > 0 ? `
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th>المريض</th>
                                        <th>نوع التحليل</th>
                                        <th>التاريخ</th>
                                        <th>التشخيص</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${userTests
                                        .filter(t => t.status === 'critical')
                                        .slice(0, 10)
                                        .map(test => {
                                            const patient = this.patients.find(p => p.id === test.patientId);
                                            return `
                                                <tr>
                                                    <td>${patient ? patient.name : 'مريض محذوف'}</td>
                                                    <td>${test.testType}</td>
                                                    <td>${new Date(test.createdAt).toLocaleDateString('ar-EG')}</td>
                                                    <td>${test.analysis || 'لم يتم التحليل'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="summary-item">
                                <p>لا توجد تحاليل حرجة في الفترة المحددة</p>
                            </div>
                        `}
                    </div>
                </div>

                <div class="report-footer">
                    <div class="footer-notes">
                        تم إنشاء هذا التقرير تلقائياً من نظام إدارة التحاليل الطبية Pulse.
                        جميع البيانات المعروضة تستند إلى السجلات الطبية المسجلة في النظام.
                    </div>
                </div>
            </div>
        `;
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

    // باقي الدوال تبقى كما هي مع تعديلات طفيفة...
    // [يتبع نفس الكود السابق مع التعديلات]
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.reportsManager = new ReportsManager();
});