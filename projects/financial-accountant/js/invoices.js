// Invoices management functions

// Load invoices list
function loadInvoices() {
    const invoices = getData('invoices');
    const tableBody = document.getElementById('invoicesTable');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty">
                    <i class="fas fa-file-invoice"></i>
                    <p>لا يوجد فواتير مسجلة بعد</p>
                    <a href="create.html" class="btn btn-primary">إنشاء فاتورة أولى</a>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort invoices by date (newest first)
    const sortedInvoices = invoices.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedInvoices.forEach(invoice => {
        const statusClass = getStatusClass(invoice.status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoiceNumber || 'غير محدد'}</td>
            <td>${invoice.customerName || 'عميل'}</td>
            <td>${formatDate(invoice.invoiceDate)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td>${formatCurrency(invoice.totalAmount || 0)}</td>
            <td><span class="status-badge ${statusClass}">${getStatusText(invoice.status)}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewInvoice(${invoice.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editInvoice(${invoice.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="printInvoice(${invoice.id})" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'paid': return 'status-paid';
        case 'pending': return 'status-pending';
        case 'overdue': return 'status-overdue';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

// Get status text in Arabic
function getStatusText(status) {
    switch (status) {
        case 'paid': return 'مدفوعة';
        case 'pending': return ' pending';
        case 'overdue': return 'متأخرة';
        case 'cancelled': return 'ملغاة';
        default: return ' pending';
    }
}

// View invoice details
function viewInvoice(invoiceId) {
    window.location.href = `view.html?id=${invoiceId}`;
}

// Edit invoice
function editInvoice(invoiceId) {
    window.location.href = `edit.html?id=${invoiceId}`;
}

// Delete invoice
function deleteInvoice(invoiceId) {
    showConfirmation('هل أنت متأكد من حذف هذه الفاتورة؟', function() {
        const invoices = getData('invoices');
        const updatedInvoices = invoices.filter(i => i.id !== invoiceId);
        saveData('invoices', updatedInvoices);
        
        showAlert('success', 'تم حذف الفاتورة بنجاح');
        loadInvoices();
    });
}

// Print invoice
function printInvoice(invoiceId) {
    window.open(`view.html?id=${invoiceId}&print=true`, '_blank');
}

// Load invoice data for view/edit
function loadInvoiceData() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = parseInt(urlParams.get('id'));
    
    if (!invoiceId) {
        showAlert('error', 'معرف الفاتورة غير صحيح');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    const invoices = getData('invoices');
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
        showAlert('error', 'الفاتورة غير موجودة');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    return invoice;
}

// Generate invoice number
function generateInvoiceNumber() {
    const invoices = getData('invoices');
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const count = invoices.filter(i => {
        const invoiceDate = new Date(i.createdAt);
        return invoiceDate.getFullYear() === year && 
               invoiceDate.getMonth() + 1 === parseInt(month);
    }).length + 1;
    
    return `INV-${year}${month}-${count.toString().padStart(4, '0')}`;
}

// Calculate invoice totals
function calculateInvoiceTotals(items, taxRate = 0) {
    const subtotal = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
}

// Save invoice (create or update)
function saveInvoice(invoiceData, isEdit = false) {
    const invoices = getData('invoices');
    
    // Calculate totals
    const totals = calculateInvoiceTotals(invoiceData.items, invoiceData.taxRate);
    
    const invoiceToSave = {
        ...invoiceData,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        updatedAt: new Date().toISOString()
    };
    
    if (isEdit) {
        // Update existing invoice
        const index = invoices.findIndex(i => i.id === invoiceData.id);
        if (index !== -1) {
            invoices[index] = {
                ...invoices[index],
                ...invoiceToSave
            };
        }
    } else {
        // Create new invoice
        const newInvoice = {
            id: getNextId('invoices'),
            invoiceNumber: generateInvoiceNumber(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...invoiceToSave
        };
        invoices.push(newInvoice);
        
        // Update customer balance if needed
        updateCustomerBalance(invoiceData.customerId, totals.totalAmount);
    }
    
    saveData('invoices', invoices);
    showAlert('success', `تم ${isEdit ? 'تحديث' : 'إنشاء'} الفاتورة بنجاح`);
    
    setTimeout(() => {
        window.location.href = 'list.html';
    }, 1500);
}

// Update customer balance
function updateCustomerBalance(customerId, amount) {
    if (!customerId) return;
    
    const customers = getData('customers');
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (customerIndex !== -1) {
        customers[customerIndex].balance = (customers[customerIndex].balance || 0) + amount;
        customers[customerIndex].updatedAt = new Date().toISOString();
        saveData('customers', customers);
    }
}

// Search invoices
function searchInvoices() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    const invoices = getData('invoices');
    
    let filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm) ||
        invoice.customerName?.toLowerCase().includes(searchTerm)
    );
    
    if (statusFilter) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === statusFilter);
    }
    
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filteredInvoices = filteredInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.invoiceDate);
            return invoiceDate.toDateString() === filterDate.toDateString();
        });
    }
    
    const tableBody = document.getElementById('invoicesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredInvoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <p>لا توجد نتائج للبحث</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredInvoices.forEach(invoice => {
        const statusClass = getStatusClass(invoice.status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoiceNumber || 'غير محدد'}</td>
            <td>${invoice.customerName || 'عميل'}</td>
            <td>${formatDate(invoice.invoiceDate)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td>${formatCurrency(invoice.totalAmount || 0)}</td>
            <td><span class="status-badge ${statusClass}">${getStatusText(invoice.status)}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewInvoice(${invoice.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editInvoice(${invoice.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="printInvoice(${invoice.id})" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize invoices search
function initInvoicesSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchInvoices, 300));
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', searchInvoices);
    }
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', searchInvoices);
    }
}

// Export invoices to CSV
function exportInvoices() {
    const invoices = getData('invoices');
    if (invoices.length === 0) {
        showAlert('warning', 'لا توجد بيانات للتصدير');
        return;
    }
    
    const exportData = invoices.map(invoice => ({
        'رقم الفاتورة': invoice.invoiceNumber,
        'العميل': invoice.customerName,
        'تاريخ الفاتورة': formatDate(invoice.invoiceDate),
        'تاريخ الاستحقاق': formatDate(invoice.dueDate),
        'المجموع الفرعي': invoice.subtotal || 0,
        'الضريبة': invoice.taxAmount || 0,
        'الإجمالي': invoice.totalAmount || 0,
        'الحالة': getStatusText(invoice.status),
        'تاريخ الإنشاء': formatDate(invoice.createdAt)
    }));
    
    exportToCSV(exportData, 'الفواتير.csv');
}

// Get invoice status options
function getInvoiceStatusOptions() {
    return [
        { value: 'pending', text: ' pending' },
        { value: 'paid', text: 'مدفوعة' },
        { value: 'overdue', text: 'متأخرة' },
        { value: 'cancelled', text: 'ملغاة' }
    ];
}

// Update invoice status
function updateInvoiceStatus(invoiceId, status) {
    const invoices = getData('invoices');
    const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
    
    if (invoiceIndex !== -1) {
        invoices[invoiceIndex].status = status;
        invoices[invoiceIndex].updatedAt = new Date().toISOString();
        saveData('invoices', invoices);
        
        showAlert('success', 'تم تحديث حالة الفاتورة بنجاح');
        return true;
    }
    
    return false;
}

// Check for overdue invoices
function checkOverdueInvoices() {
    const invoices = getData('invoices');
    const today = new Date();
    
    invoices.forEach(invoice => {
        if (invoice.status === 'pending') {
            const dueDate = new Date(invoice.dueDate);
            if (dueDate < today) {
                invoice.status = 'overdue';
                invoice.updatedAt = new Date().toISOString();
            }
        }
    });
    
    saveData('invoices', invoices);
}

// Initialize overdue check on app start
document.addEventListener('DOMContentLoaded', function() {
    checkOverdueInvoices();
});