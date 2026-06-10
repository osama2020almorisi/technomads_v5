// JavaScript code for file upload
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const targetFolder = document.getElementById('targetFolder');
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressText = document.getElementById('progressText');
    const statusMessage = document.getElementById('statusMessage');

    let filesToUpload = [];

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
        filesToUpload = Array.from(files);
        updateFileList();
        
        uploadBtn.disabled = filesToUpload.length === 0;
    }

    // تحديث قائمة الملفات المعروضة
    function updateFileList() {
        fileList.innerHTML = '<h3>الملفات المحددة:</h3>';
        
        if (filesToUpload.length === 0) {
            fileList.innerHTML += '<p>لا توجد ملفات مختارة</p>';
            return;
        }
        
        filesToUpload.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name} (${formatFileSize(file.size)})</span>
                <button onclick="removeFile(${index})">إزالة</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // إزالة ملف من القائمة
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

    // حدث رفع الملفات
    uploadBtn.addEventListener('click', async () => {
        if (filesToUpload.length === 0) return;
        
        const token = prompt('الرجاء إدخال توكن GitHub الخاص بك:');
        if (!token) {
            showStatus('لم يتم إدخال التوكن', 'error');
            return;
        }
        
        const folder = targetFolder.value.trim() || 'uploads';
        
        uploadBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        statusMessage.textContent = 'جاري معالجة الملفات...';
        statusMessage.className = '';
        
        try {
            // تحويل الملفات إلى base64
            const filesData = await Promise.all(
                filesToUpload.map(file => readFileAsBase64(file))
            );
            
            // إعداد بيانات الطلب
            const payload = {
                files: filesToUpload.map((file, index) => ({
                    name: file.name,
                    path: folder,
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
            
            showStatus('تم بدء عملية الرفع بنجاح! سيتم تحديث المستودع قريباً.', 'success');
            
            // إعادة تعيين الواجهة بعد 3 ثواني
            setTimeout(() => {
                filesToUpload = [];
                fileInput.value = '';
                updateFileList();
                uploadProgress.value = 0;
                progressText.textContent = '0%';
                progressContainer.classList.add('hidden');
                uploadBtn.disabled = true;
                statusMessage.textContent = '';
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
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
        statusMessage.className = type;
    }
});
