// Authentication functions

function registerUser(fullName, email, password, confirmPassword, companyName) {
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('error', 'يرجى ملء جميع الحقول المطلوبة');
        return false;
    }
    
    if (password !== confirmPassword) {
        showAlert('error', 'كلمة المرور غير متطابقة');
        return false;
    }
    
    if (password.length < 6) {
        showAlert('error', 'كلمة المرور يجب أن تكون至少 6 أحرف');
        return false;
    }
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        showAlert('error', 'هذا البريد الإلكتروني مسجل already');
        return false;
    }
    
    // Create new user
    const newUser = {
        id: getNextId('users'),
        fullName,
        email,
        password, // Note: In real app, hash the password!
        companyName: companyName || '',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto login after registration
    setCurrentUser(newUser);
    showAlert('success', 'تم إنشاء الحساب بنجاح! يتم توجيهك الآن...');
    
    setTimeout(() => {
        window.location.href = '../dashboard.html';
    }, 1500);
    
    return true;
}

function loginUser(email, password) {
    if (!email || !password) {
        showAlert('error', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return false;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showAlert('error', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return false;
    }
    
    setCurrentUser(user);
    showAlert('success', 'تم تسجيل الدخول بنجاح! يتم توجيهك الآن...');
    
    setTimeout(() => {
        window.location.href = '../dashboard.html';
    }, 1500);
    
    return true;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function showAlert(type, message) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#alert-styles')) {
        const styles = document.createElement('style');
        styles.id = 'alert-styles';
        styles.textContent = `
            .alert {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                border-radius: var(--border-radius);
                color: white;
                font-weight: 500;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                box-shadow: var(--box-shadow);
                animation: slideDown 0.3s ease;
            }
            
            .alert-success { background-color: var(--success-color); }
            .alert-error { background-color: var(--danger-color); }
            .alert-warning { background-color: var(--warning-color); color: #000; }
            
            .alert button {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                margin-right: 10px;
            }
            
            @keyframes slideDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            
            @media (max-width: 480px) {
                .alert {
                    min-width: auto;
                    left: 20px;
                    right: 20px;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}