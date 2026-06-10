// Customers management functions

// Load customers list
function loadCustomers() {
    console.log('جاري تحميل العملاء...');
    
    // تأخير بسيط للتأكد من اكتمال تحميل DOM
    setTimeout(() => {
        const tableBody = document.getElementById('customersTable');
        
        if (!tableBody) {
            console.error('لم يتم العثور على جدول العملاء!');
            // حاول مرة أخرى بعد نصف ثانية
            setTimeout(loadCustomers, 500);
            return;
        }
        
        const customers = getData('customers');
        console.log('تم جلب ' + customers.length + ' عميل');
        
        tableBody.innerHTML = '';
        
        if (customers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">
                        <i class="fas fa-users"></i>
                        <p>لا يوجد عملاء مسجلين بعد</p>
                        <a href="create.html" class="btn btn-primary">إضافة عميل أول</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name || 'غير محدد'}</td>
                <td>${customer.email || 'غير محدد'}</td>
                <td>${customer.phone || 'غير محدد'}</td>
                <td>${customer.balance ? formatCurrency(customer.balance) : formatCurrency(0)}</td>
                <td>${formatDate(customer.createdAt)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="viewCustomer(${customer.id})" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editCustomer(${customer.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }, 100);
}

// View customer details
function viewCustomer(customerId) {
    window.location.href = `view.html?id=${customerId}`;
}

// Edit customer
function editCustomer(customerId) {
    window.location.href = `edit.html?id=${customerId}`;
}

// Delete customer
function deleteCustomer(customerId) {
    showConfirmation('هل أنت متأكد من حذف هذا العميل؟', function() {
        const customers = getData('customers');
        const updatedCustomers = customers.filter(c => c.id !== customerId);
        saveData('customers', updatedCustomers);
        
        showAlert('success', 'تم حذف العميل بنجاح');
        loadCustomers();
    });
}

// Load customer data for view/edit
function loadCustomerData() {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = parseInt(urlParams.get('id'));
    
    if (!customerId) {
        showAlert('error', 'معرف العميل غير صحيح');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    const customers = getData('customers');
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        showAlert('error', 'العميل غير موجود');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    return customer;
}

// Save customer (create or update)
function saveCustomer(customerData, isEdit = false) {
    const customers = getData('customers');
    
    if (isEdit) {
        // Update existing customer
        const index = customers.findIndex(c => c.id === customerData.id);
        if (index !== -1) {
            customers[index] = {
                ...customers[index],
                ...customerData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new customer
        const newCustomer = {
            id: getNextId('customers'),
            ...customerData,
            balance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        customers.push(newCustomer);
    }
    
    saveData('customers', customers);
    showAlert('success', `تم ${isEdit ? 'تحديث' : 'إضافة'} العميل بنجاح`);
    
    setTimeout(() => {
        window.location.href = 'list.html';
    }, 1500);
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const customers = getData('customers');
    
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.includes(searchTerm)
    );
    
    const tableBody = document.getElementById('customersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <p>لا توجد نتائج للبحث</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name || 'غير محدد'}</td>
            <td>${customer.email || 'غير محدد'}</td>
            <td>${customer.phone || 'غير محدد'}</td>
            <td>${customer.balance ? formatCurrency(customer.balance) : formatCurrency(0)}</td>
            <td>${formatDate(customer.createdAt)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewCustomer(${customer.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editCustomer(${customer.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize customers search
function initCustomersSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchCustomers, 300));
    }
}

// Export customers to CSV
function exportCustomers() {
    const customers = getData('customers');
    if (customers.length === 0) {
        showAlert('warning', 'لا توجد بيانات للتصدير');
        return;
    }
    
    const exportData = customers.map(customer => ({
        'الاسم': customer.name,
        'البريد الإلكتروني': customer.email,
        'الهاتف': customer.phone,
        'العنوان': customer.address,
        'الرصيد': customer.balance || 0,
        'تاريخ الإضافة': formatDate(customer.createdAt)
    }));
    
    exportToCSV(exportData, 'العملاء.csv');
}

// إعادة تحميل قسري
function forceReload() {
    console.log('إعادة تحميل قسري للبيانات...');
    const customers = getData('customers');
    console.log('البيانات قبل التحميل:', customers);
    
    loadCustomers();
    
    showAlert('info', 'تم تحديث البيانات');
}