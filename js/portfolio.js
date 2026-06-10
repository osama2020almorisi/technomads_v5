/* ============================================
   portfolio.js - نظام إدارة المشاريع الذكي
   TechNomads - Smart Portfolio System with Unique Images
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        projectsPath: 'projects/',
        fallbackImage: 'https://placehold.co/800x600/2A2D7C/FFFFFF?text=TechNomads',
        cacheDuration: 3600000
    };

    // ============================================
    // UNIQUE IMAGES FOR EACH PROJECT - صور فريدة لكل مشروع
    // ============================================
    // استخدام picsum بأرقام مختلفة لكل مشروع لضمان صور مختلفة
    const PROJECT_IMAGES = {
        // ========== مواقع الويب - Web Projects ==========
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
        
        // ========== التطبيقات - App Projects ==========
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
        
        // ========== التصميم - Design Projects ==========
        'brand-identity': {
            cover: 'https://picsum.photos/id/84/800/600',
            gallery: ['https://picsum.photos/id/85/800/600', 'https://picsum.photos/id/86/800/600', 'https://picsum.photos/id/87/800/600']
        },
        'logo-design': {
            cover: 'https://picsum.photos/id/88/800/600',
            gallery: ['https://picsum.photos/id/89/800/600', 'https://picsum.photos/id/90/800/600', 'https://picsum.photos/id/91/800/600']
        },
        
        // ========== الأدوات - Tools ==========
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
        
        // ========== الألعاب - Games ==========
        'memory-game': {
            cover: 'https://picsum.photos/id/124/800/600',
            gallery: ['https://picsum.photos/id/125/800/600', 'https://picsum.photos/id/126/800/600', 'https://picsum.photos/id/127/800/600']
        },
        
        // ========== التسويق - Marketing ==========
        'marketing-campaign': {
            cover: 'https://picsum.photos/id/128/800/600',
            gallery: ['https://picsum.photos/id/129/800/600', 'https://picsum.photos/id/130/800/600', 'https://picsum.photos/id/131/800/600']
        }
    };

    // ============================================
    // ALL PROJECTS - جميع المشاريع كاملة
    // ============================================
    const PROJECTS_DB = [
        // ========== مواقع الويب - Web Projects ==========
        { id: 'ecommerce-website', name: 'متجر إلكتروني متكامل', category: 'web', description: 'منصة تجارة إلكترونية متطورة مع نظام إدارة متكامل للمنتجات والطلبات', technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'], date: '2024-01-15', featured: true },
        { id: 'pharmacy-website', name: 'نظام إدارة الصيدلية', category: 'web', description: 'نظام متكامل لإدارة الصيدليات والمخزون والطلبات والوصفات الطبية', technologies: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'], date: '2024-02-20', featured: true, hasVersions: true },
        { id: 'booking-system', name: 'نظام الحجز الإلكتروني', category: 'web', description: 'نظام حجز متكامل للفنادق والمنتجعات مع لوحة تحكم متطورة', technologies: ['Laravel', 'Vue.js', 'MySQL', 'Tailwind'], date: '2023-12-10', featured: true },
        { id: 'financial-accountant', name: 'النظام المالي والمحاسبي', category: 'web', description: 'نظام محاسبي متكامل لإدارة الحسابات والفواتير والميزانيات', technologies: ['PHP', 'JavaScript', 'MySQL', 'Chart.js'], date: '2024-03-01', featured: true },
        { id: 'health-system', name: 'نظام إدارة المستشفيات', category: 'web', description: 'نظام متكامل لإدارة المستشفيات والمواعيد والمرضى والسجلات الطبية', technologies: ['Django', 'Python', 'PostgreSQL', 'Bootstrap'], date: '2024-01-05' },
        { id: 'Cinema', name: 'نظام حجز تذاكر السينما', category: 'web', description: 'منصة متكاملة لعرض الأفلام وحجز التذاكر عبر الإنترنت', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2023-11-20' },
        { id: 'travel-agency', name: 'نظام وكالة السفر', category: 'web', description: 'نظام متكامل لحجز الرحلات والفنادق وتأشيرات السفر', technologies: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'], date: '2024-02-01', hasVersions: true },
        { id: 'app-store', name: 'متجر التطبيقات', category: 'web', description: 'منصة لعرض وتحميل التطبيقات مع نظام تقييم ومراجعات', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2024-01-20' },
        { id: 'quiz-platform', name: 'منصة الاختبارات', category: 'web', description: 'منصة متكاملة لإنشاء وإجراء الاختبارات والمسابقات', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2023-12-15' },
        { id: 'wit', name: 'مشروع WIT', category: 'web', description: 'منصة ويب متكاملة لتقديم خدمات تقنية مبتكرة', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2024-01-10' },
        { id: 'project-structure', name: 'هيكل المشاريع', category: 'web', description: 'نظام متكامل لإدارة هيكلية المشاريع والملفات', technologies: ['HTML', 'CSS', 'JavaScript'], date: '2023-12-01' },
        { id: 'Cleaning Services', name: 'خدمات التنظيف المتكاملة', category: 'web', description: 'منصة متكاملة لخدمات التنظيف مع نظام حجز وتتبع وتقييم الخدمات', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2024-02-20', featured: true, hasVersions: true },
        
        // ========== التطبيقات - App Projects ==========
        { id: 'delivery-app', name: 'تطبيق التوصيل الذكي', category: 'app', description: 'تطبيق متكامل لتوصيل الطلبات مع تتبع مباشر للمندوبين', technologies: ['Flutter', 'Firebase', 'Google Maps API'], date: '2024-01-20', featured: true },
        { id: 'educational-app', name: 'التطبيق التعليمي', category: 'app', description: 'منصة تعليمية تفاعلية للأطفال مع دروس تفاعلية وألعاب تعليمية', technologies: ['React Native', 'Node.js', 'MongoDB'], date: '2023-12-15' },
        { id: 'MedicalAnalysisApp', name: 'تحليل البيانات الطبية', category: 'app', description: 'تطبيق متخصص لتحليل البيانات الطبية وإنشاء التقارير', technologies: ['Flutter', 'Python', 'TensorFlow'], date: '2024-02-10', hasVersions: true },
        { id: 'treemix_app', name: 'تطبيق Treemix', category: 'app', description: 'تطبيق متخصص في تحليل البيانات وعرضها بشكل تفاعلي', technologies: ['HTML', 'CSS', 'JavaScript'], date: '2024-01-25' },
        
        // ========== التصميم - Design Projects ==========
        { id: 'brand-identity', name: 'هوية العلامة التجارية', category: 'design', description: 'تصميم هوية بصرية متكاملة لعلامة تجارية تشمل الشعار والألوان والخطوط', technologies: ['Illustrator', 'Photoshop', 'Figma'], date: '2024-01-10', featured: true },
        { id: 'logo-design', name: 'تصميم شعارات احترافية', category: 'design', description: 'مجموعة من التصاميم المبتكرة للشعارات لهوية العلامات التجارية', technologies: ['Illustrator', 'Photoshop'], date: '2023-12-05' },
        
        // ========== الأدوات - Tools ==========
        { id: 'age-calculator', name: 'حاسبة العمر المتطورة', category: 'tool', description: 'أداة متطورة لحساب العمر بدقة مع تفاصيل اليوم والشهر والسنة', technologies: ['HTML', 'CSS', 'JavaScript'], date: '2024-01-25', hasVersions: true },
        { id: 'code-editor', name: 'محرر الأكواد', category: 'tool', description: 'محرر أكواد متقدم مع تمييز الصيغ وتصحيح الأخطاء', technologies: ['JavaScript', 'CodeMirror', 'CSS'], date: '2024-02-05' },
        { id: 'color-generator', name: 'مولد الألوان', category: 'tool', description: 'أداة احترافية لتوليد الألوان ونسخ الأكواد بسهولة', technologies: ['JavaScript', 'CSS'], date: '2024-01-30' },
        { id: 'image-editor', name: 'محرر الصور المتقدم', category: 'tool', description: 'تحرير الصور وتطبيق الفلاتر والتأثيرات بجودة عالية', technologies: ['Canvas API', 'JavaScript', 'CSS'], date: '2024-02-15' },
        { id: 'fileuploader', name: 'رفع الملفات', category: 'tool', description: 'نظام متكامل لرفع وإدارة الملفات بأنواع مختلفة', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2024-01-18' },
        { id: 'localStorage', name: 'نظام التخزين المحلي', category: 'tool', description: 'نظام متقدم لإدارة التخزين المحلي في المتصفح', technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'], date: '2024-02-01', hasVersions: true },
        { id: 'wifi-auto-connect', name: 'الاتصال التلقائي بالواي فاي', category: 'tool', description: 'أداة ذكية للاتصال التلقائي بشبكات الواي فاي', technologies: ['HTML', 'CSS', 'JavaScript'], date: '2024-01-12' },
        { id: 'wifi-extractor', name: 'مستخرج الواي فاي', category: 'tool', description: 'أداة لاستخراج معلومات شبكات الواي فاي', technologies: ['HTML', 'CSS', 'JavaScript'], date: '2024-01-08' },
        
        // ========== الألعاب - Games ==========
        { id: 'memory-game', name: 'لعبة الذاكرة', category: 'game', description: 'لعبة ممتعة لتنشيط الذاكرة والتركيز مع مستويات متعددة', technologies: ['JavaScript', 'CSS', 'HTML'], date: '2024-01-08' },
        
        // ========== التسويق - Marketing ==========
        { id: 'marketing-campaign', name: 'حملة تسويقية رقمية', category: 'marketing', description: 'حملة تسويق متكاملة عبر وسائل التواصل الاجتماعي والإعلانات', technologies: ['SEO', 'Social Media', 'Google Ads', 'Analytics'], date: '2024-02-20' }
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
    let currentModalProject = null;
    let currentImageIndex = 0;

    // Initialize
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('Portfolio page loaded, initializing...');
        await loadProjects();
        setupSearch();
        setupModal();
        setupScrollEffects();
        renderProjects();
        updateStats();
    });

    function getProjectImages(projectId) {
        // Return predefined unique images for each project
        if (PROJECT_IMAGES[projectId]) {
            return PROJECT_IMAGES[projectId];
        }
        // Default fallback with unique ID based on project name to ensure different images
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
        
        const loadPromises = PROJECTS_DB.map(project => loadProjectDetails(project));
        projects = await Promise.all(loadPromises);
        projects.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        localStorage.setItem('portfolio_cache_time', Date.now().toString());
        console.log('Projects loaded fresh:', projects.length);
    }

    async function loadProjectDetails(projectInfo) {
        const projectPath = `${CONFIG.projectsPath}${projectInfo.id}/`;
        const images = getProjectImages(projectInfo.id);
        
        let jsonData = {};
        try {
            const response = await fetch(`${projectPath}project.json`);
            if (response.ok) jsonData = await response.json();
        } catch (e) {
            // No project.json found
        }
        
        return {
            id: projectInfo.id,
            title: jsonData.title || projectInfo.name,
            description: jsonData.description || projectInfo.description,
            category: jsonData.category || projectInfo.category,
            technologies: jsonData.technologies || projectInfo.technologies,
            images: images.gallery,
            coverImage: images.cover,
            link: jsonData.link || `${projectPath}index.html`,
            github: jsonData.github || null,
            date: jsonData.date || projectInfo.date,
            status: jsonData.status || 'مكتمل',
            featured: projectInfo.featured || false,
            hasVersions: projectInfo.hasVersions || false
        };
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('searchClear');
        const resetBtn = document.getElementById('resetSearchBtn');
        
        if (!searchInput) return;
        
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentSearch = searchInput.value.trim().toLowerCase();
                renderProjects();
            }, 300);
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                renderProjects();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                renderProjects();
            });
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

    function filterProjects() {
        if (!currentSearch) return projects;
        
        return projects.filter(project => {
            const searchLower = currentSearch.toLowerCase();
            return project.title.toLowerCase().includes(searchLower) ||
                   project.description.toLowerCase().includes(searchLower) ||
                   project.technologies.some(t => t.toLowerCase().includes(searchLower));
        });
    }

    function renderProjects() {
        const grid = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('emptyState');
        const projectsCountSpan = document.getElementById('projectsCount');
        
        if (!grid) {
            console.error('Projects grid not found!');
            return;
        }
        
        const filtered = filterProjects();
        
        if (projectsCountSpan) projectsCountSpan.textContent = filtered.length;
        
        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        grid.innerHTML = filtered.map((project, index) => createProjectCard(project, index)).join('');
        
        // Add loaded class to images after they load
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
                if (!e.target.closest('.project-link')) {
                    const projectId = card.dataset.projectId;
                    openModal(projectId);
                }
            });
        });
    }

    function createProjectCard(project, index) {
        const categoryInfo = CATEGORIES[project.category] || { label: 'مشروع', icon: 'fa-folder' };
        const dateFormatted = formatDate(project.date);
        
        return `
            <article class="project-card" data-project-id="${project.id}" data-aos="fade-up" data-aos-delay="${Math.min(index * 50, 300)}">
                <div class="project-card-media">
                    <img src="${project.coverImage}" alt="${project.title}" class="project-card-image" loading="lazy">
                    <div class="project-card-overlay">
                        <button class="view-project-btn"><i class="fas fa-eye"></i> عرض التفاصيل</button>
                    </div>
                    <span class="project-category-badge"><i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}</span>
                    ${project.featured ? '<span class="project-featured"><i class="fas fa-star"></i> مميز</span>' : ''}
                    ${project.hasVersions ? '<span class="project-version-badge"><i class="fas fa-code-branch"></i> إصدارات</span>' : ''}
                </div>
                <div class="project-card-content">
                    <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
                    <p class="project-card-description">${escapeHtml(project.description)}</p>
                    <div class="project-card-footer">
                        <span class="project-date"><i class="far fa-calendar-alt"></i> ${dateFormatted}</span>
                        <div class="project-links">
                            ${project.github ? `<a href="${project.github}" target="_blank" class="project-link" onclick="event.stopPropagation();"><i class="fab fa-github"></i></a>` : ''}
                            <button class="project-link" onclick="event.stopPropagation();"><i class="fas fa-arrow-left"></i></button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function openModal(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        currentModalProject = project;
        currentImageIndex = 0;
        
        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;
        
        modalContent.innerHTML = buildModalContent(project);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setupGalleryNavigation(project);
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
        
        return `
            ${galleryHtml}
            <div class="modal-body">
                <div class="modal-header">
                    <h2 class="modal-title">${escapeHtml(project.title)}</h2>
                    <span class="modal-category"><i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}</span>
                </div>
                <p class="modal-description">${escapeHtml(project.description)}</p>
                
                <div class="modal-details">
                    <div class="modal-detail-item">
                        <i class="fas fa-check-circle"></i>
                        <div><span class="modal-detail-label">الحالة</span><span class="modal-detail-value">${project.status}</span></div>
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
                    ${project.github ? `<a href="${project.github}" target="_blank" class="modal-btn secondary"><i class="fab fa-github"></i> GitHub</a>` : ''}
                </div>
            </div>
        `;
    }

    function buildGalleryHtml(project) {
        if (!project.images || project.images.length === 0) {
            return `
                <div class="modal-gallery">
                    <img src="${project.coverImage}" alt="${project.title}" class="modal-gallery-image">
                </div>
            `;
        }
        
        return `
            <div class="modal-gallery">
                <img src="${project.images[0]}" alt="${project.title}" class="modal-gallery-image" id="modalGalleryImage">
                ${project.images.length > 1 ? `
                    <div class="gallery-nav">
                        <button id="galleryPrev"><i class="fas fa-chevron-left"></i></button>
                        <button id="galleryNext"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="gallery-dots" id="galleryDots">
                        ${project.images.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
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
    }

    function updateStats() {
        const totalEl = document.getElementById('statTotal');
        const clientsEl = document.getElementById('statClients');
        const techEl = document.getElementById('statTech');
        
        if (totalEl) totalEl.textContent = projects.length;
        if (clientsEl) clientsEl.textContent = Math.floor(projects.length * 2.5);
        if (techEl) {
            const uniqueTechs = new Set(projects.flatMap(p => p.technologies));
            techEl.textContent = uniqueTechs.size;
        }
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