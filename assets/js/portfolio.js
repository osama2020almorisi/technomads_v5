/* ============================================
   portfolio.js - نظام إدارة المشاريع الذكي
   TechNomads - Smart Portfolio System
   نسخة v3.0 - مع 67 مشروعاً
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
        // ===== المشاريع الأصلية =====
        'ecommerce-website': { cover: 'https://picsum.photos/id/20/800/600', gallery: ['https://picsum.photos/id/21/800/600', 'https://picsum.photos/id/22/800/600', 'https://picsum.photos/id/23/800/600'] },
        'pharmacy-website': { cover: 'https://picsum.photos/id/24/800/600', gallery: ['https://picsum.photos/id/25/800/600', 'https://picsum.photos/id/26/800/600', 'https://picsum.photos/id/27/800/600'] },
        'booking-system': { cover: 'https://picsum.photos/id/28/800/600', gallery: ['https://picsum.photos/id/29/800/600', 'https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/31/800/600'] },
        'financial-accountant': { cover: 'https://picsum.photos/id/32/800/600', gallery: ['https://picsum.photos/id/33/800/600', 'https://picsum.photos/id/34/800/600', 'https://picsum.photos/id/35/800/600'] },
        'health-system': { cover: 'https://picsum.photos/id/36/800/600', gallery: ['https://picsum.photos/id/37/800/600', 'https://picsum.photos/id/38/800/600', 'https://picsum.photos/id/39/800/600'] },
        'Cinema': { cover: 'https://picsum.photos/id/40/800/600', gallery: ['https://picsum.photos/id/41/800/600', 'https://picsum.photos/id/42/800/600', 'https://picsum.photos/id/43/800/600'] },
        'travel-agency': { cover: 'https://picsum.photos/id/44/800/600', gallery: ['https://picsum.photos/id/45/800/600', 'https://picsum.photos/id/46/800/600', 'https://picsum.photos/id/47/800/600'] },
        'app-store': { cover: 'https://picsum.photos/id/48/800/600', gallery: ['https://picsum.photos/id/49/800/600', 'https://picsum.photos/id/50/800/600', 'https://picsum.photos/id/51/800/600'] },
        'quiz-platform': { cover: 'https://picsum.photos/id/52/800/600', gallery: ['https://picsum.photos/id/53/800/600', 'https://picsum.photos/id/54/800/600', 'https://picsum.photos/id/55/800/600'] },
        'wit': { cover: 'https://picsum.photos/id/56/800/600', gallery: ['https://picsum.photos/id/57/800/600', 'https://picsum.photos/id/58/800/600', 'https://picsum.photos/id/59/800/600'] },
        'project-structure': { cover: 'https://picsum.photos/id/60/800/600', gallery: ['https://picsum.photos/id/61/800/600', 'https://picsum.photos/id/62/800/600', 'https://picsum.photos/id/63/800/600'] },
        'Cleaning Services': { cover: 'https://picsum.photos/id/64/800/600', gallery: ['https://picsum.photos/id/65/800/600', 'https://picsum.photos/id/66/800/600', 'https://picsum.photos/id/67/800/600'] },
        'delivery-app': { cover: 'https://picsum.photos/id/68/800/600', gallery: ['https://picsum.photos/id/69/800/600', 'https://picsum.photos/id/70/800/600', 'https://picsum.photos/id/71/800/600'] },
        'educational-app': { cover: 'https://picsum.photos/id/72/800/600', gallery: ['https://picsum.photos/id/73/800/600', 'https://picsum.photos/id/74/800/600', 'https://picsum.photos/id/75/800/600'] },
        'MedicalAnalysisApp': { cover: 'https://picsum.photos/id/76/800/600', gallery: ['https://picsum.photos/id/77/800/600', 'https://picsum.photos/id/78/800/600', 'https://picsum.photos/id/79/800/600'] },
        'treemix_app': { cover: 'https://picsum.photos/id/80/800/600', gallery: ['https://picsum.photos/id/81/800/600', 'https://picsum.photos/id/82/800/600', 'https://picsum.photos/id/83/800/600'] },
        'brand-identity': { cover: 'https://picsum.photos/id/84/800/600', gallery: ['https://picsum.photos/id/85/800/600', 'https://picsum.photos/id/86/800/600', 'https://picsum.photos/id/87/800/600'] },
        'logo-design': { cover: 'https://picsum.photos/id/88/800/600', gallery: ['https://picsum.photos/id/89/800/600', 'https://picsum.photos/id/90/800/600', 'https://picsum.photos/id/91/800/600'] },
        'age-calculator': { cover: 'https://picsum.photos/id/92/800/600', gallery: ['https://picsum.photos/id/93/800/600', 'https://picsum.photos/id/94/800/600', 'https://picsum.photos/id/95/800/600'] },
        'code-editor': { cover: 'https://picsum.photos/id/96/800/600', gallery: ['https://picsum.photos/id/97/800/600', 'https://picsum.photos/id/98/800/600', 'https://picsum.photos/id/99/800/600'] },
        'color-generator': { cover: 'https://picsum.photos/id/100/800/600', gallery: ['https://picsum.photos/id/101/800/600', 'https://picsum.photos/id/102/800/600', 'https://picsum.photos/id/103/800/600'] },
        'image-editor': { cover: 'https://picsum.photos/id/104/800/600', gallery: ['https://picsum.photos/id/105/800/600', 'https://picsum.photos/id/106/800/600', 'https://picsum.photos/id/107/800/600'] },
        'fileuploader': { cover: 'https://picsum.photos/id/108/800/600', gallery: ['https://picsum.photos/id/109/800/600', 'https://picsum.photos/id/110/800/600', 'https://picsum.photos/id/111/800/600'] },
        'localStorage': { cover: 'https://picsum.photos/id/112/800/600', gallery: ['https://picsum.photos/id/113/800/600', 'https://picsum.photos/id/114/800/600', 'https://picsum.photos/id/115/800/600'] },
        'wifi-auto-connect': { cover: 'https://picsum.photos/id/116/800/600', gallery: ['https://picsum.photos/id/117/800/600', 'https://picsum.photos/id/118/800/600', 'https://picsum.photos/id/119/800/600'] },
        'wifi-extractor': { cover: 'https://picsum.photos/id/120/800/600', gallery: ['https://picsum.photos/id/121/800/600', 'https://picsum.photos/id/122/800/600', 'https://picsum.photos/id/123/800/600'] },
        'memory-game-entertainment': { cover: 'https://picsum.photos/id/124/800/600', gallery: ['https://picsum.photos/id/125/800/600', 'https://picsum.photos/id/126/800/600', 'https://picsum.photos/id/127/800/600'] },
        'memory-game-projects': { cover: 'https://picsum.photos/id/200/800/600', gallery: ['https://picsum.photos/id/201/800/600', 'https://picsum.photos/id/202/800/600', 'https://picsum.photos/id/203/800/600'] },
        'marketing-campaign': { cover: 'https://picsum.photos/id/128/800/600', gallery: ['https://picsum.photos/id/129/800/600', 'https://picsum.photos/id/130/800/600', 'https://picsum.photos/id/131/800/600'] },
        'age-calculator-app': { cover: 'https://picsum.photos/id/132/800/600', gallery: ['https://picsum.photos/id/133/800/600', 'https://picsum.photos/id/134/800/600', 'https://picsum.photos/id/135/800/600'] },
        'age-calculator-app-v2': { cover: 'https://picsum.photos/id/136/800/600', gallery: ['https://picsum.photos/id/137/800/600', 'https://picsum.photos/id/138/800/600', 'https://picsum.photos/id/139/800/600'] },
        'HarMur-Service-PRO': { cover: 'https://picsum.photos/id/140/800/600', gallery: ['https://picsum.photos/id/141/800/600', 'https://picsum.photos/id/142/800/600', 'https://picsum.photos/id/143/800/600'] },
        'harmurservice-V1': { cover: 'https://picsum.photos/id/144/800/600', gallery: ['https://picsum.photos/id/145/800/600', 'https://picsum.photos/id/146/800/600', 'https://picsum.photos/id/147/800/600'] },
        'aman_travel_system': { cover: 'https://picsum.photos/id/148/800/600', gallery: ['https://picsum.photos/id/149/800/600', 'https://picsum.photos/id/150/800/600', 'https://picsum.photos/id/151/800/600'] },
        'localStorage-V1': { cover: 'https://picsum.photos/id/152/800/600', gallery: ['https://picsum.photos/id/153/800/600', 'https://picsum.photos/id/154/800/600', 'https://picsum.photos/id/155/800/600'] },
        'localStorage-V2': { cover: 'https://picsum.photos/id/156/800/600', gallery: ['https://picsum.photos/id/157/800/600', 'https://picsum.photos/id/158/800/600', 'https://picsum.photos/id/159/800/600'] },
        'Yemeni': { cover: 'https://picsum.photos/id/160/800/600', gallery: ['https://picsum.photos/id/161/800/600', 'https://picsum.photos/id/162/800/600', 'https://picsum.photos/id/163/800/600'] },
        'project_airline_booking': { cover: 'https://picsum.photos/id/164/800/600', gallery: ['https://picsum.photos/id/165/800/600', 'https://picsum.photos/id/166/800/600', 'https://picsum.photos/id/167/800/600'] },
        'Am-main': { cover: 'https://picsum.photos/id/168/800/600', gallery: ['https://picsum.photos/id/169/800/600', 'https://picsum.photos/id/170/800/600', 'https://picsum.photos/id/171/800/600'] },
        'y-main': { cover: 'https://picsum.photos/id/172/800/600', gallery: ['https://picsum.photos/id/173/800/600', 'https://picsum.photos/id/174/800/600', 'https://picsum.photos/id/175/800/600'] },
        'play-entertainment': { cover: 'https://picsum.photos/id/176/800/600', gallery: ['https://picsum.photos/id/177/800/600', 'https://picsum.photos/id/178/800/600', 'https://picsum.photos/id/179/800/600'] },
        'the-age': { cover: 'https://picsum.photos/id/180/800/600', gallery: ['https://picsum.photos/id/181/800/600', 'https://picsum.photos/id/182/800/600', 'https://picsum.photos/id/183/800/600'] },
        'code-lab': { cover: 'https://picsum.photos/id/184/800/600', gallery: ['https://picsum.photos/id/185/800/600', 'https://picsum.photos/id/186/800/600', 'https://picsum.photos/id/187/800/600'] },
        'color-generator-entertainment': { cover: 'https://picsum.photos/id/188/800/600', gallery: ['https://picsum.photos/id/189/800/600', 'https://picsum.photos/id/190/800/600', 'https://picsum.photos/id/191/800/600'] },
        'image-editor-entertainment': { cover: 'https://picsum.photos/id/192/800/600', gallery: ['https://picsum.photos/id/193/800/600', 'https://picsum.photos/id/194/800/600', 'https://picsum.photos/id/195/800/600'] },
        'quiz-game': { cover: 'https://picsum.photos/id/196/800/600', gallery: ['https://picsum.photos/id/197/800/600', 'https://picsum.photos/id/198/800/600', 'https://picsum.photos/id/199/800/600'] },
        'structure-explorer': { cover: 'https://picsum.photos/id/204/800/600', gallery: ['https://picsum.photos/id/205/800/600','https://picsum.photos/id/206/800/600','https://picsum.photos/id/207/800/600'] },

        // ===== المشاريع الجديدة =====
        'al-mohaseb-pro': { cover: 'https://picsum.photos/id/310/800/600', gallery: ['https://picsum.photos/id/311/800/600', 'https://picsum.photos/id/312/800/600', 'https://picsum.photos/id/313/800/600'] },
        'bidaya_reader': { cover: 'https://picsum.photos/id/320/800/600', gallery: ['https://picsum.photos/id/321/800/600', 'https://picsum.photos/id/322/800/600', 'https://picsum.photos/id/323/800/600'] },
        'bidaya-reader-pro': { cover: 'https://picsum.photos/id/330/800/600', gallery: ['https://picsum.photos/id/331/800/600', 'https://picsum.photos/id/332/800/600', 'https://picsum.photos/id/333/800/600'] },
        'ward-epub': { cover: 'https://picsum.photos/id/340/800/600', gallery: ['https://picsum.photos/id/341/800/600'] },
        'ward-reader': { cover: 'https://picsum.photos/id/342/800/600', gallery: ['https://picsum.photos/id/343/800/600'] },
        'ward-reader2': { cover: 'https://picsum.photos/id/344/800/600', gallery: ['https://picsum.photos/id/345/800/600'] },
        'ward-reader3': { cover: 'https://picsum.photos/id/346/800/600', gallery: ['https://picsum.photos/id/347/800/600'] },
        'rang': { cover: 'https://picsum.photos/id/350/800/600', gallery: ['https://picsum.photos/id/351/800/600', 'https://picsum.photos/id/352/800/600', 'https://picsum.photos/id/353/800/600'] },
        'rang-website': { cover: 'https://picsum.photos/id/360/800/600', gallery: ['https://picsum.photos/id/361/800/600', 'https://picsum.photos/id/362/800/600', 'https://picsum.photos/id/363/800/600'] },
        'rang-website2': { cover: 'https://picsum.photos/id/370/800/600', gallery: ['https://picsum.photos/id/371/800/600', 'https://picsum.photos/id/372/800/600', 'https://picsum.photos/id/373/800/600'] },
        'ranj-paint': { cover: 'https://picsum.photos/id/380/800/600', gallery: ['https://picsum.photos/id/381/800/600', 'https://picsum.photos/id/382/800/600'] },
        'The_wisdom': { cover: 'https://picsum.photos/id/390/800/600', gallery: ['https://picsum.photos/id/391/800/600', 'https://picsum.photos/id/392/800/600'] },
        'The_wisdom1': { cover: 'https://picsum.photos/id/393/800/600', gallery: ['https://picsum.photos/id/394/800/600'] },
        'The_wisdom2': { cover: 'https://picsum.photos/id/395/800/600', gallery: ['https://picsum.photos/id/396/800/600'] },
        'tree': { cover: 'https://picsum.photos/id/400/800/600', gallery: ['https://picsum.photos/id/401/800/600', 'https://picsum.photos/id/402/800/600'] },
        'Tree2': { cover: 'https://picsum.photos/id/403/800/600', gallery: ['https://picsum.photos/id/404/800/600'] },
        'yunes-travel': { cover: 'https://picsum.photos/id/410/800/600', gallery: ['https://picsum.photos/id/411/800/600', 'https://picsum.photos/id/412/800/600', 'https://picsum.photos/id/413/800/600'] },
        'yunes-v2': { cover: 'https://picsum.photos/id/420/800/600', gallery: ['https://picsum.photos/id/421/800/600', 'https://picsum.photos/id/422/800/600', 'https://picsum.photos/id/423/800/600'] },
        'Link_management_v2': { cover: 'https://picsum.photos/id/430/800/600', gallery: ['https://picsum.photos/id/431/800/600'] },
        'age-calculator-app-v2-standalone': { cover: 'https://picsum.photos/id/440/800/600', gallery: ['https://picsum.photos/id/441/800/600'] }
    };

    // ============================================
    // ALL PROJECTS - جميع المشاريع (67 مشروع)
    // ============================================
    const PROJECTS_DB = [
        // ========== مواقع الويب ==========
        { id:'ecommerce-website', name:'متجر إلكتروني متكامل', category:'web', description:'منصة تجارة إلكترونية متطورة مع نظام إدارة متكامل للمنتجات والطلبات والعملاء', technologies:['HTML','CSS','JavaScript','PHP','MySQL'], date:'2024-01-15', featured:true, keywords:['متجر','إلكتروني','تسوق','منتجات','طلبات','عملاء'], link:'projects/ecommerce-website/index.html', rating:4.8 },
        { id:'pharmacy-website', name:'نظام إدارة الصيدلية', category:'web', description:'نظام متكامل لإدارة الصيدليات والمخزون والطلبات والوصفات الطبية', technologies:['HTML','CSS','JavaScript','PHP','MySQL'], date:'2024-02-20', featured:true, hasVersions:true, keywords:['صيدلية','أدوية','مخزون','وصفات','مبيعات'], link:'projects/pharmacy-website/index.html', rating:4.7 },
        { id:'booking-system', name:'نظام الحجز الإلكتروني', category:'web', description:'نظام حجز متكامل للفنادق والمنتجعات مع لوحة تحكم متطورة', technologies:['HTML','CSS','JavaScript','PHP'], date:'2023-12-10', featured:true, keywords:['حجز','فنادق','منتجعات','سياحة','غرف'], link:'projects/booking-system/index.html', rating:4.6 },
        { id:'financial-accountant', name:'النظام المالي والمحاسبي', category:'web', description:'نظام محاسبي متكامل لإدارة الحسابات والفواتير والميزانيات والتقارير المالية', technologies:['HTML','CSS','JavaScript','PHP','MySQL','Chart.js'], date:'2024-03-01', featured:true, keywords:['محاسبة','مالي','فواتير','حسابات','ميزانية','تقارير'], link:'projects/financial-accountant/index.html', rating:4.9 },
        { id:'al-mohaseb-pro', name:'المحاسب برو — al-mohaseb-pro', category:'web', description:'نظام محاسبي احترافي متقدم مع لوحة تحكم، عملاء، فواتير، منتجات، مصروفات، تقارير، وإعدادات. نظام متكامل بواجهات حديثة.', technologies:['HTML','CSS','JavaScript','LocalStorage','PWA'], date:'2024-09-01', featured:true, hasVersions:true, keywords:['محاسبة','فواتير','عملاء','منتجات','مصروفات','تقارير','برو','محاسب'], link:'projects/al-mohaseb-pro/index.html', rating:4.9, version:'1.0' },
        { id:'health-system', name:'نظام إدارة المستشفيات', category:'web', description:'نظام متكامل لإدارة المستشفيات والمواعيد والمرضى والسجلات الطبية', technologies:['HTML','CSS','JavaScript','PHP','MySQL'], date:'2024-01-05', keywords:['مستشفى','مرضى','مواعيد','طبي','سجلات'], link:'projects/health-system/index.html', rating:4.5 },
        { id:'Cinema', name:'نظام حجز تذاكر السينما', category:'web', description:'منصة متكاملة لعرض الأفلام وحجز التذاكر عبر الإنترنت', technologies:['HTML','CSS','JavaScript'], date:'2023-11-20', keywords:['سينما','أفلام','تذاكر','حجز','ترفيه'], link:'projects/Cinema/index.html', rating:4.3 },
        { id:'travel-agency', name:'نظام وكالة السفر', category:'web', description:'نظام متكامل لحجز الرحلات والفنادق وتأشيرات السفر والعمرة', technologies:['HTML','CSS','JavaScript','PHP','MySQL'], date:'2024-02-01', hasVersions:true, keywords:['سفر','سياحة','رحلات','فنادق','تأشيرات','عمرة'], link:'projects/travel-agency/index.html', rating:4.4 },
        { id:'app-store', name:'متجر التطبيقات', category:'web', description:'منصة لعرض وتحميل التطبيقات مع نظام تقييم ومراجعات', technologies:['HTML','CSS','JavaScript'], date:'2024-01-20', keywords:['تطبيقات','متجر','تحميل','تقييم','مراجعات'], link:'projects/app-store/index.html', rating:4.2 },
        { id:'quiz-platform', name:'منصة الاختبارات', category:'web', description:'منصة متكاملة لإنشاء وإجراء الاختبارات والمسابقات التعليمية', technologies:['HTML','CSS','JavaScript','PHP'], date:'2023-12-15', keywords:['اختبارات','أسئلة','تعليم','مسابقات','تقييم'], link:'projects/quiz-platform/index.html', rating:4.1 },
        { id:'wit', name:'مشروع WIT', category:'web', description:'منصة ويب متكاملة لتقديم خدمات تقنية مبتكرة', technologies:['HTML','CSS','JavaScript'], date:'2024-01-10', keywords:['WIT','تقنية','خدمات','ابتكار'], link:'projects/wit/index.html', rating:4.0 },
        { id:'project-structure', name:'هيكل المشاريع', category:'web', description:'نظام متكامل لإدارة هيكلية المشاريع والملفات', technologies:['HTML','CSS','JavaScript'], date:'2023-12-01', keywords:['هيكل','مشاريع','ملفات','إدارة'], link:'projects/project-structure/index.html', rating:3.9 },
        { id:'Cleaning Services', name:'خدمات التنظيف المتكاملة', category:'web', description:'منصة متكاملة لخدمات التنظيف مع نظام حجز وتتبع وتقييم الخدمات', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-02-20', featured:true, hasVersions:true, keywords:['تنظيف','خدمات','حجز','تتبع','تقييم'], link:'projects/Cleaning%20Services/index.html', rating:4.6 },
        { id:'Am-main', name:'نظام أمان للسفر - الرئيسي', category:'web', description:'النظام الرئيسي لوكالة أمان للسفر مع جميع الخدمات المتكاملة', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-01-20', parent:'travel-agency', keywords:['أمان','سفر','وكالة','رحلات','عمرة'], link:'projects/travel-agency/Am-main/Am-main/index.html', rating:4.3 },
        { id:'y-main', name:'نظام السفر اليمني المتكامل', category:'web', description:'منصة متكاملة للسفر والسياحة مع نظام حجز متقدم وفنادق وتأشيرات', technologies:['HTML','CSS','JavaScript','PHP','MySQL'], date:'2024-02-01', parent:'travel-agency', keywords:['يمني','سفر','سياحة','فنادق','تأشيرات'], link:'projects/travel-agency/y-main/y-main/index.html', rating:4.5 },
        // ===== مواقع RANG =====
        { id:'rang', name:'موقع RANG', category:'web', description:'موقع خدمات دهانات وديكور مع 8 أقسام خدمات و20+ صفحة داخلية.', technologies:['HTML','CSS','JavaScript'], date:'2024-06-15', hasVersions:true, keywords:['rang','رنج','دهانات','ديكور','خدمات'], link:'projects/rang/index.html', rating:4.4 },
        { id:'rang-website', name:'RANG Website الكامل', category:'web', description:'الموقع الكامل لـRANG مع 11 قسماً: مدن (40 صفحة)، دهانات، مظلات، بيوت شعر، هناجر، ترميم، عزل مائي، تنسيق حدائق، برجولات، سواتر، مقاولات، ديكورات.', technologies:['HTML','CSS','JavaScript'], date:'2024-07-01', featured:true, hasVersions:true, keywords:['rang','رنج','دهانات','مظلات','بيوت شعر','هناجر','ترميم','عزل','برجولات','سواتر','مقاولات'], link:'projects/rang-website/index.html', rating:4.7 },
        { id:'rang-website2', name:'RANG Website V2', category:'web', description:'النسخة الثانية من موقع RANG مع تحسينات شاملة في الأداء والتصميم وSEO.', technologies:['HTML','CSS','JavaScript','SEO'], date:'2024-08-01', hasVersions:true, keywords:['rang','رنج','V2','دهانات','مظلات','ديكور'], link:'projects/rang-website2/index.html', rating:4.8, version:'2.0' },
        { id:'ranj-paint', name:'Ranj Paint', category:'web', description:'موقع خدمات دهانات احترافي مع معرض أعمال، خدمات، ومدونة.', technologies:['HTML','CSS','JavaScript'], date:'2024-05-20', keywords:['ranj','paint','دهانات','معرض','خدمات'], link:'projects/ranj-paint/index.html', rating:4.3 },
        // ===== وكالات السفر الجديدة =====
        { id:'yunes-travel', name:'Yunes Travel', category:'web', description:'موقع وكالة سفر حديث مع خدمات (تأشيرات، تذاكر، فنادق، عمرة، سياحة، تعليم)، مدن، مدونة، وباقات.', technologies:['HTML','CSS','JavaScript','PWA'], date:'2024-09-15', featured:true, hasVersions:true, keywords:['yunes','سفر','تأشيرات','تذاكر','فنادق','عمرة','سياحة','تعليم','باقات'], link:'projects/yunes-travel/index.html', rating:4.8 },
        { id:'yunes-v2', name:'Yunes Travel V2 (Next.js)', category:'web', description:'النسخة الثانية من Yunes Travel باستخدام Next.js + Prisma + Tailwind مع دعم i18n (عربي/إنجليزي) ولوحة تحكم.', technologies:['Next.js','React','TypeScript','Prisma','Tailwind','i18n'], date:'2024-10-01', featured:true, keywords:['yunes','next.js','react','typescript','prisma','tailwind'], link:'projects/yunes-v2/', rating:5.0, version:'2.0' },
        
        // ========== التطبيقات ==========
        { id:'delivery-app', name:'تطبيق التوصيل الذكي', category:'app', description:'تطبيق متكامل لتوصيل الطلبات مع تتبع مباشر للمندوبين', technologies:['HTML','CSS','JavaScript','PHP','MySQL','Google Maps API'], date:'2024-01-20', featured:true, keywords:['توصيل','طلبات','مندوبين','تتبع','GPS'], link:'projects/delivery-app/index.html', rating:4.7 },
        { id:'educational-app', name:'التطبيق التعليمي', category:'app', description:'منصة تعليمية تفاعلية للأطفال مع دروس تفاعلية وألعاب تعليمية', technologies:['HTML','CSS','JavaScript','PHP'], date:'2023-12-15', keywords:['تعليم','أطفال','دروس','ألعاب','تفاعلي'], link:'projects/educational-app/index.html', rating:4.4 },
        { id:'MedicalAnalysisApp', name:'تحليل البيانات الطبية', category:'app', description:'تطبيق متخصص لتحليل البيانات الطبية وإنشاء التقارير وإدارة المرضى', technologies:['HTML','CSS','JavaScript','PHP','MySQL','Chart.js'], date:'2024-02-10', hasVersions:true, keywords:['طبي','تحاليل','بيانات','تقارير','مرضى'], link:'projects/MedicalAnalysisApp/index.html', rating:4.8 },
        { id:'treemix_app', name:'تطبيق Treemix', category:'app', description:'تطبيق متخصص في تحليل البيانات وعرضها بشكل تفاعلي مع لوحة تحكم متقدمة', technologies:['HTML','CSS','JavaScript'], date:'2024-01-25', keywords:['Treemix','بيانات','تحليل','تفاعلي'], link:'projects/treemix_app/index.html', rating:4.2 },
        // ===== القرّاء والكتب =====
        { id:'bidaya_reader', name:'قارئ البداية والنهاية', category:'app', description:'قارئ كتب إلكترونية متكامل مع دعم EPUB، إشارات مرجعية، سجل قراءة، بحث، واستيراد. مع PWA للعمل دون اتصال.', technologies:['HTML','CSS','JavaScript','IndexedDB','EPUB.js','PWA'], date:'2024-08-15', featured:true, hasVersions:true, keywords:['قارئ','كتب','epub','قراءة','إشارات','مكتبة'], link:'projects/bidaya_reader/index.html', rating:4.9 },
        { id:'bidaya-reader-pro', name:'قارئ البداية الاحترافي', category:'app', description:'النسخة الاحترافية من قارئ البداية مع محرر، مكتبة، تصدير (PDF, DOCX, EPUB, TXT, JSON, HTML)، واستيراد شامل.', technologies:['HTML','CSS','JavaScript','IndexedDB','PDF.js','JSZip','PWA'], date:'2024-09-10', featured:true, hasVersions:true, keywords:['قارئ','محرر','تصدير','epub','pdf','docx','مكتبة','pro'], link:'projects/bidaya-reader-pro/index.html', rating:5.0, version:'2.0' },
        { id:'ward-epub', name:'قارئ Ward EPUB', category:'app', description:'قارئ EPUB خفيف وسريع مع دعم كامل لملفات الكتب الإلكترونية.', technologies:['HTML','CSS','JavaScript','EPUB.js'], date:'2024-07-20', keywords:['ward','قارئ','epub','كتب'], link:'projects/ward-epub/index.html', rating:4.3 },
        { id:'ward-reader', name:'قارئ Ward', category:'app', description:'قارئ كتب خفيف مع بحث وعمل دون اتصال.', technologies:['HTML','CSS','JavaScript','PWA'], date:'2024-07-25', hasVersions:true, keywords:['ward','قارئ','كتب','بحث'], link:'projects/ward-reader/index.html', rating:4.4 },
        { id:'ward-reader2', name:'قارئ Ward V2', category:'app', description:'النسخة الثانية من قارئ Ward مع تحسينات في الأداء والواجهة.', technologies:['HTML','CSS','JavaScript','PWA'], date:'2024-08-05', hasVersions:true, keywords:['ward','قارئ','V2','كتب'], link:'projects/ward-reader2/index.html', rating:4.5 },
        { id:'ward-reader3', name:'قارئ Ward V3', category:'app', description:'النسخة الثالثة من قارئ Ward — الأكثر تطوراً مع تحسينات شاملة.', technologies:['HTML','CSS','JavaScript','PWA'], date:'2024-08-20', hasVersions:true, keywords:['ward','قارئ','V3','كتب','مطور'], link:'projects/ward-reader3/index.html', rating:4.6 },
        // ===== ديوان الحكمة =====
        { id:'The_wisdom', name:'ديوان الحكمة V1', category:'app', description:'تطبيق ديوان الحكمة — مجموعة من الحكم والأقوال المرتبة، مع بحث ومشاركة. الإصدار الأول.', technologies:['HTML','CSS','JavaScript','JSON'], date:'2024-05-01', hasVersions:true, keywords:['ديوان','حكمة','أقوال','حكم','wisdom','V1'], link:'projects/The_wisdom/index.html', rating:4.2 },
        { id:'The_wisdom1', name:'ديوان الحكمة Cloud', category:'app', description:'نسخة سحابية من ديوان الحكمة مع Firebase للعمل عبر الأجهزة.', technologies:['HTML','CSS','JavaScript','Firebase','PWA'], date:'2024-06-20', hasVersions:true, keywords:['ديوان','حكمة','firebase','cloud','سحابة'], link:'projects/The_wisdom1/index.html', rating:4.4 },
        { id:'The_wisdom2', name:'ديوان الحكمة V2', category:'app', description:'الإصدار الثاني من ديوان الحكمة مع تحسينات في الأداء والتصميم.', technologies:['HTML','CSS','JavaScript','PWA'], date:'2024-07-15', hasVersions:true, keywords:['ديوان','حكمة','V2','wisdom'], link:'projects/The_wisdom2/index.html', rating:4.5, version:'2.0' },
        
        // ========== التصميم ==========
        { id:'brand-identity', name:'هوية العلامة التجارية', category:'design', description:'تصميم هوية بصرية متكاملة لعلامة تجارية تشمل الشعار والألوان والخطوط', technologies:['Adobe Illustrator','Adobe Photoshop','Figma'], date:'2024-01-10', featured:true, keywords:['هوية','علامة تجارية','شعار','ألوان','تصميم'], link:'projects/brand-identity/index.html', rating:4.9 },
        { id:'logo-design', name:'تصميم شعارات احترافية', category:'design', description:'مجموعة من التصاميم المبتكرة للشعارات لهوية العلامات التجارية', technologies:['Adobe Illustrator','Adobe Photoshop'], date:'2023-12-05', keywords:['شعارات','تصميم','هوية','علامة تجارية'], link:'projects/logo-design/index.html', rating:4.7 },
        
        // ========== الأدوات ==========
        { id:'age-calculator', name:'حاسبة العمر المتطورة', category:'tool', description:'أداة متطورة لحساب العمر بدقة مع تفاصيل اليوم والشهر والسنة وإدارة أعياد الميلاد', technologies:['HTML','CSS','JavaScript'], date:'2024-01-25', hasVersions:true, keywords:['عمر','حاسبة','أعياد ميلاد','تواريخ'], link:'projects/age-calculator/index.html', rating:4.6 },
        { id:'code-editor', name:'محرر الأكواد', category:'tool', description:'محرر أكواد متقدم مع تمييز الصيغ وتصحيح الأخطاء', technologies:['HTML','CSS','JavaScript','CodeMirror'], date:'2024-02-05', keywords:['محرر','أكواد','برمجة','تصحيح'], link:'projects/code-editor/index.html', rating:4.5 },
        { id:'color-generator', name:'مولد الألوان', category:'tool', description:'أداة احترافية لتوليد الألوان ونسخ الأكواد بسهولة', technologies:['HTML','CSS','JavaScript'], date:'2024-01-30', keywords:['ألوان','مولد','تصميم','أكواد'], link:'projects/color-generator/index.html', rating:4.4 },
        { id:'image-editor', name:'محرر الصور المتقدم', category:'tool', description:'تحرير الصور وتطبيق الفلاتر والتأثيرات بجودة عالية', technologies:['HTML','CSS','JavaScript','Canvas API'], date:'2024-02-15', keywords:['صور','تحرير','فلاتر','تأثيرات'], link:'projects/image-editor/index.html', rating:4.3 },
        { id:'fileuploader', name:'رفع الملفات', category:'tool', description:'نظام متكامل لرفع وإدارة الملفات بأنواع مختلفة', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-01-18', keywords:['رفع','ملفات','تحميل','إدارة'], link:'projects/fileuploader/index.html', rating:4.2 },
        { id:'localStorage', name:'نظام التخزين المحلي', category:'tool', description:'نظام متقدم لإدارة التخزين المحلي في المتصفح', technologies:['HTML','CSS','JavaScript'], date:'2024-02-01', hasVersions:true, keywords:['تخزين','محلي','متصفح','بيانات'], link:'projects/localStorage/index.html', rating:4.1 },
        { id:'wifi-auto-connect', name:'الاتصال التلقائي بالواي فاي', category:'tool', description:'أداة ذكية للاتصال التلقائي بشبكات الواي فاي', technologies:['HTML','CSS','JavaScript'], date:'2024-01-12', keywords:['واي فاي','اتصال','شبكات','تلقائي'], link:'projects/wifi-auto-connect/index.html', rating:4.0 },
        { id:'wifi-extractor', name:'مستخرج الواي فاي', category:'tool', description:'أداة لاستخراج معلومات شبكات الواي فاي', technologies:['HTML','CSS','JavaScript'], date:'2024-01-08', keywords:['واي فاي','استخراج','شبكات','معلومات'], link:'projects/wifi-extractor/index.html', rating:3.9 },
        // ===== الشجرة =====
        { id:'tree', name:'مستكشف الشجرة', category:'tool', description:'أداة لاستكشاف وعرض هيكلية المجلدات والملفات بشكل شجري مع بيانات JSON.', technologies:['HTML','CSS','JavaScript','JSON'], date:'2024-06-01', featured:true, hasVersions:true, keywords:['شجرة','tree','مجلدات','ملفات','هيكل','استكشاف'], link:'projects/tree/Index.html', rating:4.6 },
        { id:'Tree2', name:'مستكشف الشجرة V2', category:'tool', description:'النسخة المحسّنة من مستكشف الشجرة مع واجهة أفضل وأداء أسرع.', technologies:['HTML','CSS','JavaScript','JSON'], date:'2024-07-20', hasVersions:true, keywords:['شجرة','tree','V2','هيكل'], link:'projects/Tree2/index.html', rating:4.5 },
        // ===== أدوات إضافية =====
        { id:'Link_management_v2', name:'إدارة الروابط V2', category:'tool', description:'النسخة الثانية من أداة إدارة الروابط — أسرع وأذكى.', technologies:['HTML','CSS','JavaScript'], date:'2024-08-10', hasVersions:true, keywords:['روابط','إدارة','links','V2'], link:'projects/Link_management_v2/index.html', rating:4.2 },
        { id:'age-calculator-app-v2-standalone', name:'حاسبة العمر V2 (مستقل)', category:'tool', description:'النسخة المستقلة V2 من حاسبة العمر — بدون حاجة للمشروع الأصلي.', technologies:['HTML','CSS','JavaScript'], date:'2024-09-05', hasVersions:true, keywords:['عمر','حاسبة','V2','مستقل'], link:'projects/age-calculator-app-v2/index.html', rating:4.5 },
        
        // ========== الألعاب ==========
        { id:'memory-game-entertainment', name:'لعبة الذاكرة - Entertainment', category:'game', description:'لعبة ممتعة لتنشيط الذاكرة والتركيز مع مستويات متعددة', technologies:['HTML','CSS','JavaScript'], date:'2024-01-08', keywords:['لعبة','ذاكرة','تركيز','مستويات','entertainment'], link:'entertainment/memory-game.html', rating:4.5 },
        { id:'play-entertainment', name:'Play - Entertainment', category:'game', description:'منصة ألعاب تفاعلية متكاملة للترفيه والتسلية', technologies:['HTML','CSS','JavaScript'], date:'2024-01-15', keywords:['ألعاب','ترفيه','تفاعلي','play'], link:'entertainment/play.html', rating:4.3 },
        { id:'the-age', name:'The Age', category:'game', description:'لعبة تفاعلية ممتعة تعتمد على حساب العمر والتحديات', technologies:['HTML','CSS','JavaScript'], date:'2024-01-20', keywords:['عمر','لعبة','تحديات','تفاعلي'], link:'entertainment/the-age.html', rating:4.2 },
        { id:'code-lab', name:'Code Lab', category:'game', description:'معمل برمجة تفاعلي لتعلم البرمجة من خلال الألعاب', technologies:['HTML','CSS','JavaScript'], date:'2024-02-01', keywords:['برمجة','تعلم','ألعاب','تفاعلي'], link:'entertainment/code-lab.html', rating:4.6 },
        { id:'color-generator-entertainment', name:'Color Generator - Entertainment', category:'game', description:'أداة تفاعلية لتوليد الألوان بشكل ممتع ومسلي', technologies:['HTML','CSS','JavaScript'], date:'2024-01-25', keywords:['ألوان','توليد','تفاعلي','entertainment'], link:'entertainment/color-generator.html', rating:4.1 },
        { id:'image-editor-entertainment', name:'Image Editor - Entertainment', category:'game', description:'محرر صور تفاعلي مع تأثيرات ممتعة للترفيه', technologies:['HTML','CSS','JavaScript','Canvas API'], date:'2024-02-05', keywords:['صور','تحرير','تفاعلي','entertainment'], link:'entertainment/image-editor.html', rating:4.4 },
        { id:'quiz-game', name:'Quiz Game', category:'game', description:'لعبة أسئلة وثقافة عامة ممتعة مع مستويات متعددة', technologies:['HTML','CSS','JavaScript'], date:'2024-02-10', keywords:['أسئلة','ثقافة','لعبة','مستويات'], link:'entertainment/quiz-game.html', rating:4.7 },
        { id:'memory-game-projects', name:'لعبة الذاكرة - Projects', category:'game', description:'لعبة الذاكرة الاحترافية من مشاريعنا - إصدار متطور مع تصميم عصري', technologies:['HTML','CSS','JavaScript'], date:'2024-02-15', keywords:['لعبة','ذاكرة','احترافي','projects'], link:'projects/memory-game/index.html', rating:4.8, featured:true },
        
        // ========== التسويق ==========
        { id:'marketing-campaign', name:'حملة تسويقية رقمية', category:'marketing', description:'حملة تسويق متكاملة عبر وسائل التواصل الاجتماعي والإعلانات', technologies:['SEO','Social Media','Google Ads','Analytics'], date:'2024-02-20', keywords:['تسويق','إعلانات','سوشيال ميديا','SEO'], link:'projects/marketing-campaign/index.html', rating:4.6 },
        
        // ========== مشاريع فرعية ==========
        { id:'age-calculator-app', name:'حاسبة العمر - الإصدار الأول', category:'tool', description:'تطبيق متكامل لحساب العمر وإدارة أعياد الميلاد', technologies:['HTML','CSS','JavaScript'], date:'2024-01-10', parent:'age-calculator', keywords:['عمر','حاسبة','أعياد ميلاد','V1'], link:'projects/age-calculator/age-calculator-app/index.html', rating:4.3 },
        { id:'age-calculator-app-v2', name:'حاسبة العمر - الإصدار الثاني', category:'tool', description:'نسخة مطورة من حاسبة العمر مع ميزات إضافية', technologies:['HTML','CSS','JavaScript'], date:'2024-02-15', parent:'age-calculator', keywords:['عمر','حاسبة','أعياد ميلاد','V2'], link:'projects/age-calculator/age-calculator-app-v2/index.html', rating:4.6 },
        { id:'HarMur-Service-PRO', name:'خدمات التنظيف - الاحترافية', category:'web', description:'منصة متكاملة لخدمات التنظيف مع نظام حجز متقدم', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-02-01', parent:'Cleaning Services', keywords:['تنظيف','PRO','احترافي','خدمات'], link:'projects/Cleaning%20Services/HarMur-Service-PRO/index.html', rating:4.7 },
        { id:'harmurservice-V1', name:'خدمات التنظيف - V1', category:'web', description:'النسخة الأولى من منصة خدمات التنظيف', technologies:['HTML','CSS','JavaScript'], date:'2024-01-15', parent:'Cleaning Services', keywords:['تنظيف','V1','خدمات'], link:'projects/Cleaning%20Services/harmurservice-V1/index.html', rating:4.2 },
        { id:'aman_travel_system', name:'نظام أمان للسفر', category:'web', description:'نظام متكامل لحجز الرحلات والعمرة والتأشيرات', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-01-20', parent:'travel-agency', keywords:['أمان','سفر','رحلات','عمرة','تأشيرات'], link:'projects/travel-agency/aman_travel_system/index.html', rating:4.4 },
        { id:'Yemeni', name:'الوكالة اليمنية للسفر', category:'web', description:'منصة حجز السفر اليمنية المتكاملة', technologies:['HTML','CSS','JavaScript'], date:'2024-01-15', parent:'travel-agency', keywords:['يمني','سفر','وكالة','حجز'], link:'projects/travel-agency/Yemeni/index.html', rating:4.1 },
        { id:'project_airline_booking', name:'نظام حجز الطيران', category:'web', description:'نظام متكامل لحجز تذاكر الطيران', technologies:['HTML','CSS','JavaScript','PHP'], date:'2024-01-10', parent:'travel-agency', keywords:['طيران','حجز','تذاكر','رحلات'], link:'projects/travel-agency/project_airline_booking/%D9%85%D8%B4%D8%B1%D9%88%D8%B9-%D8%AD%D8%AC%D8%B2-%D8%A7%D9%84%D8%B7%D9%8A%D8%B1%D8%A7%D9%86/index.html', rating:4.3 },
        { id:'localStorage-V1', name:'التخزين المحلي V1', category:'tool', description:'الإصدار الأول من نظام إدارة التخزين المحلي', technologies:['HTML','CSS','JavaScript'], date:'2024-01-05', parent:'localStorage', keywords:['تخزين','محلي','V1'], link:'projects/localStorage/localStorage-V1/index.html', rating:3.8 },
        { id:'localStorage-V2', name:'التخزين المحلي V2', category:'tool', description:'الإصدار المطور من نظام إدارة التخزين المحلي', technologies:['HTML','CSS','JavaScript'], date:'2024-02-10', parent:'localStorage', keywords:['تخزين','محلي','V2','مطور'], link:'projects/localStorage/localStorage-V2/index.html', rating:4.2 },
        { id:'structure-explorer', name:'مستكشف هيكلية المشاريع', category:'tool', description:'أداة متقدمة لاستكشاف وعرض هيكلية أي مجلد مشروع بشكل شجري مع إمكانية نسخ الهيكلية وطي/فتح المجلدات.', technologies:['HTML','CSS','JavaScript','Local File API'], date:'2024-06-24', featured:true, hasVersions:true, keywords:['هيكلية','مشاريع','استكشاف','مجلدات','ملفات','شجري','نسخ'], link:'projects/project-structure/structure-explorer.html', rating:5.0, version:'2.0' }
    ];

    const CATEGORIES = {
        web: { label:'مواقع ويب', icon:'fa-globe' },
        app: { label:'تطبيقات', icon:'fa-mobile-alt' },
        design: { label:'تصميم', icon:'fa-paint-brush' },
        tool: { label:'أدوات', icon:'fa-tools' },
        game: { label:'ألعاب', icon:'fa-gamepad' },
        marketing: { label:'تسويق', icon:'fa-bullhorn' }
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

    document.addEventListener('DOMContentLoaded', async function() {
        await loadProjects();
        setupSearch();
        setupFilters();
        setupTechFilters();
        setupModal();
        setupPagination();
        setupTechToggle();
        renderProjects();
        updateStats();
        initDeepLinks();
        initOpenGraphFromUrl();
        setupBackToTopProgress();
        initAnimateObserver();
    });

    function initAnimateObserver() {
        var els = document.querySelectorAll('[data-animate]');
        if (!els.length) return;
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(function(el) { obs.observe(el); });
    }

    function setupBackToTopProgress() {
        var backToTop = document.getElementById('backToTop');
        if (!backToTop) return;
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function shareProject(projectId) {
        var project = projects.find(function(p) { return p.id === projectId; });
        if (!project) { showNotification('المشروع غير موجود', 'error'); return; }
        var url = window.location.origin + window.location.pathname + '#project-' + projectId;
        var shareText = 'شاهد مشروع ' + project.name + ' على TechNomads';
        if (navigator.share) {
            navigator.share({ title: project.name, text: shareText, url: url }).catch(function() {});
            return;
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
                showNotification('✅ تم نسخ رابط المشروع: ' + project.name, 'success');
            }).catch(function() { fallbackCopy(url, project.name); });
        } else { fallbackCopy(url, project.name); }
    }

    function fallbackCopy(url, projectName) {
        var textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('✅ تم نسخ رابط المشروع: ' + projectName, 'success');
        } catch (e) {
            showNotification('⚠️ فشل النسخ، الرابط: ' + url, 'error');
        }
        document.body.removeChild(textArea);
    }

    function initDeepLinks() {
        var hash = window.location.hash;
        if (hash && hash.startsWith('#project-')) {
            var projectId = hash.replace('#project-', '');
            var checkProjects = setInterval(function() {
                if (projects.length > 0) {
                    clearInterval(checkProjects);
                    var project = projects.find(function(p) { return p.id === projectId; });
                    if (project) {
                        setTimeout(function() {
                            openModal(projectId);
                            if (window.updateOpenGraph) window.updateOpenGraph(project);
                            var card = document.querySelector('[data-project-id="' + projectId + '"]');
                            if (card) {
                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                card.classList.add('highlight');
                                setTimeout(function() { card.classList.remove('highlight'); }, 3000);
                            }
                        }, 600);
                    }
                }
            }, 100);
        }
    }

    function updateUrlWithProject(projectId) {
        if (projectId) {
            window.history.pushState({ projectId: projectId }, '', window.location.pathname + '#project-' + projectId);
        } else {
            window.history.pushState({}, '', window.location.pathname);
        }
    }

    function showNotification(message, type) {
        type = type || 'success';
        var existing = document.querySelectorAll('.toast-notification');
        existing.forEach(function(el) { el.remove(); });
        var toast = document.createElement('div');
        toast.className = 'toast-notification ' + type;
        var icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = '<i class="fa-solid ' + icon + '"></i> ' + message;
        document.body.appendChild(toast);
        requestAnimationFrame(function() { toast.classList.add('show'); });
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 400);
        }, 3000);
    }

    function getProjectImages(projectId) {
        if (PROJECT_IMAGES[projectId]) return PROJECT_IMAGES[projectId];
        var hash = projectId.split('').reduce(function(acc, char) { return acc + char.charCodeAt(0); }, 0);
        var uniqueId = (hash % 200) + 1;
        return {
            cover: 'https://picsum.photos/id/' + uniqueId + '/800/600',
            gallery: [
                'https://picsum.photos/id/' + (uniqueId + 1) + '/800/600',
                'https://picsum.photos/id/' + (uniqueId + 2) + '/800/600',
                'https://picsum.photos/id/' + (uniqueId + 3) + '/800/600'
            ]
        };
    }

    async function loadProjects() {
        var cached = localStorage.getItem('portfolio_projects');
        var cacheTime = localStorage.getItem('portfolio_cache_time');
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CONFIG.cacheDuration) {
            try {
                projects = JSON.parse(cached);
                if (projects.length > 60) return; // تم التحديث
            } catch(e) {}
        }
        projects = PROJECTS_DB.map(function(project) {
            var images = getProjectImages(project.id);
            return {
                ...project,
                images: images.gallery,
                coverImage: images.cover,
                views: parseInt(localStorage.getItem('view_' + project.id)) || 0
            };
        });
        projects.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        localStorage.setItem('portfolio_cache_time', Date.now().toString());
        console.log('✅ ' + projects.length + ' projects loaded');
    }

    function setupTechFilters() {
        var container = document.getElementById('filterTechSection');
        if (!container) return;
        var allTechs = new Set();
        projects.forEach(function(p) { p.technologies.forEach(function(t) { allTechs.add(t); }); });
        var techs = Array.from(allTechs).sort();
        container.innerHTML = '<button class="filter-tech-btn active" data-tech="all">كل التقنيات</button>' +
            techs.map(function(t) { return '<button class="filter-tech-btn" data-tech="' + t + '">' + t + '</button>'; }).join('');
        container.querySelectorAll('.filter-tech-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.filter-tech-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentTechFilter = btn.dataset.tech === 'all' ? '' : btn.dataset.tech;
                currentPage = 1;
                renderProjects();
                updateSearchInfo(document.getElementById('searchResultsInfo'));
            });
        });
    }

    function setupTechToggle() {
        var toggleBtn = document.getElementById('techToggle');
        var techSection = document.getElementById('filterTechSection');
        if (!toggleBtn || !techSection) return;
        toggleBtn.addEventListener('click', function() {
            var isVisible = techSection.style.display !== 'none';
            techSection.style.display = isVisible ? 'none' : 'flex';
            this.querySelector('.fa-chevron-down').style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    function setupPagination() {
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                currentPage++;
                renderProjects();
            });
        }
    }

    function getFilteredProjects() {
        var filtered = projects.slice();
        if (currentFilter !== 'all') filtered = filtered.filter(function(p) { return p.category === currentFilter; });
        if (currentTechFilter) filtered = filtered.filter(function(p) { return p.technologies.indexOf(currentTechFilter) !== -1; });
        if (currentSearch) {
            var searchLower = currentSearch.toLowerCase();
            filtered = filtered.filter(function(project) {
                var nameMatch = project.name.toLowerCase().indexOf(searchLower) !== -1;
                var descMatch = project.description.toLowerCase().indexOf(searchLower) !== -1;
                var techMatch = project.technologies.some(function(t) { return t.toLowerCase().indexOf(searchLower) !== -1; });
                var categoryMatch = CATEGORIES[project.category] ? CATEGORIES[project.category].label.indexOf(searchLower) !== -1 : false;
                var idMatch = project.id.toLowerCase().indexOf(searchLower) !== -1;
                var keywords = project.keywords || [];
                var keywordMatch = keywords.some(function(k) { return k.toLowerCase().indexOf(searchLower) !== -1; });
                return nameMatch || descMatch || techMatch || categoryMatch || idMatch || keywordMatch;
            });
        }
        return filtered;
    }

    function setupSearch() {
        var searchInput = document.getElementById('searchInput');
        var clearBtn = document.getElementById('searchClear');
        var resetBtn = document.getElementById('resetSearchBtn');
        var resultsInfo = document.getElementById('searchResultsInfo');
        if (!searchInput) return;
        var debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                currentSearch = searchInput.value.trim().toLowerCase();
                currentPage = 1;
                renderProjects();
                updateSearchInfo(resultsInfo);
                if (clearBtn) clearBtn.style.display = currentSearch ? 'block' : 'none';
            }, 150);
        });
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
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
            resetBtn.addEventListener('click', function() {
                searchInput.value = '';
                currentSearch = '';
                currentFilter = 'all';
                currentTechFilter = '';
                currentPage = 1;
                document.querySelectorAll('.filter-btn').forEach(function(btn) {
                    btn.classList.toggle('active', btn.dataset.filter === 'all');
                });
                document.querySelectorAll('.filter-tech-btn').forEach(function(btn) {
                    btn.classList.toggle('active', btn.dataset.tech === 'all');
                });
                renderProjects();
                updateSearchInfo(resultsInfo);
                searchInput.focus();
                if (clearBtn) clearBtn.style.display = 'none';
            });
        }
        setupSearchSuggestions();
    }

    function setupSearchSuggestions() {
        var searchInput = document.getElementById('searchInput');
        var suggestionsContainer = document.getElementById('searchSuggestions');
        var suggestionsList = document.getElementById('suggestionsList');
        if (!searchInput || !suggestionsContainer || !suggestionsList) return;
        var suggestionTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            var query = this.value.trim().toLowerCase();
            if (query.length < 1) { suggestionsContainer.style.display = 'none'; return; }
            suggestionTimeout = setTimeout(function() {
                var suggestions = getSearchSuggestions(query);
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
    }

    function getSearchSuggestions(query) {
        var suggestions = [];
        var seen = new Set();
        projects.forEach(function(project) {
            if (project.name.toLowerCase().indexOf(query) !== -1 && !seen.has(project.name)) {
                seen.add(project.name);
                suggestions.push({ text: project.name, category: CATEGORIES[project.category] ? CATEGORIES[project.category].label : 'مشروع', type: 'project', id: project.id });
            }
        });
        var techSet = new Set();
        projects.forEach(function(project) {
            project.technologies.forEach(function(tech) {
                if (tech.toLowerCase().indexOf(query) !== -1 && !techSet.has(tech)) {
                    techSet.add(tech);
                    suggestions.push({ text: tech, category: 'تقنية', type: 'tech' });
                }
            });
        });
        Object.keys(CATEGORIES).forEach(function(key) {
            var value = CATEGORIES[key];
            if (value.label.indexOf(query) !== -1 && !seen.has(value.label)) {
                seen.add(value.label);
                suggestions.push({ text: value.label, category: 'تصنيف', type: 'category', filter: key });
            }
        });
        return suggestions.slice(0, 10);
    }

    function renderSuggestions(suggestions) {
        var list = document.getElementById('suggestionsList');
        if (!list) return;
        list.innerHTML = suggestions.map(function(s, index) {
            var icon = s.type === 'project' ? 'fa-folder-open' : s.type === 'tech' ? 'fa-code' : 'fa-tag';
            return '<div class="suggestion-item" data-index="' + index + '" data-type="' + s.type + '" data-id="' + (s.id || '') + '" data-filter="' + (s.filter || '') + '">' +
                '<i class="fa-solid ' + icon + '"></i>' +
                '<span class="suggestion-text">' + escapeHtml(s.text) + '</span>' +
                '<span class="suggestion-category">' + escapeHtml(s.category) + '</span>' +
                '</div>';
        }).join('');
        list.querySelectorAll('.suggestion-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var type = this.dataset.type;
                var text = this.querySelector('.suggestion-text').textContent;
                var filter = this.dataset.filter;
                if (type === 'category' && filter) {
                    currentFilter = filter;
                    document.querySelectorAll('.filter-btn').forEach(function(btn) {
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

    function setupFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var resultsInfo = document.getElementById('searchResultsInfo');
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
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
        var filtered = getFilteredProjects();
        var total = projects.length;
        if (currentSearch || currentFilter !== 'all' || currentTechFilter) {
            resultsInfo.textContent = 'عرض ' + filtered.length + ' من ' + total + ' مشروع';
            resultsInfo.style.display = 'block';
        } else {
            resultsInfo.style.display = 'none';
        }
    }

    function setupModal() {
        var modal = document.getElementById('projectModal');
        var closeBtn = document.getElementById('modalClose');
        if (!modal) return;
        modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
    }

    function renderProjects() {
        var grid = document.getElementById('projectsGrid');
        var emptyState = document.getElementById('emptyState');
        var projectsCountSpan = document.getElementById('projectsCount');
        var loadMoreContainer = document.getElementById('loadMoreContainer');
        if (!grid) return;
        allFilteredProjects = getFilteredProjects();
        var totalFiltered = allFilteredProjects.length;
        if (projectsCountSpan) projectsCountSpan.textContent = totalFiltered;
        if (totalFiltered === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        var start = 0;
        var end = currentPage * itemsPerPage;
        var displayProjects = allFilteredProjects.slice(start, end);
        if (loadMoreContainer) {
            if (end >= totalFiltered) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
                var loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) loadMoreBtn.textContent = 'تحميل المزيد (' + end + '/' + totalFiltered + ')';
            }
        }
        grid.innerHTML = displayProjects.map(function(project, index) {
            return createProjectCard(project, index, start + index);
        }).join('');
        setTimeout(function() {
            grid.querySelectorAll('.project-card').forEach(function(card, i) {
                setTimeout(function() { card.classList.add('visible'); }, i * 50);
            });
        }, 50);
        grid.querySelectorAll('.project-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.project-link') && !e.target.closest('.view-project-btn') && !e.target.closest('.share-btn')) {
                    openModal(card.dataset.projectId);
                }
            });
        });
        initAnimateObserver();
    }

    function createProjectCard(project, index, globalIndex) {
        var categoryInfo = CATEGORIES[project.category] || { label: 'مشروع', icon: 'fa-folder' };
        var dateFormatted = formatDate(project.date);
        var stars = renderStars(project.rating || 0);
        return '<article class="project-card" data-project-id="' + project.id + '" data-category="' + project.category + '">' +
            '<div class="project-card-media">' +
                '<img src="' + project.coverImage + '" alt="' + project.name + '" class="project-card-image" loading="lazy" width="800" height="600">' +
                '<div class="project-card-overlay">' +
                    '<a href="' + project.link + '" class="view-project-btn" onclick="event.stopPropagation();">' +
                        '<i class="fa-solid fa-eye"></i> عرض التفاصيل' +
                    '</a>' +
                '</div>' +
                '<span class="project-category-badge"><i class="fa-solid ' + categoryInfo.icon + '"></i> ' + categoryInfo.label + '</span>' +
                (project.featured ? '<span class="project-featured"><i class="fa-solid fa-star"></i> مميز</span>' : '') +
                (project.hasVersions ? '<span class="project-version-badge"><i class="fa-solid fa-code-branch"></i> إصدارات</span>' : '') +
            '</div>' +
            '<div class="project-card-content">' +
                '<h3 class="project-card-title">' + escapeHtml(project.name) + '</h3>' +
                '<p class="project-card-description">' + escapeHtml(project.description) + '</p>' +
                '<div class="project-rating">' +
                    '<span class="stars">' + stars + '</span>' +
                    '<span class="rating-count">(' + (project.rating || 0) + ')</span>' +
                '</div>' +
                '<div class="project-card-footer">' +
                    '<span class="project-date"><i class="fa-regular fa-calendar-alt"></i> ' + dateFormatted + '</span>' +
                    '<div class="project-links">' +
                        '<span class="project-views"><i class="fa-regular fa-eye"></i> ' + (project.views || 0) + '</span>' +
                        '<button class="project-link share-btn" onclick="event.stopPropagation(); window.PortfolioSystem.shareProject(\'' + project.id + '\')" aria-label="مشاركة ' + project.name + '">' +
                            '<i class="fa-solid fa-share-alt"></i>' +
                        '</button>' +
                        '<a href="' + project.link + '" class="project-link" onclick="event.stopPropagation();" aria-label="زيارة ' + project.name + '">' +
                            '<i class="fa-solid fa-arrow-left"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</article>';
    }

    function renderStars(rating) {
        var fullStars = Math.floor(rating);
        var halfStar = rating - fullStars >= 0.5;
        var html = '';
        for (var i = 0; i < fullStars; i++) html += '<i class="fa-solid fa-star"></i>';
        if (halfStar) html += '<i class="fa-solid fa-star-half-alt"></i>';
        var emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        for (var j = 0; j < emptyStars; j++) html += '<i class="fa-regular fa-star"></i>';
        return html;
    }

    function openModal(projectId) {
        updateUrlWithProject(projectId);
        var project = projects.find(function(p) { return p.id === projectId; });
        if (!project) return;
        currentModalProject = project;
        currentImageIndex = 0;
        project.views = (project.views || 0) + 1;
        localStorage.setItem('view_' + project.id, project.views);
        var modal = document.getElementById('projectModal');
        var modalContent = document.getElementById('modalContent');
        if (!modal || !modalContent) return;
        modalContent.innerHTML = buildModalContent(project);
        if (window.updateOpenGraph) window.updateOpenGraph(project);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setupGalleryNavigation(project);
        setupShareButtons(project);
    }

    function closeModal() {
        if (window.resetOpenGraph) window.resetOpenGraph();
        updateUrlWithProject(null);
        var modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        currentModalProject = null;
    }

    function buildModalContent(project) {
        var categoryInfo = CATEGORIES[project.category] || { label: 'مشروع', icon: 'fa-folder' };
        var galleryHtml = buildGalleryHtml(project);
        var stars = renderStars(project.rating || 0);
        return galleryHtml +
            '<div class="modal-body">' +
                '<div class="modal-header">' +
                    '<h2 class="modal-title">' + escapeHtml(project.name) + '</h2>' +
                    '<span class="modal-category"><i class="fa-solid ' + categoryInfo.icon + '"></i> ' + categoryInfo.label + '</span>' +
                '</div>' +
                '<p class="modal-description">' + escapeHtml(project.description) + '</p>' +
                '<div class="project-rating">' +
                    '<span class="stars">' + stars + '</span>' +
                    '<span class="rating-count">(' + (project.rating || 0) + ')</span>' +
                    '<span class="project-views" style="margin-right:auto"><i class="fa-regular fa-eye"></i> ' + (project.views || 0) + ' مشاهدة</span>' +
                '</div>' +
                '<div class="modal-details">' +
                    '<div class="modal-detail-item">' +
                        '<i class="fa-solid fa-check-circle"></i>' +
                        '<div><span class="modal-detail-label">الحالة</span><span class="modal-detail-value">مكتمل</span></div>' +
                    '</div>' +
                    '<div class="modal-detail-item">' +
                        '<i class="fa-regular fa-calendar-alt"></i>' +
                        '<div><span class="modal-detail-label">التاريخ</span><span class="modal-detail-value">' + formatDate(project.date) + '</span></div>' +
                    '</div>' +
                    '<div class="modal-detail-item">' +
                        '<i class="fa-solid fa-cogs"></i>' +
                        '<div>' +
                            '<span class="modal-detail-label">التقنيات</span>' +
                            '<div class="modal-tech-list">' +
                                project.technologies.map(function(tech) { return '<span class="modal-tech">' + escapeHtml(tech) + '</span>'; }).join('') +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-actions">' +
                    '<a href="' + project.link + '" target="_blank" class="modal-btn primary"><i class="fa-solid fa-external-link-alt"></i> زيارة المشروع</a>' +
                    '<button class="modal-btn share-btn" onclick="window.PortfolioSystem.shareProject(\'' + project.id + '\')"><i class="fa-solid fa-share-alt"></i> مشاركة</button>' +
                '</div>' +
                '<div class="modal-share">' +
                    '<button class="share-facebook" data-share="facebook"><i class="fa-brands fa-facebook-f"></i> فيسبوك</button>' +
                    '<button class="share-twitter" data-share="twitter"><i class="fa-brands fa-twitter"></i> تويتر</button>' +
                    '<button class="share-linkedin" data-share="linkedin"><i class="fa-brands fa-linkedin-in"></i> لينكدإن</button>' +
                    '<button class="share-copy" data-share="copy"><i class="fa-solid fa-link"></i> نسخ الرابط</button>' +
                '</div>' +
            '</div>';
    }

    function buildGalleryHtml(project) {
        if (!project.images || project.images.length === 0) {
            return '<div class="modal-gallery"><img src="' + project.coverImage + '" alt="' + project.name + '" class="modal-gallery-image"></div>';
        }
        return '<div class="modal-gallery">' +
            '<img src="' + project.images[0] + '" alt="' + project.name + '" class="modal-gallery-image" id="modalGalleryImage">' +
            (project.images.length > 1 ? 
                '<div class="gallery-nav">' +
                    '<button id="galleryPrev" aria-label="السابق"><i class="fa-solid fa-chevron-left"></i></button>' +
                    '<button id="galleryNext" aria-label="التالي"><i class="fa-solid fa-chevron-right"></i></button>' +
                '</div>' +
                '<div class="gallery-dots" id="galleryDots">' +
                    project.images.map(function(_, i) { return '<div class="gallery-dot ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '" role="button" aria-label="الصورة ' + (i + 1) + '"></div>'; }).join('') +
                '</div>' +
                '<div class="gallery-counter"><span id="galleryCurrent">1</span> / <span id="galleryTotal">' + project.images.length + '</span></div>' : '') +
        '</div>';
    }

    function setupGalleryNavigation(project) {
        if (!project.images || project.images.length <= 1) return;
        var prevBtn = document.getElementById('galleryPrev');
        var nextBtn = document.getElementById('galleryNext');
        var dots = document.querySelectorAll('.gallery-dot');
        var galleryImage = document.getElementById('modalGalleryImage');
        var currentSpan = document.getElementById('galleryCurrent');
        function updateImage(index) {
            currentImageIndex = index;
            if (galleryImage) {
                galleryImage.style.opacity = '0';
                setTimeout(function() {
                    galleryImage.src = project.images[index];
                    galleryImage.style.opacity = '1';
                }, 200);
            }
            if (currentSpan) currentSpan.textContent = index + 1;
            dots.forEach(function(dot, i) { dot.classList.toggle('active', i === index); });
        }
        if (prevBtn) prevBtn.addEventListener('click', function() {
            updateImage(currentImageIndex > 0 ? currentImageIndex - 1 : project.images.length - 1);
        });
        if (nextBtn) nextBtn.addEventListener('click', function() {
            updateImage(currentImageIndex < project.images.length - 1 ? currentImageIndex + 1 : 0);
        });
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() { updateImage(parseInt(this.dataset.index)); });
        });
    }

    function setupShareButtons(project) {
        var url = encodeURIComponent(window.location.href);
        var text = encodeURIComponent('شاهد مشروع ' + project.name + ' على TechNomads');
        document.querySelectorAll('.modal-share button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var shareType = this.dataset.share;
                var shareUrl = '';
                switch(shareType) {
                    case 'facebook': shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url; break;
                    case 'twitter': shareUrl = 'https://twitter.com/intent/tweet?text=' + text + '&url=' + url; break;
                    case 'linkedin': shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; break;
                    case 'copy':
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href).then(function() {
                                showNotification('✅ تم نسخ الرابط!', 'success');
                            });
                        } else { fallbackCopy(window.location.href, 'الرابط'); }
                        return;
                }
                if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
            });
        });
    }

    function updateStats() {
        var totalEl = document.getElementById('statTotal');
        var clientsEl = document.getElementById('statClients');
        var techEl = document.getElementById('statTech');
        if (totalEl) animateNumber(totalEl, 0, projects.length, 1500);
        if (clientsEl) animateNumber(clientsEl, 0, Math.floor(projects.length * 2.5), 1500);
        if (techEl) {
            var techSet = new Set();
            projects.forEach(function(p) { p.technologies.forEach(function(t) { techSet.add(t); }); });
            animateNumber(techEl, 0, techSet.size, 1500);
        }
    }

    function animateNumber(element, start, end, duration) {
        var startTime = Date.now();
        var diff = end - start;
        function update() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            element.textContent = Math.round(start + diff * progress);
            if (progress < 1) requestAnimationFrame(update);
        }
        update();
    }

    function formatDate(dateString) {
        if (!dateString) return 'قريباً';
        try {
            var date = new Date(dateString);
            return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        } catch { return dateString; }
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

    function updateOpenGraph(project) {
        if (!project) return;
        var imageUrl = project.coverImage || 'https://te-2026.netlify.app/assets/images/og/og-1.svg';
        var title = project.name + ' | TechNomads';
        var description = project.description.substring(0, 200);
        var url = window.location.origin + window.location.pathname + '#project-' + project.id;
        var ogTitle = document.getElementById('ogTitle');
        var ogDescription = document.getElementById('ogDescription');
        var ogImage = document.getElementById('ogImage');
        var ogUrl = document.getElementById('ogUrl');
        var twitterTitle = document.getElementById('twitterTitle');
        var twitterDescription = document.getElementById('twitterDescription');
        var twitterImage = document.getElementById('twitterImage');
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (ogImage) ogImage.setAttribute('content', imageUrl);
        if (ogUrl) ogUrl.setAttribute('content', url);
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
        if (twitterImage) twitterImage.setAttribute('content', imageUrl);
        document.title = title;
    }

    function resetOpenGraph() {
        var defaultTitle = 'معرض الأعمال | TechNomads — أكثر من 160 مشروعاً تقنياً';
        var defaultDescription = 'استعرض أكثر من 160 مشروعاً تقنياً متنوعاً في مجالات الويب والتطبيقات والتصميم والأدوات والألعاب';
        var defaultImage = 'https://te-2026.netlify.app/assets/images/og/og-1.svg';
        var defaultUrl = window.location.origin + window.location.pathname;
        var ogTitle = document.getElementById('ogTitle');
        var ogDescription = document.getElementById('ogDescription');
        var ogImage = document.getElementById('ogImage');
        var ogUrl = document.getElementById('ogUrl');
        var twitterTitle = document.getElementById('twitterTitle');
        var twitterDescription = document.getElementById('twitterDescription');
        var twitterImage = document.getElementById('twitterImage');
        if (ogTitle) ogTitle.setAttribute('content', defaultTitle);
        if (ogDescription) ogDescription.setAttribute('content', defaultDescription);
        if (ogImage) ogImage.setAttribute('content', defaultImage);
        if (ogUrl) ogUrl.setAttribute('content', defaultUrl);
        if (twitterTitle) twitterTitle.setAttribute('content', defaultTitle);
        if (twitterDescription) twitterDescription.setAttribute('content', defaultDescription);
        if (twitterImage) twitterImage.setAttribute('content', defaultImage);
        document.title = defaultTitle;
    }

    function initOpenGraphFromUrl() {
        var hash = window.location.hash;
        if (hash && hash.startsWith('#project-')) {
            var projectId = hash.replace('#project-', '');
            var project = projects.find(function(p) { return p.id === projectId; });
            if (project) { updateOpenGraph(project); return true; }
        }
        return false;
    }

    window.PortfolioSystem = {
        projects: function() { return projects; },
        refresh: function() { localStorage.removeItem('portfolio_projects'); loadProjects().then(function() { renderProjects(); }); },
        shareProject: shareProject,
        updateOpenGraph: updateOpenGraph,
        resetOpenGraph: resetOpenGraph,
        initOpenGraphFromUrl: initOpenGraphFromUrl,
        renderProjects: renderProjects
    };

    window.updateOpenGraph = updateOpenGraph;
    window.resetOpenGraph = resetOpenGraph;
    window.shareProject = shareProject;

    console.log('✅ Portfolio System Ready with ' + projects.length + ' projects');

})();