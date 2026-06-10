// Expenses management functions

// Load expenses list
function loadExpenses() {
    const expenses = getData('expenses');
    const tableBody = document.getElementById('expensesTable');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (expenses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    <i class="fas fa-money-bill-wave"></i>
                    <p>لا يوجد مصروفات مسجلة بعد</p>
                    <a href="create.html" class="btn btn-primary">إضافة مصروف أول</a>
                </td>
            </tr>
        `;
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.description || 'غير محدد'}</td>
            <td>${expense.category || 'غير مصنف'}</td>
            <td>${formatCurrency(expense.amount || 0)}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.paymentMethod || 'غير محدد'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewExpense(${expense.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editExpense(${expense.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// View expense details
function viewExpense(expenseId) {
    window.location.href = `view.html?id=${expenseId}`;
}

// Edit expense
function editExpense(expenseId) {
    window.location.href = `edit.html?id=${expenseId}`;
}

// Delete expense
function deleteExpense(expenseId) {
    showConfirmation('هل أنت متأكد من حذف هذا المصروف؟', function() {
        const expenses = getData('expenses');
        const updatedExpenses = expenses.filter(e => e.id !== expenseId);
        saveData('expenses', updatedExpenses);
        
        showAlert('success', 'تم حذف المصروف بنجاح');
        loadExpenses();
    });
}

// Load expense data for view/edit
function loadExpenseData() {
    const urlParams = new URLSearchParams(window.location.search);
    const expenseId = parseInt(urlParams.get('id'));
    
    if (!expenseId) {
        showAlert('error', 'معرف المصروف غير صحيح');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    const expenses = getData('expenses');
    const expense = expenses.find(e => e.id === expenseId);
    
    if (!expense) {
        showAlert('error', 'المصروف غير موجود');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    return expense;
}

// Save expense (create or update)
function saveExpense(expenseData, isEdit = false) {
    const expenses = getData('expenses');
    
    if (isEdit) {
        // Update existing expense
        const index = expenses.findIndex(e => e.id === expenseData.id);
        if (index !== -1) {
            expenses[index] = {
                ...expenses[index],
                ...expenseData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new expense
        const newExpense = {
            id: getNextId('expenses'),
            ...expenseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        expenses.push(newExpense);
    }
    
    saveData('expenses', expenses);
    showAlert('success', `تم ${isEdit ? 'تحديث' : 'إضافة'} المصروف بنجاح`);
    
    setTimeout(() => {
        window.location.href = 'list.html';
    }, 1500);
}

// Search expenses
function searchExpenses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const expenses = getData('expenses');
    
    const filteredExpenses = expenses.filter(expense =>
        expense.description?.toLowerCase().includes(searchTerm) ||
        expense.category?.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('expensesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredExpenses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <p>لا توجد نتائج للبحث</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.description || 'غير محدد'}</td>
            <td>${expense.category || 'غير مصنف'}</td>
            <td>${formatCurrency(expense.amount || 0)}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.paymentMethod || 'غير محدد'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewExpense(${expense.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editExpense(${expense.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize expenses search
function initExpensesSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchExpenses, 300));
    }
}

// Export expenses to CSV
function exportExpenses() {
    const expenses = getData('expenses');
    if (expenses.length === 0) {
        showAlert('warning', 'لا توجد بيانات للتصدير');
        return;
    }
    
    const exportData = expenses.map(expense => ({
        'الوصف': expense.description,
        'الفئة': expense.category,
        'المبلغ': expense.amount || 0,
        'التاريخ': formatDate(expense.date),
        'طريقة الدفع': expense.paymentMethod,
        'تاريخ الإضافة': formatDate(expense.createdAt)
    }));
    
    exportToCSV(exportData, 'المصروفات.csv');
}

// Get expense categories
function getExpenseCategories() {
    return [
        'رواتب',
        'إيجار',
        'فاتورة كهرباء',
        'فاتورة ماء',
        'إنترنت',
        'صيانة',
        'نقل',
        'مواد مكتبية',
        'تسويق',
        'أخرى'
    ];
}

// Get payment methods
function getPaymentMethods() {
    return [
        'نقدي',
        'تحويل بنكي',
        'بطاقة ائتمان',
        'شيك',
        'محفظة إلكترونية'
    ];
}