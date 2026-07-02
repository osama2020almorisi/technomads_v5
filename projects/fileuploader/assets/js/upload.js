document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const folderPathInput = document.getElementById('folderPath');
    const createFolderBtn = document.getElementById('createFolder');
    const existingFoldersContainer = document.getElementById('existingFolders');
    const fileListContainer = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const statusMessage = document.getElementById('statusMessage');

    let filesToUpload = [];
    let currentFolder = 'uploads';

    // أحداث السحب والإفلات
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

    // أحداث اختيار الملفات
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // زر إنشاء مجلد
    createFolderBtn.addEventListener('click', () => {
        const folderName = folderPathInput.value.trim();
        if (!folderName) {
            showStatus('الرجاء إدخال اسم المجلد', 'error');
            return;
        }
        currentFolder = folderName;
        showStatus(`تم تحديد المجلد: ${folderName}`, 'success');
    });

    // تحميل المجلدات الموجودة
    loadExistingFolders();

    // معالجة الملفات المختارة
    function handleFiles(files) {
        const MAX_SIZE = 25 * 1024 * 1024; // 25MB
        
        filesToUpload = Array.from(files).filter(file => {
            if (file.size > MAX_SIZE) {
                showStatus(`تم تخطي الملف ${file.name} (يتجاوز 25MB)`, 'error');
                return false;
            }
            return true;
        });
        
        updateFileList();
        uploadBtn.disabled = filesToUpload.length === 0;
    }

    // تحديث قائمة الملفات
    function updateFileList() {
        if (filesToUpload.length === 0) {
            fileListContainer.innerHTML = `
                <h3><img src="https://cdn-icons-png.flaticon.com/512/2965/2965278.png" width="20"> الملفات المحددة:</h3>
                <div class="empty-state">لا توجد ملفات مختارة</div>
            `;
            return;
        }
        
        let filesHTML = `
            <h3><img src="https://cdn-icons-png.flaticon.com/512/2965/2965278.png" width="20"> الملفات المحددة:</h3>
        `;
        
        filesToUpload.forEach((file, index) => {
            filesHTML += `
                <div class="file-item">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${formatFileSize(file.size)})</span>
                    </div>
                    <button class="remove-file" onclick="removeFile(${index})">إزالة</button>
                </div>
            `;
        });
        
        fileListContainer.innerHTML = filesHTML;
    }

    // دالة إزالة ملف
    window.removeFile = (index) => {
        filesToUpload.splice(index, 1);
        updateFileList();
        uploadBtn.disabled = filesToUpload.length === 0;
    }

    // تنسيق حجم الملف
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 بايت';
        const k = 1024;
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // تحميل المجلدات الموجودة
    async function loadExistingFolders() {
        try {
            const response = await fetch('https://api.github.com/repos/osama2020almorisi/file-uploader/contents');
            
            if (!response.ok) {
                throw new Error('فشل في تحميل المجلدات');
            }
            
            const data = await response.json();
            const folders = data.filter(item => item.type === 'dir');
            
            let foldersHTML = `
                <h3><img src="https://cdn-icons-png.flaticon.com/512/2965/2965300.png" width="20"> المجلدات المتاحة:</h3>
            `;
            
            if (folders.length === 0) {
                foldersHTML += '<div class="empty-state">لا توجد مجلدات بعد</div>';
            } else {
                folders.forEach(folder => {
                    foldersHTML += `
                        <div class="folder-item" onclick="selectFolder('${folder.path}')">
                            <img src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png" alt="مجلد">
                            <span>${folder.path}</span>
                        </div>
                    `;
                });
            }
            
            existingFoldersContainer.innerHTML = foldersHTML;
            
        } catch (error) {
            console.error('Error loading folders:', error);
            existingFoldersContainer.innerHTML = `
                <h3><img src="https://cdn-icons-png.flaticon.com/512/2965/2965300.png" width="20"> المجلدات المتاحة:</h3>
                <div class="error">لا يمكن تحميل المجلدات: ${error.message}</div>
            `;
        }
    }

    // تحديد مجلد
    window.selectFolder = (path) => {
        folderPathInput.value = path;
        currentFolder = path;
        showStatus(`تم تحديد المجلد: ${path}`, 'success');
    };

    // رفع الملفات
    uploadBtn.addEventListener('click', async () => {
        if (filesToUpload.length === 0) {
            showStatus('لم يتم اختيار أي ملفات', 'error');
            return;
        }
        
        const folderPath = folderPathInput.value.trim() || 'uploads';
        const token = prompt('الرجاء إدخال توكن GitHub الخاص بك:');
        
        if (!token) {
            showStatus('لم يتم إدخال التوكن', 'error');
            return;
        }
        
        uploadBtn.disabled = true;
        showStatus('جاري معالجة الملفات...', '');
        
        try {
            // تحويل الملفات إلى base64
            const filesData = await Promise.all(
                filesToUpload.map(file => readFileAsBase64(file))
            );
            
            // إعداد بيانات الطلب
            const payload = {
                folder: folderPath,
                files: filesToUpload.map((file, index) => ({
                    name: file.name,
                    folder: folderPath,
                    content: filesData[index],
                    size: file.size,
                    type: file.type
                }))
            };
            
            // إرسال الطلب إلى GitHub API
            const response = await fetch(
                'https://api.github.com/repos/osama2020almorisi/file-uploader/dispatches',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_type: 'file_upload_request',
                        client_payload: payload
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'فشل في رفع الملفات');
            }
            
            showStatus('تم بدء عملية الرفع بنجاح! سيتم تحديث المستودع خلال دقائق.', 'success');
            
            // إعادة تعيين الواجهة
            setTimeout(() => {
                filesToUpload = [];
                fileInput.value = '';
                updateFileList();
                uploadBtn.disabled = true;
                loadExistingFolders();
            }, 3000);
            
        } catch (error) {
            console.error('Upload Error:', error);
            showStatus(`حدث خطأ: ${error.message}`, 'error');
            uploadBtn.disabled = false;
        }
    });

    // قراءة الملف كـ base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // عرض رسالة الحالة
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type ? `status-message ${type}` : 'status-message';
    }
});
