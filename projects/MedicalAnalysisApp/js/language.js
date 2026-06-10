// نظام إدارة اللغة المحسن بالكامل مع جميع النصوص المطلوبة
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('medical_language') || 'ar';
        this.translations = {};
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadTranslations();
            this.applyLanguage(this.currentLang);
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('LanguageManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize LanguageManager:', error);
        }
    }

    async loadTranslations() {
        this.translations = {
            ar: {
                // === التنقل الرئيسي ===
                "nav_features": "المميزات",
                "nav_about": "عن النظام",
                "nav_contact": "اتصل بنا",
                "nav_login": "تسجيل الدخول",
                "nav_register": "إنشاء حساب",
                "nav_language": "English",
                "arabic": "العربية",
                "english": "English",
                
                // === العناوين العامة ===
                "system_name": "Pulse - النظام الصحي الذكي",
                "login_title": "تسجيل الدخول - Pulse",
                "register_title": "إنشاء حساب - Pulse",
                "dashboard_title": "لوحة التحكم - Pulse",
                "patients_title": "إدارة المرضى - Pulse",
                "analysis_title": "تحليل التحاليل - Pulse",
                "reports_title": "التقارير والطباعة - Pulse",
                "notifications_title": "التنبيهات - Pulse",
                "settings_title": "الإعدادات - Pulse",
                "loading_system": "جاري تحميل النظام الصحي...",
                
                // === الصفحة الرئيسية ===
                "hero_title": "النظام الصحي الذكي",
                "hero_highlight": "لتحليل التحاليل الطبية",
                "hero_description": "نظام متكامل لإدارة المرضى وتحليل التحاليل الطبية وتقديم توصيات ذكية مخصصة. سجل الآن وتمتع بأحدث أدوات الرعاية الصحية.",
                "hero_get_started": "ابدأ مجاناً",
                "hero_watch_demo": "شاهد الفيديو",
                "hero_doctors_registered": "طبيب مسجل",
                "hero_monthly_tests": "تحليل شهري",
                "hero_satisfaction_rate": "رضا العملاء",
                "hero_doctors_count": "١٢٤",
                "hero_tests_count": "٤٨",
                "hero_satisfaction_count": "٩٨٪",
                
                // === معاينة اللوحة ===
                "preview_dashboard": "لوحة التحكم",
                "preview_patients": "المرضى",
                "preview_analysis": "التحاليل",
                "preview_total_patients": "إجمالي المرضى",
                "preview_tests_today": "تحليل اليوم",
                "preview_live_system": "عرض حي للنظام",
                "preview_patients_count": "٠",
                "preview_tests_count": "٠",
                
                // === قسم المميزات ===
                "features_title": "مميزات النظام",
                "features_subtitle": "اكتشف القوة الكاملة لنظام Pulse الصحي",
                "feature1_title": "إدارة المرضى",
                "feature1_desc": "نظام متكامل لإدارة سجلات المرضى ومعلوماتهم الطبية بشكل آمن ومنظم",
                "feature2_title": "تحليل التحاليل",
                "feature2_desc": "تحليل ذكي للتحاليل الطبية مع تقديم توصيات مخصصة حسب حالة كل مريض",
                "feature3_title": "التنبيهات الذكية",
                "feature3_desc": "نظام تنبيهات ذكي للإشعارات المهمة والنتائج الحرجة التي تحتاج متابعة",
                "feature4_title": "التقارير والإحصائيات",
                "feature4_desc": "تقارير شاملة وإحصائيات تفصيلية لمتابعة تطور الحالات الصحية",
                "feature5_title": "واجهة متجاوبة",
                "feature5_desc": "تصميم متكامل يعمل على جميع الأجهزة من حواسيب وهواتف وأجهزة لوحية",
                "feature6_title": "أمان وحماية",
                "feature6_desc": "نظام أمان متكامل يحمي بيانات المرضى ويضمن الخصوصية التامة",
                
                // === كيفية العمل ===
                "how_it_works_title": "كيف يعمل النظام؟",
                "how_it_works_subtitle": "3 خطوات بسيطة لبدء استخدام Pulse",
                "step1_title": "أنشئ حسابك",
                "step1_desc": "سجل في النظام خلال دقائق باستخدام بريدك الإلكتروني",
                "step2_title": "أضف مرضاك",
                "step2_desc": "ابدأ بإضافة مرضاك وإنشاء سجلاتهم الطبية",
                "step3_title": "حلل النتائج",
                "step3_desc": "استخدم أدوات التحليل الذكية للحصول على توصيات مخصصة",
                
                // === قسم الدعوة للعمل ===
                "cta_title": "جاهز للبدء؟",
                "cta_subtitle": "انضم إلى آلاف الأطباء الذين يثقون في Pulse لإدارة عياداتهم",
                "cta_create_account": "أنشئ حسابك المجاني الآن",
                "cta_signup_time": "يسغرق التسجيل أقل من دقيقتين",
                
                // === التذييل ===
                "footer_description": "نظام طبي ذكي متكامل لتحليل التحاليل الطبية وإدارة الرعاية الصحية",
                "footer_quick_links": "روابط سريعة",
                "footer_home": "الرئيسية",
                "footer_support": "الدعم",
                "footer_help": "المساعدة",
                "footer_faq": "الأسئلة الشائعة",
                "footer_contact_us": "اتصل بنا",
                "footer_legal": "قانوني",
                "footer_terms": "الشروط والأحكام",
                "footer_privacy": "سياسة الخصوصية",
                "footer_location": "الرياض، السعودية",
                "footer_phone": "+966 12 345 6789",
                "footer_email": "info@pulse-medical.com",
                "footer_copyright": "&copy; 2024 Pulse. جميع الحقوق محفوظة.",

                // === صفحة تسجيل الدخول ===
                "back_home": "العودة للرئيسية",
                "login_system_name": "التطبيق الصحي الذكي لمتابعة التحاليل الطبية",
                "login_system_description": "أداة متكاملة لتحليل نتائج التحاليل الطبية وتقديم توصيات غذائية ونمط حياة مخصصة لكل مريض.",
                "login_feature1": "تحليل نتائج التحاليل الطبية",
                "login_feature2": "توصيات غذائية مخصصة",
                "login_feature3": "تنبيهات ومواعيد دورية",
                "login_testimonial_text": "\"Pulse غير طريقة عملي تماماً. وفر لي ساعات من العمل وأعطاني رؤى لم أكن أحلم بها\"",
                "login_doctor_name": "د. أحمد محمد",
                "login_doctor_specialty": "طبيب استشاري",
                "login_welcome": "مرحباً بعودتك!",
                "login_subtitle": "سجل الدخول للمتابعة إلى حسابك",
                "email_label": "البريد الإلكتروني",
                "email_placeholder": "ادخل بريدك الإلكتروني",
                "password_label": "كلمة المرور",
                "password_placeholder": "ادخل كلمة المرور",
                "remember_me": "تذكرني",
                "forgot_password": "نسيت كلمة المرور؟",
                "login_button": "تسجيل الدخول",
                "or": "أو",
                "continue_google": "متابعة مع Google",
                "no_account": "ليس لديك حساب؟",
                "create_account_link": "أنشئ حساب جديد",

                // === صفحة إنشاء الحساب ===
                "register_hero_title": "انضم إلى ثورة الرعاية الصحية الذكية",
                "register_hero_description": "ابدأ رحلتك مع Pulse واستفد من أحدث تقنيات الذكاء الاصطناعي في تحليل التحاليل الطبية.",
                "register_feature1": "إدارة كاملة للمرضى",
                "register_feature2": "تحليل ذكي للتحاليل",
                "register_feature3": "حماية وأمان تام",
                "register_testimonial_text": "\"منذ أن بدأت استخدام Pulse، تمكنت من تحسين جودة الرعاية التي أقدمها لمرضاي بشكل ملحوظ\"",
                "register_doctor_name": "د. فاطمة أحمد",
                "register_doctor_specialty": "أخصائية باطنية",
                "register_doctors_count": "١٬٢٤٧",
                "register_doctors_registered": "طبيب مسجل",
                "register_patients_count": "١٢٬٥٨٩",
                "register_patients_served": "مريض تم خدمتهم",
                "register_title_main": "أنشئ حسابك!",
                "register_subtitle": "انضم إلى نظام Pulse الصحي الذكي",
                "first_name_label": "الاسم الأول",
                "first_name_placeholder": "ادخل الاسم الأول",
                "last_name_label": "اسم العائلة",
                "last_name_placeholder": "ادخل اسم العائلة",
                "phone_label": "رقم الهاتف",
                "phone_placeholder": "ادخل رقم الهاتف",
                "specialty_label": "التخصص الطبي",
                "choose_specialty": "اختر تخصصك",
                "general_medicine": "طب عام",
                "internal_medicine": "باطنية",
                "cardiology": "قلب",
                "endocrinology": "غدد صماء",
                "other_specialty": "تخصص آخر",
                "license_label": "رقم الترخيص الطبي",
                "license_placeholder": "ادخل رقم الترخيص",
                "confirm_password_label": "تأكيد كلمة المرور",
                "confirm_password_placeholder": "أعد إدخال كلمة المرور",
                "password_strength": "قوة كلمة المرور",
                "password_placeholder_register": "أنشئ كلمة مرور قوية",
                "agree_terms": "أوافق على",
                "terms_link": "الشروط والأحكام",
                "and": "و",
                "privacy_link": "سياسة الخصوصية",
                "register_button": "إنشاء الحساب",
                "signup_google": "التسجيل مع Google",
                "have_account": "لديك حساب بالفعل؟",
                "login_link": "سجل الدخول",

                // === لوحة التحكم ===
                "welcome_message": "مرحباً بعودتك، د. {name}",
                "sidebar_dashboard": "لوحة التحكم",
                "sidebar_patients": "إدارة المرضى",
                "sidebar_analysis": "تحليل التحاليل",
                "sidebar_reports": "التقارير",
                "sidebar_notifications": "التنبيهات",
                "sidebar_settings": "الإعدادات",
                "sidebar_logout": "تسجيل الخروج",
                "stat_total_patients": "إجمالي المرضى",
                "stat_total_tests": "إجمالي التحاليل",
                "stat_pending_reviews": "تحتاج مراجعة",
                "stat_weekly_appointments": "مواعيد هذا الأسبوع",
                "stat_add_patients": "أضف مرضى",
                "stat_add_tests": "سجل تحليلاً",
                "stat_review_now": "راجع الآن",
                "stat_schedule_appointment": "حدد موعداً",
                "quick_actions_title": "إجراءات سريعة",
                "action_add_patient": "إضافة مريض جديد",
                "action_add_test": "تسجيل تحليل جديد",
                "action_generate_report": "إنشاء تقرير",
                "action_book_appointment": "حجز موعد",
                "recent_patients_title": "آخر المرضى المضافين",
                "recent_tests_title": "آخر التحاليل المسجلة",
                "important_notifications_title": "الإشعارات الهامة",
                "view_all": "عرض الكل",
                "no_patients_message": "لا يوجد مرضى مسجلين بعد",
                "no_tests_message": "لا توجد تحاليل مسجلة بعد",
                "no_notifications_message": "لا توجد إشعارات حالياً",
                "add_first_patient": "إضافة أول مريض",
                "add_first_test": "تسجيل أول تحليل",
                "search_placeholder": "ابحث عن مريض أو تحليل...",
                "appointment_modal_title": "حجز موعد جديد",
                "select_patient_label": "اختر المريض",
                "select_patient_option": "اختر المريض",
                "appointment_date_label": "تاريخ الموعد",
                "appointment_time_label": "وقت الموعد",
                "appointment_type_label": "نوع الموعد",
                "appointment_consultation": "استشارة",
                "appointment_followup": "متابعة",
                "appointment_test": "تحليل",
                "appointment_review": "مراجعة نتائج",
                "save_appointment_button": "حفظ الموعد",
                "cancel_button": "إلغاء",

                // === إدارة المرضى ===
                "patients_subtitle": "إدارة سجلات المرضى والبيانات الطبية",
                "add_patient_button": "إضافة مريض جديد",
                "search_patients_placeholder": "ابحث بالاسم أو الرقم الطبي...",
                "filter_gender_label": "التصنيف:",
                "filter_all_patients": "جميع المرضى",
                "filter_male": "ذكور فقط",
                "filter_female": "إناث فقط",
                "sort_by_label": "الترتيب:",
                "sort_newest": "الأحدث أولاً",
                "sort_oldest": "الأقدم أولاً",
                "sort_name": "حسب الاسم",
                "export_data_button": "تصدير البيانات",
                "stat_total_patients": "إجمالي المرضى",
                "stat_male_patients": "مرضى ذكور",
                "stat_female_patients": "مرضى إناث",
                "stat_this_month": "مضافين هذا الشهر",
                "patients_list_title": "قائمة المرضى",
                "no_patients_title": "لا يوجد مرضى مسجلين بعد",
                "no_patients_description": "ابدأ بإضافة أول مريض إلى النظام",
                "add_first_patient": "إضافة أول مريض",
                "showing_patients": "عرض",
                "of_patients": "من",
                "patient": "مريض",
                "pagination_previous": "السابق",
                "pagination_next": "التالي",
                "add_patient_modal_title": "إضافة مريض جديد",
                "patient_name_label": "الاسم الكامل *",
                "patient_name_placeholder": "ادخل الاسم الكامل",
                "medical_id_label": "الرقم الطبي *",
                "gender_label": "الجنس *",
                "select_gender": "اختر الجنس",
                "gender_male": "ذكر",
                "gender_female": "أنثى",
                "birthdate_label": "تاريخ الميلاد *",
                "height_label": "الطول (سم)",
                "height_placeholder": "ادخل الطول",
                "weight_label": "الوزن (كجم)",
                "weight_placeholder": "ادخل الوزن",
                "blood_type_label": "فصيلة الدم",
                "select_blood_type": "اختر فصيلة الدم",
                "address_label": "العنوان",
                "address_placeholder": "ادخل العنوان",
                "medical_notes_label": "ملاحظات طبية",
                "medical_notes_placeholder": "أي معلومات طبية إضافية...",
                "delete_modal_title": "تأكيد الحذف",
                "delete_confirmation_message": "هل أنت متأكد من رغبتك في حذف هذا المريض؟",
                "delete_warning_message": "سيتم حذف جميع البيانات المرتبطة بهذا المريض ولا يمكن التراجع عن هذه العملية.",
                "delete_patient_button": "حذف المريض",

                // === تحليل التحاليل ===
                "analysis_subtitle": "تحليل نتائج التحاليل وتقديم توصيات مخصصة",
                "filter_type_label": "نوع التحليل:",
                "filter_all_tests": "جميع التحاليل",
                "filter_status_label": "الحالة:",
                "filter_all_status": "جميع الحالات",
                "filter_normal": "طبيعي",
                "filter_warning": "يحتاج مراجعة",
                "filter_critical": "حرج",
                "filter_date_label": "الفترة:",
                "filter_all_dates": "جميع الفترات",
                "filter_today": "اليوم",
                "filter_week": "أسبوع",
                "filter_month": "شهر",
                "filter_year": "سنة",
                "test_type_label": "نوع التحليل *",
                "select_test_type": "اختر نوع التحليل",
                "test_date_label": "تاريخ التحليل *",
                "test_lab_label": "المختبر",
                "test_lab_placeholder": "اسم المختبر",
                "test_notes_label": "ملاحظات إضافية",
                "test_notes_placeholder": "أي ملاحظات إضافية حول التحليل...",

                // === التقارير ===
                "reports_subtitle": "إنشاء تقارير طبية وإحصائيات مفصلة",
                "report_type_patient": "تقرير مريض",
                "report_type_tests": "تقرير التحاليل",
                "report_type_statistics": "إحصائيات عامة",
                "report_type_financial": "تقرير مالي",
                "quick_report_daily": "ملخص النشاط اليومي",
                "quick_report_critical": "قائمة الحالات الحرجة",
                "quick_report_appointments": "جدول المواعيد",
                "generate_report_button": "إنشاء تقرير",
                "preview_report_button": "معاينة التقرير",
                "print_report_button": "طباعة التقرير",
                "download_report_button": "تحميل التقرير",

                // === التنبيهات ===
                "notifications_subtitle": "إدارة جميع الإشعارات والتنبيهات في نظامك",
                "mark_all_read": "تعليم الكل كمقروء",
                "clear_all": "حذف الكل",
                "filter_status": "الحالة:",
                "filter_all_notifications": "جميع الإشعارات",
                "filter_unread": "غير مقروء فقط",
                "filter_read": "مقروء فقط",
                "filter_type": "النوع:",
                "filter_critical": "حرجة",
                "filter_warning": "تحذير",
                "filter_info": "معلومات",
                "filter_success": "نجاح",
                "filter_reminder": "تذكير",
                "filter_date": "الفترة:",
                "apply_filters": "تطبيق التصفية",
                "reset_filters": "إعادة التعيين",

                // === الإعدادات ===
                "settings_subtitle": "إدارة إعدادات النظام والملف الشخصي",
                "settings_profile": "الملف الشخصي",
                "settings_preferences": "التفضيلات",
                "settings_notifications": "الإشعارات",
                "settings_security": "الأمان",
                "settings_backup": "النسخ الاحتياطي",
                "settings_about": "حول النظام",
                "profile_title": "الملف الشخصي",
                "profile_subtitle": "إدارة معلومات حسابك الشخصية",
                "preferences_title": "التفضيلات",
                "preferences_subtitle": "تخصيص إعدادات النظام حسب احتياجاتك",
                "notifications_title": "إعدادات الإشعارات",
                "notifications_subtitle": "التحكم في الإشعارات والتنبيهات التي تستقبلها",
                "security_title": "الأمان",
                "security_subtitle": "إدارة أمان حسابك وكلمة المرور",
                "backup_title": "النسخ الاحتياطي",
                "backup_subtitle": "إدارة نسخ البيانات الاحتياطية والاستعادة",
                "about_title": "حول النظام",
                "about_subtitle": "معلومات عن Pulse وإصدار النظام",

                // === نصوص إضافية ===
                "weak_password": "ضعيفة",
                "medium_password": "متوسطة",
                "strong_password": "قوية",
                "very_strong_password": "قوية جداً",
                "loading": "جاري التحميل...",
                "success": "تم بنجاح",
                "error": "خطأ",
                "warning": "تحذير",
                "info": "معلومات",
                "save": "حفظ",
                "edit": "تعديل",
                "delete": "حذف",
                "update": "تحديث",
                "create": "إنشاء",
                "confirm": "تأكيد",
                "back": "رجوع",
                "next": "التالي",
                "previous": "السابق",
                "close": "إغلاق",
                "open": "فتح",
                "enable": "تفعيل",
                "disable": "تعطيل",
                "active": "نشط",
                "inactive": "غير نشط",
                "connected": "متصل",
                "disconnected": "غير متصل",
                "online": "متصل",
                "offline": "غير متصل"
            },
            en: {
                // === Navigation ===
                "nav_features": "Features",
                "nav_about": "About",
                "nav_contact": "Contact",
                "nav_login": "Login",
                "nav_register": "Register",
                "nav_language": "العربية",
                "arabic": "العربية",
                "english": "English",
                
                // === General Titles ===
                "system_name": "Pulse - Smart Health System",
                "login_title": "Login - Pulse",
                "register_title": "Register - Pulse",
                "dashboard_title": "Dashboard - Pulse",
                "patients_title": "Patients Management - Pulse",
                "analysis_title": "Test Analysis - Pulse",
                "reports_title": "Reports & Printing - Pulse",
                "notifications_title": "Notifications - Pulse",
                "settings_title": "Settings - Pulse",
                "loading_system": "Loading Health System...",
                
                // === Hero Section ===
                "hero_title": "Smart Health System",
                "hero_highlight": "For Medical Analysis",
                "hero_description": "A comprehensive system for patient management, medical test analysis, and personalized smart recommendations. Register now and enjoy the latest healthcare tools.",
                "hero_get_started": "Get Started Free",
                "hero_watch_demo": "Watch Demo",
                "hero_doctors_registered": "Doctors Registered",
                "hero_monthly_tests": "Monthly Tests",
                "hero_satisfaction_rate": "Satisfaction Rate",
                "hero_doctors_count": "124",
                "hero_tests_count": "48",
                "hero_satisfaction_count": "98%",
                
                // === Dashboard Preview ===
                "preview_dashboard": "Dashboard",
                "preview_patients": "Patients",
                "preview_analysis": "Analysis",
                "preview_total_patients": "Total Patients",
                "preview_tests_today": "Tests Today",
                "preview_live_system": "Live System Preview",
                "preview_patients_count": "0",
                "preview_tests_count": "0",
                
                // === Features ===
                "features_title": "System Features",
                "features_subtitle": "Discover the full power of Pulse Health System",
                "feature1_title": "Patient Management",
                "feature1_desc": "Complete system for managing patient records and medical information securely and organized",
                "feature2_title": "Test Analysis",
                "feature2_desc": "Smart analysis of medical tests with personalized recommendations for each patient",
                "feature3_title": "Smart Notifications",
                "feature3_desc": "Intelligent alert system for important notifications and critical results needing follow-up",
                "feature4_title": "Reports & Statistics",
                "feature4_desc": "Comprehensive reports and detailed statistics to track health progress",
                "feature5_title": "Responsive Interface",
                "feature5_desc": "Complete design that works on all devices from computers to phones and tablets",
                "feature6_title": "Security & Protection",
                "feature6_desc": "Complete security system that protects patient data and ensures complete privacy",
                
                // === How it Works ===
                "how_it_works_title": "How It Works?",
                "how_it_works_subtitle": "3 simple steps to start using Pulse",
                "step1_title": "Create Your Account",
                "step1_desc": "Register in the system in minutes using your email",
                "step2_title": "Add Your Patients",
                "step2_desc": "Start adding your patients and creating their medical records",
                "step3_title": "Analyze Results",
                "step3_desc": "Use smart analysis tools to get personalized recommendations",
                
                // === Call to Action ===
                "cta_title": "Ready to Start?",
                "cta_subtitle": "Join thousands of doctors who trust Pulse to manage their clinics",
                "cta_create_account": "Create Your Free Account Now",
                "cta_signup_time": "Registration takes less than 2 minutes",
                
                // === Footer ===
                "footer_description": "Smart medical system for medical test analysis and healthcare management",
                "footer_quick_links": "Quick Links",
                "footer_home": "Home",
                "footer_support": "Support",
                "footer_help": "Help",
                "footer_faq": "FAQ",
                "footer_contact_us": "Contact Us",
                "footer_legal": "Legal",
                "footer_terms": "Terms & Conditions",
                "footer_privacy": "Privacy Policy",
                "footer_location": "Riyadh, Saudi Arabia",
                "footer_phone": "+966 12 345 6789",
                "footer_email": "info@pulse-medical.com",
                "footer_copyright": "&copy; 2024 Pulse. All rights reserved.",

                // === Login Page ===
                "back_home": "Back to Home",
                "login_system_name": "Smart Health App for Medical Test Monitoring",
                "login_system_description": "A comprehensive tool for analyzing medical test results and providing personalized dietary and lifestyle recommendations for each patient.",
                "login_feature1": "Medical test results analysis",
                "login_feature2": "Personalized dietary recommendations",
                "login_feature3": "Alerts and periodic appointments",
                "login_testimonial_text": "\"Pulse completely changed my workflow. It saved me hours of work and gave me insights I never dreamed of\"",
                "login_doctor_name": "Dr. Ahmed Mohamed",
                "login_doctor_specialty": "Consultant Physician",
                "login_welcome": "Welcome Back!",
                "login_subtitle": "Sign in to continue to your account",
                "email_label": "Email Address",
                "email_placeholder": "Enter your email",
                "password_label": "Password",
                "password_placeholder": "Enter your password",
                "remember_me": "Remember me",
                "forgot_password": "Forgot password?",
                "login_button": "Sign In",
                "or": "Or",
                "continue_google": "Continue with Google",
                "no_account": "Don't have an account?",
                "create_account_link": "Create new account",

                // === Register Page ===
                "register_hero_title": "Join the Smart Healthcare Revolution",
                "register_hero_description": "Start your journey with Pulse and benefit from the latest AI technologies in medical test analysis.",
                "register_feature1": "Complete patient management",
                "register_feature2": "Smart test analysis",
                "register_feature3": "Complete protection and security",
                "register_testimonial_text": "\"Since I started using Pulse, I've been able to significantly improve the quality of care I provide to my patients\"",
                "register_doctor_name": "Dr. Fatima Ahmed",
                "register_doctor_specialty": "Internal Medicine Specialist",
                "register_doctors_count": "1,247",
                "register_doctors_registered": "Doctors Registered",
                "register_patients_count": "12,589",
                "register_patients_served": "Patients Served",
                "register_title_main": "Create Your Account!",
                "register_subtitle": "Join the Pulse smart health system",
                "first_name_label": "First Name",
                "first_name_placeholder": "Enter first name",
                "last_name_label": "Last Name",
                "last_name_placeholder": "Enter last name",
                "phone_label": "Phone Number",
                "phone_placeholder": "Enter phone number",
                "specialty_label": "Medical Specialty",
                "choose_specialty": "Choose your specialty",
                "general_medicine": "General Medicine",
                "internal_medicine": "Internal Medicine",
                "cardiology": "Cardiology",
                "endocrinology": "Endocrinology",
                "other_specialty": "Other Specialty",
                "license_label": "Medical License Number",
                "license_placeholder": "Enter license number",
                "confirm_password_label": "Confirm Password",
                "confirm_password_placeholder": "Re-enter password",
                "password_strength": "Password Strength",
                "password_placeholder_register": "Create a strong password",
                "agree_terms": "I agree to the",
                "terms_link": "Terms & Conditions",
                "and": "and",
                "privacy_link": "Privacy Policy",
                "register_button": "Create Account",
                "signup_google": "Sign up with Google",
                "have_account": "Already have an account?",
                "login_link": "Sign In",

                // === Dashboard ===
                "welcome_message": "Welcome back, Dr. {name}",
                "sidebar_dashboard": "Dashboard",
                "sidebar_patients": "Patients Management",
                "sidebar_analysis": "Test Analysis",
                "sidebar_reports": "Reports",
                "sidebar_notifications": "Notifications",
                "sidebar_settings": "Settings",
                "sidebar_logout": "Logout",
                "stat_total_patients": "Total Patients",
                "stat_total_tests": "Total Tests",
                "stat_pending_reviews": "Need Review",
                "stat_weekly_appointments": "This Week Appointments",
                "stat_add_patients": "Add Patients",
                "stat_add_tests": "Record Test",
                "stat_review_now": "Review Now",
                "stat_schedule_appointment": "Schedule Appointment",
                "quick_actions_title": "Quick Actions",
                "action_add_patient": "Add New Patient",
                "action_add_test": "Record New Test",
                "action_generate_report": "Generate Report",
                "action_book_appointment": "Book Appointment",
                "recent_patients_title": "Recently Added Patients",
                "recent_tests_title": "Recently Recorded Tests",
                "important_notifications_title": "Important Notifications",
                "view_all": "View All",
                "no_patients_message": "No patients registered yet",
                "no_tests_message": "No tests recorded yet",
                "no_notifications_message": "No notifications currently",
                "add_first_patient": "Add First Patient",
                "add_first_test": "Record First Test",
                "search_placeholder": "Search for patient or test...",
                "appointment_modal_title": "Book New Appointment",
                "select_patient_label": "Select Patient",
                "select_patient_option": "Select Patient",
                "appointment_date_label": "Appointment Date",
                "appointment_time_label": "Appointment Time",
                "appointment_type_label": "Appointment Type",
                "appointment_consultation": "Consultation",
                "appointment_followup": "Follow-up",
                "appointment_test": "Test",
                "appointment_review": "Results Review",
                "save_appointment_button": "Save Appointment",
                "cancel_button": "Cancel",

                // === Patients Management ===
                "patients_subtitle": "Manage patient records and medical data",
                "add_patient_button": "Add New Patient",
                "search_patients_placeholder": "Search by name or medical ID...",
                "filter_gender_label": "Filter:",
                "filter_all_patients": "All Patients",
                "filter_male": "Males Only",
                "filter_female": "Females Only",
                "sort_by_label": "Sort by:",
                "sort_newest": "Newest First",
                "sort_oldest": "Oldest First",
                "sort_name": "By Name",
                "export_data_button": "Export Data",
                "stat_total_patients": "Total Patients",
                "stat_male_patients": "Male Patients",
                "stat_female_patients": "Female Patients",
                "stat_this_month": "Added This Month",
                "patients_list_title": "Patients List",
                "no_patients_title": "No Patients Registered Yet",
                "no_patients_description": "Start by adding your first patient to the system",
                "add_first_patient": "Add First Patient",
                "showing_patients": "Showing",
                "of_patients": "of",
                "patient": "patient",
                "pagination_previous": "Previous",
                "pagination_next": "Next",
                "add_patient_modal_title": "Add New Patient",
                "patient_name_label": "Full Name *",
                "patient_name_placeholder": "Enter full name",
                "medical_id_label": "Medical ID *",
                "gender_label": "Gender *",
                "select_gender": "Select Gender",
                "gender_male": "Male",
                "gender_female": "Female",
                "birthdate_label": "Birth Date *",
                "height_label": "Height (cm)",
                "height_placeholder": "Enter height",
                "weight_label": "Weight (kg)",
                "weight_placeholder": "Enter weight",
                "blood_type_label": "Blood Type",
                "select_blood_type": "Select Blood Type",
                "address_label": "Address",
                "address_placeholder": "Enter address",
                "medical_notes_label": "Medical Notes",
                "medical_notes_placeholder": "Any additional medical information...",
                "delete_modal_title": "Confirm Delete",
                "delete_confirmation_message": "Are you sure you want to delete this patient?",
                "delete_warning_message": "All data associated with this patient will be deleted and this action cannot be undone.",
                "delete_patient_button": "Delete Patient",

                // === Test Analysis ===
                "analysis_subtitle": "Analyze test results and provide customized recommendations",
                "filter_type_label": "Test Type:",
                "filter_all_tests": "All Tests",
                "filter_status_label": "Status:",
                "filter_all_status": "All Status",
                "filter_normal": "Normal",
                "filter_warning": "Needs Review",
                "filter_critical": "Critical",
                "filter_date_label": "Period:",
                "filter_all_dates": "All Periods",
                "filter_today": "Today",
                "filter_week": "Week",
                "filter_month": "Month",
                "filter_year": "Year",
                "test_type_label": "Test Type *",
                "select_test_type": "Select Test Type",
                "test_date_label": "Test Date *",
                "test_lab_label": "Laboratory",
                "test_lab_placeholder": "Laboratory name",
                "test_notes_label": "Additional Notes",
                "test_notes_placeholder": "Any additional notes about the test...",

                // === Reports ===
                "reports_subtitle": "Create medical reports and detailed statistics",
                "report_type_patient": "Patient Report",
                "report_type_tests": "Test Report",
                "report_type_statistics": "General Statistics",
                "report_type_financial": "Financial Report",
                "quick_report_daily": "Daily Activity Summary",
                "quick_report_critical": "Critical Cases List",
                "quick_report_appointments": "Appointments Schedule",
                "generate_report_button": "Generate Report",
                "preview_report_button": "Preview Report",
                "print_report_button": "Print Report",
                "download_report_button": "Download Report",

                // === Notifications ===
                "notifications_subtitle": "Manage all notifications and alerts in your system",
                "mark_all_read": "Mark All as Read",
                "clear_all": "Clear All",
                "filter_status": "Status:",
                "filter_all_notifications": "All Notifications",
                "filter_unread": "Unread Only",
                "filter_read": "Read Only",
                "filter_type": "Type:",
                "filter_critical": "Critical",
                "filter_warning": "Warning",
                "filter_info": "Info",
                "filter_success": "Success",
                "filter_reminder": "Reminder",
                "filter_date": "Period:",
                "apply_filters": "Apply Filters",
                "reset_filters": "Reset Filters",

                // === Settings ===
                "settings_subtitle": "Manage system settings and profile",
                "settings_profile": "Profile",
                "settings_preferences": "Preferences",
                "settings_notifications": "Notifications",
                "settings_security": "Security",
                "settings_backup": "Backup",
                "settings_about": "About",
                "profile_title": "Profile",
                "profile_subtitle": "Manage your personal account information",
                "preferences_title": "Preferences",
                "preferences_subtitle": "Customize system settings according to your needs",
                "notifications_title": "Notification Settings",
                "notifications_subtitle": "Control notifications and alerts you receive",
                "security_title": "Security",
                "security_subtitle": "Manage your account security and password",
                "backup_title": "Backup",
                "backup_subtitle": "Manage data backups and restoration",
                "about_title": "About System",
                "about_subtitle": "Information about Pulse and system version",

                // === Additional Texts ===
                "weak_password": "Weak",
                "medium_password": "Medium",
                "strong_password": "Strong",
                "very_strong_password": "Very Strong",
                "loading": "Loading...",
                "success": "Success",
                "error": "Error",
                "warning": "Warning",
                "info": "Info",
                "save": "Save",
                "edit": "Edit",
                "delete": "Delete",
                "update": "Update",
                "create": "Create",
                "confirm": "Confirm",
                "back": "Back",
                "next": "Next",
                "previous": "Previous",
                "close": "Close",
                "open": "Open",
                "enable": "Enable",
                "disable": "Disable",
                "active": "Active",
                "inactive": "Inactive",
                "connected": "Connected",
                "disconnected": "Disconnected",
                "online": "Online",
                "offline": "Offline"
            }
        };
    }

    setupEventListeners() {
        // تبديل اللغة
        const langToggle = document.getElementById('langToggle');
        const langOptions = document.querySelectorAll('.lang-option');

        if (langToggle) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = langToggle.closest('.language-switcher').querySelector('.lang-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            });
        }

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = option.dataset.lang;
                if (lang) {
                    this.switchLanguage(lang);
                }
                const dropdown = option.closest('.lang-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            });
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                const dropdowns = document.querySelectorAll('.lang-dropdown');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // إعادة تطبيق اللغة عند تغيير الصفحة
        document.addEventListener('pageChanged', () => {
            this.applyLanguage(this.currentLang);
        });
    }

    switchLanguage(lang) {
        if (this.currentLang !== lang && this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('medical_language', lang);
            this.applyLanguage(lang);
            this.updatePageDirection(lang);
            this.dispatchLanguageChangeEvent(lang);
            
            // تأثير بصري عند تغيير اللغة
            this.playLanguageSwitchAnimation();
        }
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Translations for language "${lang}" not found`);
            return;
        }

        // تحديث العناصر ذات data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            this.updateElementText(element, lang);
        });

        // تحديث العناصر ذات data-i18n-ph (placeholders)
        const placeholderElements = document.querySelectorAll('[data-i18n-ph]');
        placeholderElements.forEach(element => {
            this.updateElementPlaceholder(element, lang);
        });

        // تحديث محتوى options في select
        const selectOptions = document.querySelectorAll('select option[data-i18n]');
        selectOptions.forEach(option => {
            this.updateElementText(option, lang);
        });

        // تحديث زر اللغة
        this.updateLanguageButton(lang);

        // تحديث عنوان الصفحة
        this.updatePageTitle(lang);
    }

    updateElementText(element, lang) {
        const key = element.getAttribute('data-i18n');
        const translation = this.translations[lang]?.[key];
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // لا نغير قيمة input، فقط placeholder
                if (element.hasAttribute('data-i18n-ph')) {
                    element.placeholder = translation;
                }
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
            
            // تأثير عند تغيير النص
            this.applyTextAnimation(element);
        }
    }

    updateElementPlaceholder(element, lang) {
        const key = element.getAttribute('data-i18n-ph');
        const translation = this.translations[lang]?.[key];
        
        if (translation) {
            element.placeholder = translation;
            this.applyTextAnimation(element);
        }
    }

    applyTextAnimation(element) {
        element.style.opacity = '0.7';
        element.style.transform = 'translateY(5px)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = 'all 0.3s ease';
        }, 50);
    }

    updateLanguageButton(lang) {
        const langBtn = document.querySelector('.lang-btn span');
        const translation = this.translations[lang]?.['nav_language'];
        
        if (langBtn && translation) {
            langBtn.textContent = translation;
        }
    }

    updatePageTitle(lang) {
        const title = document.querySelector('title');
        if (title && title.hasAttribute('data-i18n')) {
            const key = title.getAttribute('data-i18n');
            const translation = this.translations[lang]?.[key];
            if (translation) {
                title.textContent = translation;
            }
        }
    }

    updatePageDirection(lang) {
        const html = document.documentElement;
        
        if (lang === 'ar') {
            html.dir = 'rtl';
            html.lang = 'ar';
            html.classList.add('rtl');
            html.classList.remove('ltr');
            
            // تحديث CSS للاتجاه RTL
            document.body.classList.add('rtl');
            document.body.classList.remove('ltr');
        } else {
            html.dir = 'ltr';
            html.lang = 'en';
            html.classList.add('ltr');
            html.classList.remove('rtl');
            
            // تحديث CSS للاتجاه LTR
            document.body.classList.add('ltr');
            document.body.classList.remove('rtl');
        }
    }

    playLanguageSwitchAnimation() {
        const mainContent = document.querySelector('.auth-container') || 
                           document.querySelector('.container') || 
                           document.querySelector('main');
        
        if (mainContent) {
            mainContent.style.opacity = '0.8';
            mainContent.style.transform = 'scale(0.98)';
            mainContent.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'scale(1)';
            }, 300);
        }

        // تأثير النبض للأيقونة
        const globeIcon = document.querySelector('.lang-btn .fa-globe');
        if (globeIcon) {
            globeIcon.style.animation = 'medicalPulse 0.6s ease';
            setTimeout(() => {
                globeIcon.style.animation = '';
            }, 600);
        }
    }

    dispatchLanguageChangeEvent(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: { 
                language: lang,
                direction: lang === 'ar' ? 'rtl' : 'ltr'
            }
        });
        document.dispatchEvent(event);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    translate(key, lang = this.currentLang) {
        return this.translations[lang]?.[key] || key;
    }

    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
        
        if (lang === this.currentLang) {
            this.applyLanguage(lang);
        }
    }

    // دالة للحصول على جميع المفاتيح المتاحة
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    // دالة للتحقق من وجود ترجمة
    hasTranslation(key, lang = this.currentLang) {
        return !!this.translations[lang]?.[key];
    }

    isReady() {
        return this.isInitialized;
    }

    // إعادة تعيين اللغة إلى الافتراضي
    resetToDefault() {
        this.switchLanguage('ar');
    }
}

// إضافة تأثيرات CSS للغة
const languageStyles = `
    @keyframes medicalPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .rtl {
        text-align: right;
    }
    
    .ltr {
        text-align: left;
    }
    
    .lang-dropdown.show {
        animation: medicalSlideIn 0.2s ease;
    }
    
    @keyframes medicalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// إضافة الأنماط إلى head
const styleElement = document.createElement('style');
styleElement.textContent = languageStyles;
document.head.appendChild(styleElement);

// تهيئة مدير اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
    
    // إضافة حدث لمعالجة أخطاء الترجمة
    window.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-i18n-src')) {
            console.warn('Failed to load localized image:', e.target.src);
        }
    });
});

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}