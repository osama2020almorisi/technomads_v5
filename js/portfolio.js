/* ============================================
   portfolio.js - نظام إدارة المشاريع الذكي
   TechNomads - Smart Portfolio System
   مع بحث متقدم وفلاتر متجاوبة للجوال
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        projectsPath: 'projects/',
        fallbackImage: 'https://placehold.co/800x600/2A2D7C/FFFFFF?text=TechNomads',
        cacheDuration: 3600000,
        itemsPerPage: 12
    };

    // ============================================
    // UNIQUE IMAGES FOR EACH PROJECT
    // ============================================
    const PROJECT_IMAGES = {
        'ecommerce-website': {
            cover: 'https://picsum.photos/id/20/800/600',
            gallery: ['https://picsum.photos/id/21/800/600', 'https://picsum.photos/id/22/800/600', 'https://picsum.photos/id/23/800/600']
        },
        'pharmacy-website': {
            cover: 'https://picsum.photos/id/24/800/600',
            gallery: ['https://picsum.photos/id/25/800/600', 'https://picsum.photos/id/26/800/600', 'https://picsum.photos/id/27/800/600']
        },
        'booking-system': {
            cover: 'https://picsum.photos/id/28/800/600',
            gallery: ['https://picsum.photos/id/29/800/600', 'https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/31/800/600']
        },
        'financial-accountant': {
            cover: 'https://picsum.photos/id/32/800/600',
            gallery: ['https://picsum.photos/id/33/800/600', 'https://picsum.photos/id/34/800/600', 'https://picsum.photos/id/35/800/600']
        },
        'health-system': {
            cover: 'https://picsum.photos/id/36/800/600',
            gallery: ['https://picsum.photos/id/37/800/600', 'https://picsum.photos/id/38/800/600', 'https://picsum.photos/id/39/800/600']
        },
        'Cinema': {
            cover: 'https://picsum.photos/id/40/800/600',
            gallery: ['https://picsum.photos/id/41/800/600', 'https://picsum.photos/id/42/800/600', 'https://picsum.photos/id/43/800/600']
        },
        'travel-agency': {
            cover: 'https://picsum.photos/id/44/800/600',
            gallery: ['https://picsum.photos/id/45/800/600', 'https://picsum.photos/id/46/800/600', 'https://picsum.photos/id/47/800/600']
        },
        'app-store': {
            cover: 'https://picsum.photos/id/48/800/600',
            gallery: ['https://picsum.photos/id/49/800/600', 'https://picsum.photos/id/50/800/600', 'https://picsum.photos/id/51/800/600']
        },
        'quiz-platform': {
            cover: 'https://picsum.photos/id/52/800/600',
            gallery: ['https://picsum.photos/id/53/800/600', 'https://picsum.photos/id/54/800/600', 'https://picsum.photos/id/55/800/600']
        },
        'wit': {
            cover: 'https://picsum.photos/id/56/800/600',
            gallery: ['https://picsum.photos/id/57/800/600', 'https://picsum.photos/id/58/800/600', 'https://picsum.photos/id/59/800/600']
        },
        'project-structure': {
            cover: 'https://picsum.photos/id/60/800/600',
            gallery: ['https://picsum.photos/id/61/800/600', 'https://picsum.photos/id/62/800/600', 'https://picsum.photos/id/63/800/600']
        },
        'Cleaning Services': {
            cover: 'https://picsum.photos/id/64/800/600',
            gallery: ['https://picsum.photos/id/65/800/600', 'https://picsum.photos/id/66/800/600', 'https://picsum.photos/id/67/800/600']
        },
        'delivery-app': {
            cover: 'https://picsum.photos/id/68/800/600',
            gallery: ['https://picsum.photos/id/69/800/600', 'https://picsum.photos/id/70/800/600', 'https://picsum.photos/id/71/800/600']
        },
        'educational-app': {
            cover: 'https://picsum.photos/id/72/800/600',
            gallery: ['https://picsum.photos/id/73/800/600', 'https://picsum.photos/id/74/800/600', 'https://picsum.photos/id/75/800/600']
        },
        'MedicalAnalysisApp': {
            cover: 'https://picsum.photos/id/76/800/600',
            gallery: ['https://picsum.photos/id/77/800/600', 'https://picsum.photos/id/78/800/600', 'https://picsum.photos/id/79/800/600']
        },
        'treemix_app': {
            cover: 'https://picsum.photos/id/80/800/600',
            gallery: ['https://picsum.photos/id/81/800/600', 'https://picsum.photos/id/82/800/600', 'https://picsum.photos/id/83/800/600']
        },
        'brand-identity': {
            cover: 'https://picsum.photos/id/84/800/600',
            gallery: ['https://picsum.photos/id/85/800/600', 'https://picsum.photos/id/86/800/600', 'https://picsum.photos/id/87/800/600']
        },
        'logo-design': {
            cover: 'https://picsum.photos/id/88/800/600',
            gallery: ['https://picsum.photos/id/89/800/600', 'https://picsum.photos/id/90/800/600', 'https://picsum.photos/id/91/800/600']
        },
        'age-calculator': {
            cover: 'https://picsum.photos/id/92/800/600',
            gallery: ['https://picsum.photos/id/93/800/600', 'https://picsum.photos/id/94/800/600', 'https://picsum.photos/id/95/800/600']
        },
        'code-editor': {
            cover: 'https://picsum.photos/id/96/800/600',
            gallery: ['https://picsum.photos/id/97/800/600', 'https://picsum.photos/id/98/800/600', 'https://picsum.photos/id/99/800/600']
        },
        'color-generator': {
            cover: 'https://picsum.photos/id/100/800/600',
            gallery: ['https://picsum.photos/id/101/800/600', 'https://picsum.photos/id/102/800/600', 'https://picsum.photos/id/103/800/600']
        },
        'image-editor': {
            cover: 'https://picsum.photos/id/104/800/600',
            gallery: ['https://picsum.photos/id/105/800/600', 'https://picsum.photos/id/106/800/600', 'https://picsum.photos/id/107/800/600']
        },
        'fileuploader': {
            cover: 'https://picsum.photos/id/108/800/600',
            gallery: ['https://picsum.photos/id/109/800/600', 'https://picsum.photos/id/110/800/600', 'https://picsum.photos/id/111/800/600']
        },
        'localStorage': {
            cover: 'https://picsum.photos/id/112/800/600',
            gallery: ['https://picsum.photos/id/113/800/600', 'https://picsum.photos/id/114/800/600', 'https://picsum.photos/id/115/800/600']
        },
        'wifi-auto-connect': {
            cover: 'https://picsum.photos/id/116/800/600',
            gallery: ['https://picsum.photos/id/117/800/600', 'https://picsum.photos/id/118/800/600', 'https://picsum.photos/id/119/800/600']
        },
        'wifi-extractor': {
            cover: 'https://picsum.photos/id/120/800/600',
            gallery: ['https://picsum.photos/id/121/800/600', 'https://picsum.photos/id/122/800/600', 'https://picsum.photos/id/123/800/600']
        },
        'memory-game-entertainment': {
            cover: 'https://picsum.photos/id/124/800/600',
            gallery: ['https://picsum.photos/id/125/800/600', 'https://picsum.photos/id/126/800/600', 'https://picsum.photos/id/127/800/600']
        },
        'memory-game-projects': {
            cover: 'https://picsum.photos/id/200/800/600',
            gallery: ['https://picsum.photos/id/201/800/600', 'https://picsum.photos/id/202/800/600', 'https://picsum.photos/id/203/800/600']
        },
        'marketing-campaign': {
            cover: 'https://picsum.photos/id/128/800/600',
            gallery: ['https://picsum.photos/id/129/800/600', 'https://picsum.photos/id/130/800/600', 'https://picsum.photos/id/131/800/600']
        },
        'age-calculator-app': {
            cover: 'https://picsum.photos/id/132/800/600',
            gallery: ['https://picsum.photos/id/133/800/600', 'https://picsum.photos/id/134/800/600', 'https://picsum.photos/id/135/800/600']
        },
        'age-calculator-app-v2': {
            cover: 'https://picsum.photos/id/136/800/600',
            gallery: ['https://picsum.photos/id/137/800/600', 'https://picsum.photos/id/138/800/600', 'https://picsum.photos/id/139/800/600']
        },
        'HarMur-Service-PRO': {
            cover: 'https://picsum.photos/id/140/800/600',
            gallery: ['https://picsum.photos/id/141/800/600', 'https://picsum.photos/id/142/800/600', 'https://picsum.photos/id/143/800/600']
        },
        'harmurservice-V1': {
            cover: 'https://picsum.photos/id/144/800/600',
            gallery: ['https://picsum.photos/id/145/800/600', 'https://picsum.photos/id/146/800/600', 'https://picsum.photos/id/147/800/600']
        },
        'aman_travel_system': {
            cover: 'https://picsum.photos/id/148/800/600',
            gallery: ['https://picsum.photos/id/149/800/600', 'https://picsum.photos/id/150/800/600', 'https://picsum.photos/id/151/800/600']
        },
        'localStorage-V1': {
            cover: 'https://picsum.photos/id/152/800/600',
            gallery: ['https://picsum.photos/id/153/800/600', 'https://picsum.photos/id/154/800/600', 'https://picsum.photos/id/155/800/600']
        },
        'localStorage-V2': {
            cover: 'https://picsum.photos/id/156/800/600',
            gallery: ['https://picsum.photos/id/157/800/600', 'https://picsum.photos/id/158/800/600', 'https://picsum.photos/id/159/800/600']
        },
        'Yemeni': {
            cover: 'https://picsum.photos/id/160/800/600',
            gallery: ['https://picsum.photos/id/161/800/600', 'https://picsum.photos/id/162/800/600', 'https://picsum.photos/id/163/800/600']
        },
        'project_airline_booking': {
            cover: 'https://picsum.photos/id/164/800/600',
            gallery: ['https://picsum.photos/id/165/800/600', 'https://picsum.photos/id/166/800/600', 'https://picsum.photos/id/167/800/600']
        },
        'Am-main': {
            cover: 'https://picsum.photos/id/168/800/600',
            gallery: ['https://picsum.photos/id/169/800/600', 'https://picsum.photos/id/170/800/600', 'https://picsum.photos/id/171/800/600']
        },
        'y-main': {
            cover: 'https://picsum.photos/id/172/800/600',
            gallery: ['https://picsum.photos/id/173/800/600', 'https://picsum.photos/id/174/800/600', 'https://picsum.photos/id/175/800/600']
        },
        'play-entertainment': {
            cover: 'https://picsum.photos/id/176/800/600',
            gallery: ['https://picsum.photos/id/177/800/600', 'https://picsum.photos/id/178/800/600', 'https://picsum.photos/id/179/800/600']
        },
        'the-age': {
            cover: 'https://picsum.photos/id/180/800/600',
            gallery: ['https://picsum.photos/id/181/800/600', 'https://picsum.photos/id/182/800/600', 'https://picsum.photos/id/183/800/600']
        },
        'code-lab': {
            cover: 'https://picsum.photos/id/184/800/600',
            gallery: ['https://picsum.photos/id/185/800/600', 'https://picsum.photos/id/186/800/600', 'https://picsum.photos/id/187/800/600']
        },
        'color-generator-entertainment': {
            cover: 'https://picsum.photos/id/188/800/600',
            gallery: ['https://picsum.photos/id/189/800/600', 'https://picsum.photos/id/190/800/600', 'https://picsum.photos/id/191/800/600']
        },
        'image-editor-entertainment': {
            cover: 'https://picsum.photos/id/192/800/600',
            gallery: ['https://picsum.photos/id/193/800/600', 'https://picsum.photos/id/194/800/600', 'https://picsum.photos/id/195/800/600']
        },
        'quiz-game': {
            cover: 'https://picsum.photos/id/196/800/600',
            gallery: ['https://picsum.photos/id/197/800/600', 'https://picsum.photos/id/198/800/600', 'https://picsum.photos/id/199/800/600']
        }
    };

    // ============================================
    // ALL PROJECTS - جميع المشاريع كاملة
    // ============================================
    const PROJECTS_DB = [
        // ========== مواقع الويب ==========
        { 
            id: 'ecommerce-website', 
            name: 'متجر إلكتروني متكامل', 
            category: 'web', 
            description: 'منصة تجارة إلكترونية متطورة مع نظام إدارة متكامل للمنتجات والطلبات والعملاء', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'], 
            date: '2024-01-15', 
            featured: true,
            keywords: ['متجر', 'إلكتروني', 'تسوق', 'منتجات', 'طلبات', 'عملاء'],
            link: 'projects/ecommerce-website/index.html',
            rating: 4.8
        },
        { 
            id: 'pharmacy-website', 
            name: 'نظام إدارة الصيدلية', 
            category: 'web', 
            description: 'نظام متكامل لإدارة الصيدليات والمخزون والطلبات والوصفات الطبية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'], 
            date: '2024-02-20', 
            featured: true, 
            hasVersions: true,
            keywords: ['صيدلية', 'أدوية', 'مخزون', 'وصفات', 'مبيعات'],
            link: 'projects/pharmacy-website/index.html',
            rating: 4.7
        },
        { 
            id: 'booking-system', 
            name: 'نظام الحجز الإلكتروني', 
            category: 'web', 
            description: 'نظام حجز متكامل للفنادق والمنتجعات مع لوحة تحكم متطورة', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2023-12-10', 
            featured: true,
            keywords: ['حجز', 'فنادق', 'منتجعات', 'سياحة', 'غرف'],
            link: 'projects/booking-system/index.html',
            rating: 4.6
        },
        { 
            id: 'financial-accountant', 
            name: 'النظام المالي والمحاسبي', 
            category: 'web', 
            description: 'نظام محاسبي متكامل لإدارة الحسابات والفواتير والميزانيات والتقارير المالية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Chart.js'], 
            date: '2024-03-01', 
            featured: true,
            keywords: ['محاسبة', 'مالي', 'فواتير', 'حسابات', 'ميزانية', 'تقارير'],
            link: 'projects/financial-accountant/index.html',
            rating: 4.9
        },
        { 
            id: 'health-system', 
            name: 'نظام إدارة المستشفيات', 
            category: 'web', 
            description: 'نظام متكامل لإدارة المستشفيات والمواعيد والمرضى والسجلات الطبية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'], 
            date: '2024-01-05',
            keywords: ['مستشفى', 'مرضى', 'مواعيد', 'طبي', 'سجلات'],
            link: 'projects/health-system/index.html',
            rating: 4.5
        },
        { 
            id: 'Cinema', 
            name: 'نظام حجز تذاكر السينما', 
            category: 'web', 
            description: 'منصة متكاملة لعرض الأفلام وحجز التذاكر عبر الإنترنت', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2023-11-20',
            keywords: ['سينما', 'أفلام', 'تذاكر', 'حجز', 'ترفيه'],
            link: 'projects/Cinema/index.html',
            rating: 4.3
        },
        { 
            id: 'travel-agency', 
            name: 'نظام وكالة السفر', 
            category: 'web', 
            description: 'نظام متكامل لحجز الرحلات والفنادق وتأشيرات السفر والعمرة', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'], 
            date: '2024-02-01', 
            hasVersions: true,
            keywords: ['سفر', 'سياحة', 'رحلات', 'فنادق', 'تأشيرات', 'عمرة'],
            link: 'projects/travel-agency/index.html',
            rating: 4.4
        },
        { 
            id: 'app-store', 
            name: 'متجر التطبيقات', 
            category: 'web', 
            description: 'منصة لعرض وتحميل التطبيقات مع نظام تقييم ومراجعات', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-20',
            keywords: ['تطبيقات', 'متجر', 'تحميل', 'تقييم', 'مراجعات'],
            link: 'projects/app-store/index.html',
            rating: 4.2
        },
        { 
            id: 'quiz-platform', 
            name: 'منصة الاختبارات', 
            category: 'web', 
            description: 'منصة متكاملة لإنشاء وإجراء الاختبارات والمسابقات التعليمية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2023-12-15',
            keywords: ['اختبارات', 'أسئلة', 'تعليم', 'مسابقات', 'تقييم'],
            link: 'projects/quiz-platform/index.html',
            rating: 4.1
        },
        { 
            id: 'wit', 
            name: 'مشروع WIT', 
            category: 'web', 
            description: 'منصة ويب متكاملة لتقديم خدمات تقنية مبتكرة', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-10',
            keywords: ['WIT', 'تقنية', 'خدمات', 'ابتكار'],
            link: 'projects/wit/index.html',
            rating: 4.0
        },
        { 
            id: 'project-structure', 
            name: 'هيكل المشاريع', 
            category: 'web', 
            description: 'نظام متكامل لإدارة هيكلية المشاريع والملفات', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2023-12-01',
            keywords: ['هيكل', 'مشاريع', 'ملفات', 'إدارة'],
            link: 'projects/project-structure/index.html',
            rating: 3.9
        },
        { 
            id: 'Cleaning Services', 
            name: 'خدمات التنظيف المتكاملة', 
            category: 'web', 
            description: 'منصة متكاملة لخدمات التنظيف مع نظام حجز وتتبع وتقييم الخدمات', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-02-20', 
            featured: true, 
            hasVersions: true,
            keywords: ['تنظيف', 'خدمات', 'حجز', 'تتبع', 'تقييم'],
            link: 'projects/Cleaning%20Services/index.html',
            rating: 4.6
        },
        { 
            id: 'Am-main', 
            name: 'نظام أمان للسفر - النسخة الرئيسية', 
            category: 'web', 
            description: 'النظام الرئيسي لوكالة أمان للسفر مع جميع الخدمات المتكاملة', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-01-20', 
            parent: 'travel-agency',
            keywords: ['أمان', 'سفر', 'وكالة', 'رحلات', 'عمرة'],
            link: 'projects/travel-agency/Am-main/Am-main/index.html',
            rating: 4.3
        },
        { 
            id: 'y-main', 
            name: 'نظام السفر اليمني المتكامل', 
            category: 'web', 
            description: 'منصة متكاملة للسفر والسياحة مع نظام حجز متقدم وفنادق وتأشيرات', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'], 
            date: '2024-02-01', 
            parent: 'travel-agency',
            keywords: ['يمني', 'سفر', 'سياحة', 'فنادق', 'تأشيرات'],
            link: 'projects/travel-agency/y-main/y-main/index.html',
            rating: 4.5
        },
        
        // ========== التطبيقات ==========
        { 
            id: 'delivery-app', 
            name: 'تطبيق التوصيل الذكي', 
            category: 'app', 
            description: 'تطبيق متكامل لتوصيل الطلبات مع تتبع مباشر للمندوبين', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Google Maps API'], 
            date: '2024-01-20', 
            featured: true,
            keywords: ['توصيل', 'طلبات', 'مندوبين', 'تتبع', 'GPS'],
            link: 'projects/delivery-app/index.html',
            rating: 4.7
        },
        { 
            id: 'educational-app', 
            name: 'التطبيق التعليمي', 
            category: 'app', 
            description: 'منصة تعليمية تفاعلية للأطفال مع دروس تفاعلية وألعاب تعليمية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2023-12-15',
            keywords: ['تعليم', 'أطفال', 'دروس', 'ألعاب', 'تفاعلي'],
            link: 'projects/educational-app/index.html',
            rating: 4.4
        },
        { 
            id: 'MedicalAnalysisApp', 
            name: 'تحليل البيانات الطبية', 
            category: 'app', 
            description: 'تطبيق متخصص لتحليل البيانات الطبية وإنشاء التقارير وإدارة المرضى', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Chart.js'], 
            date: '2024-02-10', 
            hasVersions: true,
            keywords: ['طبي', 'تحاليل', 'بيانات', 'تقارير', 'مرضى'],
            link: 'projects/MedicalAnalysisApp/index.html',
            rating: 4.8
        },
        { 
            id: 'treemix_app', 
            name: 'تطبيق Treemix', 
            category: 'app', 
            description: 'تطبيق متخصص في تحليل البيانات وعرضها بشكل تفاعلي مع لوحة تحكم متقدمة', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-25',
            keywords: ['Treemix', 'بيانات', 'تحليل', 'تفاعلي'],
            link: 'projects/treemix_app/index.html',
            rating: 4.2
        },
        
        // ========== التصميم ==========
        { 
            id: 'brand-identity', 
            name: 'هوية العلامة التجارية', 
            category: 'design', 
            description: 'تصميم هوية بصرية متكاملة لعلامة تجارية تشمل الشعار والألوان والخطوط', 
            technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'], 
            date: '2024-01-10', 
            featured: true,
            keywords: ['هوية', 'علامة تجارية', 'شعار', 'ألوان', 'تصميم'],
            link: 'projects/brand-identity/index.html',
            rating: 4.9
        },
        { 
            id: 'logo-design', 
            name: 'تصميم شعارات احترافية', 
            category: 'design', 
            description: 'مجموعة من التصاميم المبتكرة للشعارات لهوية العلامات التجارية', 
            technologies: ['Adobe Illustrator', 'Adobe Photoshop'], 
            date: '2023-12-05',
            keywords: ['شعارات', 'تصميم', 'هوية', 'علامة تجارية'],
            link: 'projects/logo-design/index.html',
            rating: 4.7
        },
        
        // ========== الأدوات ==========
        { 
            id: 'age-calculator', 
            name: 'حاسبة العمر المتطورة', 
            category: 'tool', 
            description: 'أداة متطورة لحساب العمر بدقة مع تفاصيل اليوم والشهر والسنة وإدارة أعياد الميلاد', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-25', 
            hasVersions: true,
            keywords: ['عمر', 'حاسبة', 'أعياد ميلاد', 'تواريخ'],
            link: 'projects/age-calculator/index.html',
            rating: 4.6
        },
        { 
            id: 'code-editor', 
            name: 'محرر الأكواد', 
            category: 'tool', 
            description: 'محرر أكواد متقدم مع تمييز الصيغ وتصحيح الأخطاء', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'CodeMirror'], 
            date: '2024-02-05',
            keywords: ['محرر', 'أكواد', 'برمجة', 'تصحيح'],
            link: 'projects/code-editor/index.html',
            rating: 4.5
        },
        { 
            id: 'color-generator', 
            name: 'مولد الألوان', 
            category: 'tool', 
            description: 'أداة احترافية لتوليد الألوان ونسخ الأكواد بسهولة', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-30',
            keywords: ['ألوان', 'مولد', 'تصميم', 'أكواد'],
            link: 'projects/color-generator/index.html',
            rating: 4.4
        },
        { 
            id: 'image-editor', 
            name: 'محرر الصور المتقدم', 
            category: 'tool', 
            description: 'تحرير الصور وتطبيق الفلاتر والتأثيرات بجودة عالية', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'Canvas API'], 
            date: '2024-02-15',
            keywords: ['صور', 'تحرير', 'فلاتر', 'تأثيرات'],
            link: 'projects/image-editor/index.html',
            rating: 4.3
        },
        { 
            id: 'fileuploader', 
            name: 'رفع الملفات', 
            category: 'tool', 
            description: 'نظام متكامل لرفع وإدارة الملفات بأنواع مختلفة', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-01-18',
            keywords: ['رفع', 'ملفات', 'تحميل', 'إدارة'],
            link: 'projects/fileuploader/index.html',
            rating: 4.2
        },
        { 
            id: 'localStorage', 
            name: 'نظام التخزين المحلي', 
            category: 'tool', 
            description: 'نظام متقدم لإدارة التخزين المحلي في المتصفح', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-01', 
            hasVersions: true,
            keywords: ['تخزين', 'محلي', 'متصفح', 'بيانات'],
            link: 'projects/localStorage/index.html',
            rating: 4.1
        },
        { 
            id: 'wifi-auto-connect', 
            name: 'الاتصال التلقائي بالواي فاي', 
            category: 'tool', 
            description: 'أداة ذكية للاتصال التلقائي بشبكات الواي فاي', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-12',
            keywords: ['واي فاي', 'اتصال', 'شبكات', 'تلقائي'],
            link: 'projects/wifi-auto-connect/index.html',
            rating: 4.0
        },
        { 
            id: 'wifi-extractor', 
            name: 'مستخرج الواي فاي', 
            category: 'tool', 
            description: 'أداة لاستخراج معلومات شبكات الواي فاي', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-08',
            keywords: ['واي فاي', 'استخراج', 'شبكات', 'معلومات'],
            link: 'projects/wifi-extractor/index.html',
            rating: 3.9
        },
        
        // ========== الألعاب - من entertainment ==========
        { 
            id: 'memory-game-entertainment', 
            name: 'لعبة الذاكرة - Entertainment', 
            category: 'game', 
            description: 'لعبة ممتعة لتنشيط الذاكرة والتركيز مع مستويات متعددة - إصدار entertainment', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-08',
            keywords: ['لعبة', 'ذاكرة', 'تركيز', 'مستويات', 'entertainment'],
            link: 'entertainment/memory-game.html',
            rating: 4.5
        },
        { 
            id: 'play-entertainment', 
            name: 'Play - Entertainment', 
            category: 'game', 
            description: 'منصة ألعاب تفاعلية متكاملة للترفيه والتسلية', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-15',
            keywords: ['ألعاب', 'ترفيه', 'تفاعلي', 'play'],
            link: 'entertainment/play.html',
            rating: 4.3
        },
        { 
            id: 'the-age', 
            name: 'The Age', 
            category: 'game', 
            description: 'لعبة تفاعلية ممتعة تعتمد على حساب العمر والتحديات', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-20',
            keywords: ['عمر', 'لعبة', 'تحديات', 'تفاعلي'],
            link: 'entertainment/the-age.html',
            rating: 4.2
        },
        { 
            id: 'code-lab', 
            name: 'Code Lab', 
            category: 'game', 
            description: 'معمل برمجة تفاعلي لتعلم البرمجة من خلال الألعاب', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-01',
            keywords: ['برمجة', 'تعلم', 'ألعاب', 'تفاعلي'],
            link: 'entertainment/code-lab.html',
            rating: 4.6
        },
        { 
            id: 'color-generator-entertainment', 
            name: 'Color Generator - Entertainment', 
            category: 'game', 
            description: 'أداة تفاعلية لتوليد الألوان بشكل ممتع ومسلي', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-25',
            keywords: ['ألوان', 'توليد', 'تفاعلي', 'entertainment'],
            link: 'entertainment/color-generator.html',
            rating: 4.1
        },
        { 
            id: 'image-editor-entertainment', 
            name: 'Image Editor - Entertainment', 
            category: 'game', 
            description: 'محرر صور تفاعلي مع تأثيرات ممتعة للترفيه', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'Canvas API'], 
            date: '2024-02-05',
            keywords: ['صور', 'تحرير', 'تفاعلي', 'entertainment'],
            link: 'entertainment/image-editor.html',
            rating: 4.4
        },
        { 
            id: 'quiz-game', 
            name: 'Quiz Game', 
            category: 'game', 
            description: 'لعبة أسئلة وثقافة عامة ممتعة مع مستويات متعددة', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-10',
            keywords: ['أسئلة', 'ثقافة', 'لعبة', 'مستويات'],
            link: 'entertainment/quiz-game.html',
            rating: 4.7
        },
        
        // ========== الألعاب - من projects ==========
        { 
            id: 'memory-game-projects', 
            name: 'لعبة الذاكرة - Projects', 
            category: 'game', 
            description: 'لعبة الذاكرة الاحترافية من مشاريعنا - إصدار متطور مع تصميم عصري', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-15',
            keywords: ['لعبة', 'ذاكرة', 'احترافي', 'projects', 'مطور'],
            link: 'projects/memory-game/index.html',
            rating: 4.8,
            featured: true
        },
        
        // ========== التسويق ==========
        { 
            id: 'marketing-campaign', 
            name: 'حملة تسويقية رقمية', 
            category: 'marketing', 
            description: 'حملة تسويق متكاملة عبر وسائل التواصل الاجتماعي والإعلانات', 
            technologies: ['SEO', 'Social Media', 'Google Ads', 'Analytics'], 
            date: '2024-02-20',
            keywords: ['تسويق', 'إعلانات', 'سوشيال ميديا', 'SEO'],
            link: 'projects/marketing-campaign/index.html',
            rating: 4.6
        },
        
        // ========== المشاريع الفرعية ==========
        { 
            id: 'age-calculator-app', 
            name: 'حاسبة العمر - الإصدار الأول', 
            category: 'tool', 
            description: 'تطبيق متكامل لحساب العمر وإدارة أعياد الميلاد', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-10', 
            parent: 'age-calculator',
            keywords: ['عمر', 'حاسبة', 'أعياد ميلاد', 'V1'],
            link: 'projects/age-calculator/age-calculator-app/index.html',
            rating: 4.3
        },
        { 
            id: 'age-calculator-app-v2', 
            name: 'حاسبة العمر - الإصدار الثاني', 
            category: 'tool', 
            description: 'نسخة مطورة من حاسبة العمر مع ميزات إضافية', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-15', 
            parent: 'age-calculator',
            keywords: ['عمر', 'حاسبة', 'أعياد ميلاد', 'V2', 'مطور'],
            link: 'projects/age-calculator/age-calculator-app-v2/index.html',
            rating: 4.6
        },
        { 
            id: 'HarMur-Service-PRO', 
            name: 'خدمات التنظيف - النسخة الاحترافية', 
            category: 'web', 
            description: 'منصة متكاملة لخدمات التنظيف مع نظام حجز متقدم', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-02-01', 
            parent: 'Cleaning Services',
            keywords: ['تنظيف', 'PRO', 'احترافي', 'خدمات'],
            link: 'projects/Cleaning%20Services/HarMur-Service-PRO/index.html',
            rating: 4.7
        },
        { 
            id: 'harmurservice-V1', 
            name: 'خدمات التنظيف - الإصدار الأول', 
            category: 'web', 
            description: 'النسخة الأولى من منصة خدمات التنظيف', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-15', 
            parent: 'Cleaning Services',
            keywords: ['تنظيف', 'V1', 'خدمات'],
            link: 'projects/Cleaning%20Services/harmurservice-V1/index.html',
            rating: 4.2
        },
        { 
            id: 'aman_travel_system', 
            name: 'نظام أمان للسفر', 
            category: 'web', 
            description: 'نظام متكامل لحجز الرحلات والعمرة والتأشيرات', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-01-20', 
            parent: 'travel-agency',
            keywords: ['أمان', 'سفر', 'رحلات', 'عمرة', 'تأشيرات'],
            link: 'projects/travel-agency/aman_travel_system/index.html',
            rating: 4.4
        },
        { 
            id: 'Yemeni', 
            name: 'الوكالة اليمنية للسفر', 
            category: 'web', 
            description: 'منصة حجز السفر اليمنية المتكاملة', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-15', 
            parent: 'travel-agency',
            keywords: ['يمني', 'سفر', 'وكالة', 'حجز'],
            link: 'projects/travel-agency/Yemeni/index.html',
            rating: 4.1
        },
        { 
            id: 'project_airline_booking', 
            name: 'نظام حجز الطيران', 
            category: 'web', 
            description: 'نظام متكامل لحجز تذاكر الطيران', 
            technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], 
            date: '2024-01-10', 
            parent: 'travel-agency',
            keywords: ['طيران', 'حجز', 'تذاكر', 'رحلات'],
            link: 'projects/travel-agency/project_airline_booking/%D9%85%D8%B4%D8%B1%D9%88%D8%B9-%D8%AD%D8%AC%D8%B2-%D8%A7%D9%84%D8%B7%D9%8A%D8%B1%D8%A7%D9%86/index.html',
            rating: 4.3
        },
        { 
            id: 'localStorage-V1', 
            name: 'نظام التخزين المحلي V1', 
            category: 'tool', 
            description: 'الإصدار الأول من نظام إدارة التخزين المحلي', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-01-05', 
            parent: 'localStorage',
            keywords: ['تخزين', 'محلي', 'V1'],
            link: 'projects/localStorage/localStorage-V1/index.html',
            rating: 3.8
        },
        { 
            id: 'localStorage-V2', 
            name: 'نظام التخزين المحلي V2', 
            category: 'tool', 
            description: 'الإصدار المطور من نظام إدارة التخزين المحلي', 
            technologies: ['HTML', 'CSS', 'JavaScript'], 
            date: '2024-02-10', 
            parent: 'localStorage',
            keywords: ['تخزين', 'محلي', 'V2', 'مطور'],
            link: 'projects/localStorage/localStorage-V2/index.html',
            rating: 4.2
        }
    ];

    const CATEGORIES = {
        web: { label: 'مواقع ويب', icon: 'fa-globe' },
        app: { label: 'تطبيقات', icon: 'fa-mobile-alt' },
        design: { label: 'تصميم', icon: 'fa-paint-brush' },
        tool: { label: 'أدوات', icon: 'fa-tools' },
        game: { label: 'ألعاب', icon: 'fa-gamepad' },
        marketing: { label: 'تسويق', icon: 'fa-bullhorn' }
    };

    let projects = [];
    let currentSearch = '';
    let currentFilter = 'all';
    let currentTechFilter = '';
    let currentModalProject = null;
    let currentImageIndex = 0;
    let currentPage = 1;
    let itemsPerPage = CONFIG.itemsPerPage;
    let allFilteredProjects = [];

    // Initialize
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('Portfolio page loaded, initializing...');
        await loadProjects();
        setupSearch();
        setupFilters();
        setupTechFilters();
        setupModal();
        setupScrollEffects();
        setupPagination();
        renderProjects();
        updateStats();
        setupTechToggle();
    });

    function getProjectImages(projectId) {
        if (PROJECT_IMAGES[projectId]) {
            return PROJECT_IMAGES[projectId];
        }
        const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const uniqueId = (hash % 200) + 1;
        return {
            cover: `https://picsum.photos/id/${uniqueId}/800/600`,
            gallery: [
                `https://picsum.photos/id/${uniqueId + 1}/800/600`,
                `https://picsum.photos/id/${uniqueId + 2}/800/600`,
                `https://picsum.photos/id/${uniqueId + 3}/800/600`
            ]
        };
    }

    async function loadProjects() {
        const cached = localStorage.getItem('portfolio_projects');
        const cacheTime = localStorage.getItem('portfolio_cache_time');
        
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CONFIG.cacheDuration) {
            projects = JSON.parse(cached);
            console.log('Projects loaded from cache:', projects.length);
            return;
        }
        
        projects = PROJECTS_DB.map(project => ({
            ...project,
            images: getProjectImages(project.id).gallery,
            coverImage: getProjectImages(project.id).cover,
            views: parseInt(localStorage.getItem('view_' + project.id)) || 0
        }));
        
        projects.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        localStorage.setItem('portfolio_cache_time', Date.now().toString());
        console.log('Projects loaded fresh:', projects.length);
    }

    function setupTechFilters() {
        const container = document.getElementById('filterTechSection');
        if (!container) return;
        
        const allTechs = new Set();
        projects.forEach(p => p.technologies.forEach(t => allTechs.add(t)));
        const techs = Array.from(allTechs).sort();
        
        container.innerHTML = `
            <button class="filter-tech-btn active" data-tech="all">كل التقنيات</button>
            ${techs.map(t => `<button class="filter-tech-btn" data-tech="${t}">${t}</button>`).join('')}
        `;
        
        container.querySelectorAll('.filter-tech-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.filter-tech-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTechFilter = btn.dataset.tech === 'all' ? '' : btn.dataset.tech;
                currentPage = 1;
                renderProjects();
                updateSearchInfo(document.getElementById('searchResultsInfo'));
                if (window.innerWidth <= 768) {
                    document.getElementById('filterTechSection').style.display = 'none';
                }
            });
        });
    }

    function setupTechToggle() {
        const toggleBtn = document.getElementById('techToggle');
        const techSection = document.getElementById('filterTechSection');
        
        if (!toggleBtn || !techSection) return;
        
        toggleBtn.addEventListener('click', function() {
            const isVisible = techSection.style.display !== 'none';
            techSection.style.display = isVisible ? 'none' : 'flex';
            this.querySelector('.fa-chevron-down').style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    function setupPagination() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                renderProjects();
            });
        }
    }

    function getFilteredProjects() {
        let filtered = [...projects];
        
        if (currentFilter !== 'all') {
            filtered = filtered.filter(p => p.category === currentFilter);
        }
        
        if (currentTechFilter) {
            filtered = filtered.filter(p => p.technologies.includes(currentTechFilter));
        }
        
        if (currentSearch) {
            const searchLower = currentSearch.toLowerCase();
            filtered = filtered.filter(project => {
                const nameMatch = project.name.toLowerCase().includes(searchLower);
                const descMatch = project.description.toLowerCase().includes(searchLower);
                const techMatch = project.technologies.some(t => t.toLowerCase().includes(searchLower));
                const categoryMatch = CATEGORIES[project.category]?.label.includes(searchLower) || false;
                const idMatch = project.id.toLowerCase().includes(searchLower);
                const keywords = project.keywords || [];
                const keywordMatch = keywords.some(k => k.toLowerCase().includes(searchLower));
                
                return nameMatch || descMatch || techMatch || categoryMatch || idMatch || keywordMatch;
            });
        }
        
        return filtered;
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        const resetBtn = document.getElementById('resetSearchBtn');
        const resultsInfo = document.getElementById('searchResultsInfo');
        
        if (!searchInput) return;
        
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = searchInput.value.trim().toLowerCase();
                currentPage = 1;
                renderProjects();
                updateSearchInfo(resultsInfo);
                if (clearBtn) {
                    clearBtn.style.display = currentSearch ? 'block' : 'none';
                }
            }, 150);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentSearch = searchInput.value.trim().toLowerCase();
                currentPage = 1;
                renderProjects();
                updateSearchInfo(resultsInfo);
            }
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                currentPage = 1;
                renderProjects();
                updateSearchInfo(resultsInfo);
                searchInput.focus();
                clearBtn.style.display = 'none';
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                currentFilter = 'all';
                currentTechFilter = '';
                currentPage = 1;
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === 'all'));
                document.querySelectorAll('.filter-tech-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tech === 'all'));
                renderProjects();
                updateSearchInfo(resultsInfo);
                searchInput.focus();
                if (clearBtn) clearBtn.style.display = 'none';
                if (window.innerWidth <= 768) {
                    document.getElementById('filterTechSection').style.display = 'none';
                }
            });
        }
        
        setupSearchSuggestions();
    }

    function setupSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        const suggestionsList = document.getElementById('suggestionsList');
        
        if (!searchInput || !suggestionsContainer || !suggestionsList) return;
        
        let suggestionTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            const query = this.value.trim().toLowerCase();
            
            if (query.length < 1) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            suggestionTimeout = setTimeout(() => {
                const suggestions = getSearchSuggestions(query);
                if (suggestions.length > 0) {
                    renderSuggestions(suggestions);
                    suggestionsContainer.style.display = 'block';
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            }, 200);
        });
        
        document.addEventListener('click', function(e) {
            if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        let selectedIndex = -1;
        searchInput.addEventListener('keydown', function(e) {
            const items = suggestionsList.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelectedSuggestion(items, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelectedSuggestion(items, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                items[selectedIndex].click();
            }
        });
    }

    function getSearchSuggestions(query) {
        const suggestions = [];
        const seen = new Set();
        
        projects.forEach(project => {
            if (project.name.toLowerCase().includes(query) && !seen.has(project.name)) {
                seen.add(project.name);
                suggestions.push({
                    text: project.name,
                    category: CATEGORIES[project.category]?.label || 'مشروع',
                    type: 'project',
                    id: project.id
                });
            }
        });
        
        const techSet = new Set();
        projects.forEach(project => {
            project.technologies.forEach(tech => {
                if (tech.toLowerCase().includes(query) && !techSet.has(tech)) {
                    techSet.add(tech);
                    suggestions.push({
                        text: tech,
                        category: 'تقنية',
                        type: 'tech'
                    });
                }
            });
        });
        
        Object.entries(CATEGORIES).forEach(([key, value]) => {
            if (value.label.includes(query) && !seen.has(value.label)) {
                seen.add(value.label);
                suggestions.push({
                    text: value.label,
                    category: 'تصنيف',
                    type: 'category',
                    filter: key
                });
            }
        });
        
        return suggestions.slice(0, 10);
    }

    function renderSuggestions(suggestions) {
        const list = document.getElementById('suggestionsList');
        if (!list) return;
        
        list.innerHTML = suggestions.map((s, index) => `
            <div class="suggestion-item" data-index="${index}" data-type="${s.type}" data-id="${s.id || ''}" data-filter="${s.filter || ''}">
                <i class="fas ${s.type === 'project' ? 'fa-folder-open' : s.type === 'tech' ? 'fa-code' : 'fa-tag'}"></i>
                <span class="suggestion-text">${escapeHtml(s.text)}</span>
                <span class="suggestion-category">${escapeHtml(s.category)}</span>
            </div>
        `).join('');
        
        list.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.type;
                const text = this.querySelector('.suggestion-text').textContent;
                const filter = this.dataset.filter;
                
                if (type === 'category' && filter) {
                    currentFilter = filter;
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.filter === filter);
                    });
                    document.getElementById('searchInput').value = '';
                    currentSearch = '';
                } else {
                    document.getElementById('searchInput').value = text;
                    currentSearch = text.toLowerCase();
                }
                
                currentPage = 1;
                document.getElementById('searchSuggestions').style.display = 'none';
                renderProjects();
                updateSearchInfo(document.getElementById('searchResultsInfo'));
            });
        });
    }

    function updateSelectedSuggestion(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        items[index]?.scrollIntoView({ block: 'nearest' });
    }

    function setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const resultsInfo = document.getElementById('searchResultsInfo');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                renderProjects();
                updateSearchInfo(resultsInfo);
            });
        });
    }

    function updateSearchInfo(resultsInfo) {
        if (!resultsInfo) return;
        const filtered = getFilteredProjects();
        const total = projects.length;
        if (currentSearch || currentFilter !== 'all' || currentTechFilter) {
            resultsInfo.textContent = `عرض ${filtered.length} من ${total} مشروع`;
            resultsInfo.style.display = 'block';
        } else {
            resultsInfo.style.display = 'none';
        }
    }

    function setupModal() {
        const modal = document.getElementById('projectModal');
        const closeBtn = document.getElementById('modalClose');
        
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function setupScrollEffects() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function renderProjects() {
        const grid = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('emptyState');
        const projectsCountSpan = document.getElementById('projectsCount');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        if (!grid) {
            console.error('Projects grid not found!');
            return;
        }
        
        allFilteredProjects = getFilteredProjects();
        const totalFiltered = allFilteredProjects.length;
        
        if (projectsCountSpan) projectsCountSpan.textContent = totalFiltered;
        
        if (totalFiltered === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        const start = 0;
        const end = currentPage * itemsPerPage;
        const displayProjects = allFilteredProjects.slice(start, end);
        
        if (loadMoreContainer) {
            if (end >= totalFiltered) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) {
                    loadMoreBtn.textContent = `تحميل المزيد (${end}/${totalFiltered})`;
                }
            }
        }
        
        grid.innerHTML = displayProjects.map((project, index) => createProjectCard(project, index)).join('');
        
        setTimeout(() => {
            const images = grid.querySelectorAll('.project-card-image');
            images.forEach(img => {
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load', () => img.classList.add('loaded'));
                    img.addEventListener('error', () => {
                        img.src = CONFIG.fallbackImage;
                        img.classList.add('loaded');
                    });
                }
            });
        }, 100);
        
        setTimeout(() => {
            grid.querySelectorAll('.project-card').forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), i * 50);
            });
        }, 50);
        
        grid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.project-link') && !e.target.closest('.view-project-btn')) {
                    const projectId = card.dataset.projectId;
                    openModal(projectId);
                }
            });
        });
    }

    function createProjectCard(project, index) {
        const categoryInfo = CATEGORIES[project.category] || { label: 'مشروع', icon: 'fa-folder' };
        const dateFormatted = formatDate(project.date);
        const stars = renderStars(project.rating || 0);
        
        return `
            <article class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-aos="fade-up" data-aos-delay="${Math.min(index * 50, 300)}">
                <div class="project-card-media">
                    <img src="${project.coverImage}" alt="${project.name}" class="project-card-image" loading="lazy" width="800" height="600">
                    <div class="project-card-overlay">
                        <a href="${project.link}" class="view-project-btn" onclick="event.stopPropagation();">
                            <i class="fas fa-eye"></i> عرض التفاصيل
                        </a>
                    </div>
                    <span class="project-category-badge"><i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}</span>
                    ${project.featured ? '<span class="project-featured"><i class="fas fa-star"></i> مميز</span>' : ''}
                    ${project.hasVersions ? '<span class="project-version-badge"><i class="fas fa-code-branch"></i> إصدارات</span>' : ''}
                </div>
                <div class="project-card-content">
                    <h3 class="project-card-title">${escapeHtml(project.name)}</h3>
                    <p class="project-card-description">${escapeHtml(project.description)}</p>
                    <div class="project-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-count">(${project.rating || 0})</span>
                    </div>
                    <div class="project-card-footer">
                        <span class="project-date"><i class="far fa-calendar-alt"></i> ${dateFormatted}</span>
                        <div class="project-links">
                            <span class="project-views"><i class="far fa-eye"></i> ${project.views || 0}</span>
                            <a href="${project.link}" class="project-link" onclick="event.stopPropagation();" aria-label="زيارة ${project.name}"><i class="fas fa-arrow-left"></i></a>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        let html = '';
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            html += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="far fa-star"></i>';
        }
        return html;
    }

    function openModal(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        currentModalProject = project;
        currentImageIndex = 0;
        
        project.views = (project.views || 0) + 1;
        localStorage.setItem('view_' + project.id, project.views);
        
        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;
        
        modalContent.innerHTML = buildModalContent(project);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setupGalleryNavigation(project);
        setupShareButtons(project);
    }

    function closeModal() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        currentModalProject = null;
    }

    function buildModalContent(project) {
        const categoryInfo = CATEGORIES[project.category] || { label: 'مشروع', icon: 'fa-folder' };
        const galleryHtml = buildGalleryHtml(project);
        const stars = renderStars(project.rating || 0);
        
        return `
            ${galleryHtml}
            <div class="modal-body">
                <div class="modal-header">
                    <h2 class="modal-title">${escapeHtml(project.name)}</h2>
                    <span class="modal-category"><i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}</span>
                </div>
                <p class="modal-description">${escapeHtml(project.description)}</p>
                
                <div class="project-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">(${project.rating || 0})</span>
                    <span class="project-views" style="margin-right: auto;"><i class="far fa-eye"></i> ${project.views || 0} مشاهدة</span>
                </div>
                
                <div class="modal-details">
                    <div class="modal-detail-item">
                        <i class="fas fa-check-circle"></i>
                        <div><span class="modal-detail-label">الحالة</span><span class="modal-detail-value">مكتمل</span></div>
                    </div>
                    <div class="modal-detail-item">
                        <i class="far fa-calendar-alt"></i>
                        <div><span class="modal-detail-label">التاريخ</span><span class="modal-detail-value">${formatDate(project.date)}</span></div>
                    </div>
                    <div class="modal-detail-item">
                        <i class="fas fa-cogs"></i>
                        <div>
                            <span class="modal-detail-label">التقنيات</span>
                            <div class="modal-tech-list">
                                ${project.technologies.map(tech => `<span class="modal-tech">${escapeHtml(tech)}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <a href="${project.link}" target="_blank" class="modal-btn primary"><i class="fas fa-external-link-alt"></i> زيارة المشروع</a>
                </div>
                
                <div class="modal-share">
                    <button class="share-facebook" data-share="facebook"><i class="fab fa-facebook-f"></i> فيسبوك</button>
                    <button class="share-twitter" data-share="twitter"><i class="fab fa-twitter"></i> تويتر</button>
                    <button class="share-linkedin" data-share="linkedin"><i class="fab fa-linkedin-in"></i> لينكدإن</button>
                    <button class="share-copy" data-share="copy"><i class="fas fa-link"></i> نسخ الرابط</button>
                </div>
            </div>
        `;
    }

    function buildGalleryHtml(project) {
        if (!project.images || project.images.length === 0) {
            return `
                <div class="modal-gallery">
                    <img src="${project.coverImage}" alt="${project.name}" class="modal-gallery-image">
                </div>
            `;
        }
        
        return `
            <div class="modal-gallery">
                <img src="${project.images[0]}" alt="${project.name}" class="modal-gallery-image" id="modalGalleryImage">
                ${project.images.length > 1 ? `
                    <div class="gallery-nav">
                        <button id="galleryPrev" aria-label="السابق"><i class="fas fa-chevron-left"></i></button>
                        <button id="galleryNext" aria-label="التالي"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="gallery-dots" id="galleryDots">
                        ${project.images.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" role="button" aria-label="الصورة ${i + 1}"></div>`).join('')}
                    </div>
                    <div class="gallery-counter"><span id="galleryCurrent">1</span> / <span id="galleryTotal">${project.images.length}</span></div>
                ` : ''}
            </div>
        `;
    }

    function setupGalleryNavigation(project) {
        if (!project.images || project.images.length <= 1) return;
        
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');
        const dots = document.querySelectorAll('.gallery-dot');
        const galleryImage = document.getElementById('modalGalleryImage');
        const currentSpan = document.getElementById('galleryCurrent');
        
        function updateImage(index) {
            currentImageIndex = index;
            if (galleryImage) {
                galleryImage.style.opacity = '0';
                setTimeout(() => {
                    galleryImage.src = project.images[index];
                    galleryImage.style.opacity = '1';
                }, 200);
            }
            if (currentSpan) currentSpan.textContent = index + 1;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : project.images.length - 1;
                updateImage(newIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = currentImageIndex < project.images.length - 1 ? currentImageIndex + 1 : 0;
                updateImage(newIndex);
            });
        }
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => updateImage(parseInt(dot.dataset.index)));
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && document.getElementById('projectModal').classList.contains('active')) {
                const newIndex = currentImageIndex < project.images.length - 1 ? currentImageIndex + 1 : 0;
                updateImage(newIndex);
            }
            if (e.key === 'ArrowLeft' && document.getElementById('projectModal').classList.contains('active')) {
                const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : project.images.length - 1;
                updateImage(newIndex);
            }
        });
    }

    function setupShareButtons(project) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`شاهد مشروع ${project.name} على TechNomads`);
        
        document.querySelectorAll('.modal-share button').forEach(btn => {
            btn.addEventListener('click', function() {
                const shareType = this.dataset.share;
                let shareUrl = '';
                
                switch(shareType) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'copy':
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            alert('تم نسخ الرابط!');
                        });
                        return;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    function updateStats() {
        const totalEl = document.getElementById('statTotal');
        const clientsEl = document.getElementById('statClients');
        const techEl = document.getElementById('statTech');
        
        if (totalEl) {
            animateNumber(totalEl, 0, projects.length, 1500);
        }
        if (clientsEl) {
            animateNumber(clientsEl, 0, Math.floor(projects.length * 2.5), 1500);
        }
        if (techEl) {
            const uniqueTechs = new Set(projects.flatMap(p => p.technologies));
            animateNumber(techEl, 0, uniqueTechs.size, 1500);
        }
    }

    function animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const diff = end - start;
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.round(start + diff * progress);
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        update();
    }

    function formatDate(dateString) {
        if (!dateString) return 'قريباً';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        } catch {
            return dateString;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    window.PortfolioSystem = {
        projects: () => projects,
        refresh: () => { localStorage.removeItem('portfolio_projects'); loadProjects().then(() => renderProjects()); },
        addProject: (project) => {
            PROJECTS_DB.push(project);
            localStorage.removeItem('portfolio_projects');
            loadProjects().then(() => renderProjects());
        }
    };
})();