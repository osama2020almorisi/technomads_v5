document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const targetFolder = document.getElementById('targetFolder');
    const commitMessage = document.getElementById('commitMessage');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    const fileCount = document.getElementById('fileCount');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const progressContainer = document.getElementById('progressContainer');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressText = document.getElementById('progressText');
    const uploadedSize = document.getElementById('uploadedSize');
    const transferSpeed = document.getElementById('transferSpeed');
    const timeRemaining = document.getElementById('timeRemaining');
    const statusMessage = document.getElementById('statusMessage');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');

    // متغيرات التطبيق
    let filesToUpload = [];
    let startTime;
    let uploadedBytes = 0;
    let totalBytes = 0;
    let speedHistory = [];
    let githubToken = localStorage.getItem('githubToken') || '';
    let username = localStorage.getItem('githubUsername') || '';

    // تهيئة الواجهة
    function initUI() {
        updateFileList();
        checkAuthStatus();
    }

    // التحقق من حالة المصادقة
    function checkAuthStatus() {
        if (githubToken) {
            // إخفاء نموذج تسجيل الدخول إذا كان المستخدم مسجلاً
            loginModal.classList.add('hidden');
            // يمكنك هنا تحديث واجهة المستخدم لإظهار معلومات المستخدم
        }
    }

    // أحداث سحب وإسقاط الملفات
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('highlight');
    });

    ['dragleave', 'dragend'].forEach(type => {
        uploadArea.addEventListener(type, () => {
            uploadArea.classList.remove('highlight');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('highlight');
        handleFiles(e.dataTransfer.files);
    });

    // حدث اختيار الملفات
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // معالجة الملفات المختارة
    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => {
            // التحقق من عدم وجود الملف مسبقاً
            return !filesToUpload.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );
        });

        if (newFiles.length === 0) {
            showStatus('الملفات المختارة موجودة بالفعل في القائمة', 'warning');
            return;
        }

        // التحقق من حجم الملفات
        const oversizedFiles = newFiles.filter(file => file.size > 25 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            showStatus(`بعض الملفات تتجاوز الحد الأقصى (25MB): ${oversizedFiles.map(f => f.name).join(', ')}`, 'error');
            return;
        }

        filesToUpload = [...filesToUpload, ...newFiles];
        updateFileList();
        updateUploadButton();
    }

    // تحديث قائمة الملفات المعروضة
    function updateFileList() {
        fileList.innerHTML = '';
        fileCount.textContent = filesToUpload.length;
        
        if (filesToUpload.length === 0) {
            fileListContainer.style.display = 'none';
            return;
        }
        
        fileListContainer.style.display = 'block';
        
        // حساب الحجم الكلي
        totalBytes = filesToUpload.reduce((total, file) => total + file.size, 0);
        
        filesToUpload.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileTypeIcon = getFileIcon(file);
            
            fileItem.innerHTML = `
                <div class="file-info">
                    ${fileTypeIcon}
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
                <i class="fas fa-times file-remove" data-index="${index}"></i>
            `;
            fileList.appendChild(fileItem);
        });

        // إضافة أحداث لإزالة الملفات
        document.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeFile(index);
            });
        });
    }

    // الحصول على أيقونة الملف حسب نوعه
    function getFileIcon(file) {
        const type = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();
        
        const icons = {
            image: 'fas fa-file-image',
            audio: 'fas fa-file-audio',
            video: 'fas fa-file-video',
            application: 'fas fa-file-code',
            text: 'fas fa-file-alt'
        };
        
        // أيقونات خاصة لبعض الامتدادات
        const extensionIcons = {
            pdf: 'fas fa-file-pdf',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            xls: 'fas fa-file-excel',
            xlsx: 'fas fa-file-excel',
            ppt: 'fas fa-file-powerpoint',
            pptx: 'fas fa-file-powerpoint',
            zip: 'fas fa-file-archive',
            rar: 'fas fa-file-archive',
            exe: 'fas fa-cog',
            mp3: 'fas fa-music',
            mp4: 'fas fa-film'
        };
        
        if (extensionIcons[extension]) {
            return `<i class="${extensionIcons[extension]} file-icon"></i>`;
        }
        
        if (icons[type]) {
            return `<i class="${icons[type]} file-icon"></i>`;
        }
        
        return '<i class="fas fa-file file-icon"></i>';
    }

    // إزالة ملف من القائمة
    function removeFile(index) {
        filesToUpload.splice(index, 1);
        updateFileList();
        updateUploadButton();
    }

    // مسح جميع الملفات
    clearBtn.addEventListener('click', () => {
        filesToUpload = [];
        fileInput.value = '';
        updateFileList();
        updateUploadButton();
        showStatus('تم مسح جميع الملفات', 'info');
    });

    // تحديث حالة زر الرفع
    function updateUploadButton() {
        uploadBtn.disabled = filesToUpload.length === 0 || !githubToken;
    }

    // تنسيق حجم الملف
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // حساب سرعة النقل والوقت المتبقي
    function updateTransferStats(bytesUploaded) {
        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - startTime) / 1000; // بالثواني
        
        // حساب السرعة الحالية (بايت/ثانية)
        const currentSpeed = bytesUploaded / elapsedTime;
        speedHistory.push(currentSpeed);
        
        // حساب متوسط السرعة (آخر 5 قياسات)
        const avgSpeed = speedHistory.length > 5 ? 
            speedHistory.slice(-5).reduce((a, b) => a + b, 0) / 5 : 
            currentSpeed;
        
        // تحديث واجهة المستخدم
        const speedMB = (avgSpeed / (1024 * 1024)).toFixed(2);
        transferSpeed.textContent = `${speedMB} MB/s`;
        
        // حساب الوقت المتبقي
        const remainingBytes = totalBytes - bytesUploaded;
        const remainingTime = remainingBytes / avgSpeed;
        
        if (remainingTime > 60) {
            timeRemaining.textContent = `${Math.ceil(remainingTime / 60)} دقيقة`;
        } else {
            timeRemaining.textContent = `${Math.ceil(remainingTime)} ثانية`;
        }
    }

    // حدث رفع الملفات
    uploadBtn.addEventListener('click', async () => {
        if (filesToUpload.length === 0) return;
        
        const folder = targetFolder.value.trim() || 'uploads';
        const message = commitMessage.value.trim() || 'تم رفع الملفات بواسطة المنصة';
        const isPrivate = document.querySelector('input[name="privacy"]:checked').value === 'private';
        
        // إعداد واجهة الرفع
        uploadBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        statusMessage.textContent = 'جاري معالجة الملفات...';
        statusMessage.className = 'info';
        
        // إعادة تعيين مقاييس الأداء
        startTime = new Date().getTime();
        uploadedBytes = 0;
        speedHistory = [];
        
        try {
            // تحويل الملفات إلى base64 مع تتبع التقدم
            const filesData = [];
            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];
                const data = await readFileAsBase64(file, (loaded, total) => {
                    uploadedBytes += loaded;
                    const progress = Math.round((uploadedBytes / totalBytes) * 100);
                    uploadProgress.value = progress;
                    progressText.textContent = `${progress}%`;
                    uploadedSize.textContent = `${formatFileSize(uploadedBytes)} / ${formatFileSize(totalBytes)}`;
                    updateTransferStats(uploadedBytes);
                });
                filesData.push(data);
            }
            
            // إعداد بيانات الطلب
            const payload = {
                files: filesToUpload.map((file, index) => ({
                    name: file.name,
                    path: `${folder}/${file.name}`,
                    content: filesData[index],
                    size: file.size,
                    type: file.type
                })),
                commit_message: message,
                is_private: isPrivate
            };
            
            // إرسال الطلب إلى GitHub API
            const response = await uploadToGitHub(payload);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'فشل في رفع الملفات');
            }
            
            showStatus('تم رفع الملفات بنجاح!', 'success');
            
            // إعادة تعيين الواجهة بعد 3 ثواني
            setTimeout(() => {
                filesToUpload = [];
                fileInput.value = '';
                updateFileList();
                uploadProgress.value = 0;
                progressText.textContent = '0%';
                progressContainer.classList.add('hidden');
                updateUploadButton();
                statusMessage.textContent = '';
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
            showStatus(`حدث خطأ: ${error.message}`, 'error');
            uploadBtn.disabled = false;
        }
    });

    // قراءة الملف كـ base64 مع تتبع التقدم
    function readFileAsBase64(file, progressCallback) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            let lastLoaded = 0;
            
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const loaded = e.loaded - lastLoaded;
                    lastLoaded = e.loaded;
                    progressCallback(loaded, e.total);
                }
            };
            
            reader.readAsDataURL(file);
        });
    }

    // رفع الملفات إلى GitHub
    async function uploadToGitHub(payload) {
        const repoUrl = 'https://api.github.com/repos/osama2020almorisi/fileuploader/contents';
        
        // سنقوم برفع كل ملف على حدة
        const responses = [];
        
        for (const file of payload.files) {
            const filePath = encodeURIComponent(file.path);
            const response = await fetch(`${repoUrl}/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: payload.commit_message,
                    content: file.content,
                    branch: 'main'
                })
            });
            
            responses.push(response);
            
            if (!response.ok) {
                break; // نوقف الرفع إذا حدث خطأ
            }
        }
        
        // نعيد آخر استجابة (سواء كانت ناجحة أو فاشلة)
        return responses[responses.length - 1];
    }

    // عرض رسالة الحالة
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        
        // إخفاء الرسالة بعد 5 ثواني (ما عدا الأخطاء)
        if (type !== 'error') {
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.className = '';
            }, 5000);
        }
    }

    // أحداث النوافذ المنبثقة
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        // هنا يمكنك إضافة التحقق من صحة البيانات
        githubToken = passwordInput.value; // في الواقع، يجب أن يكون هذا توكن API
        username = usernameInput.value;
        
        // حفظ بيانات المستخدم
        localStorage.setItem('githubToken', githubToken);
        localStorage.setItem('githubUsername', username);
        
        // إغلاق النافذة وتحديث الواجهة
        loginModal.classList.add('hidden');
        checkAuthStatus();
        updateUploadButton();
        showStatus(`مرحباً ${username}! تم تسجيل الدخول بنجاح`, 'success');
    });

    // تهيئة الواجهة عند التحميل
    initUI();
});
