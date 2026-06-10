// Additional helper functions

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9]{8,15}$/;
    return phoneRegex.test(phone);
}

// Format phone number
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show confirmation dialog
function showConfirmation(message, callback) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تأكيد</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
                <button class="btn btn-danger" onclick="confirmAction()">تأكيد</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    function confirmAction() {
        callback();
        closeModal();
    }
    
    function closeModal() {
        modal.remove();
    }
    
    // Add styles if not exists
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--border-radius);
                padding: 1.5rem;
                max-width: 400px;
                width: 90%;
                box-shadow: var(--box-shadow);
            }
            
            .modal-header {
                margin-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 0.5rem;
            }
            
            .modal-header h3 {
                margin-bottom: 0;
            }
            
            .modal-body {
                margin-bottom: 1.5rem;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            @media (max-width: 480px) {
                .modal-content {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-footer .btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Show loading spinner
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-spinner';
    loading.innerHTML = `
        <div class="spinner"></div>
    `;
    
    document.body.appendChild(loading);
    
    // Add styles if not exists
    if (!document.querySelector('#loading-styles')) {
        const styles = document.createElement('style');
        styles.id = 'loading-styles';
        styles.textContent = `
            .loading-spinner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--light-gray);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }
    
    return loading;
}

// Hide loading spinner
function hideLoading(loading) {
    if (loading && loading.parentElement) {
        loading.remove();
    }
}

// Export data to CSV
function exportToCSV(data, filename) {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
    );
    return [headers, ...rows].join('\n');
}