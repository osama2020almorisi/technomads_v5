// Products management functions

// Load products list
function loadProducts() {
    const products = getData('products');
    const tableBody = document.getElementById('productsTable');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    <i class="fas fa-box"></i>
                    <p>لا يوجد منتجات/خدمات مسجلة بعد</p>
                    <a href="create.html" class="btn btn-primary">إضافة منتج أول</a>
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name || 'غير محدد'}</td>
            <td>${product.description || 'لا يوجد وصف'}</td>
            <td>${formatCurrency(product.price || 0)}</td>
            <td>${product.type === 'service' ? 'خدمة' : 'منتج'}</td>
            <td>${product.stock !== undefined ? product.stock : 'غير محدد'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewProduct(${product.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// View product details
function viewProduct(productId) {
    window.location.href = `view.html?id=${productId}`;
}

// Edit product
function editProduct(productId) {
    window.location.href = `edit.html?id=${productId}`;
}

// Delete product
function deleteProduct(productId) {
    showConfirmation('هل أنت متأكد من حذف هذا المنتج/الخدمة؟', function() {
        const products = getData('products');
        const updatedProducts = products.filter(p => p.id !== productId);
        saveData('products', updatedProducts);
        
        showAlert('success', 'تم حذف المنتج/الخدمة بنجاح');
        loadProducts();
    });
}

// Load product data for view/edit
function loadProductData() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        showAlert('error', 'معرف المنتج غير صحيح');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    const products = getData('products');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showAlert('error', 'المنتج/الخدمة غير موجود');
        setTimeout(() => window.location.href = 'list.html', 2000);
        return null;
    }
    
    return product;
}

// Save product (create or update)
function saveProduct(productData, isEdit = false) {
    const products = getData('products');
    
    if (isEdit) {
        // Update existing product
        const index = products.findIndex(p => p.id === productData.id);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...productData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new product
        const newProduct = {
            id: getNextId('products'),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        products.push(newProduct);
    }
    
    saveData('products', products);
    showAlert('success', `تم ${isEdit ? 'تحديث' : 'إضافة'} المنتج/الخدمة بنجاح`);
    
    setTimeout(() => {
        window.location.href = 'list.html';
    }, 1500);
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const products = getData('products');
    
    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('productsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <p>لا توجد نتائج للبحث</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name || 'غير محدد'}</td>
            <td>${product.description || 'لا يوجد وصف'}</td>
            <td>${formatCurrency(product.price || 0)}</td>
            <td>${product.type === 'service' ? 'خدمة' : 'منتج'}</td>
            <td>${product.stock !== undefined ? product.stock : 'غير محدد'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-primary" onclick="viewProduct(${product.id})" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize products search
function initProductsSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
}

// Export products to CSV
function exportProducts() {
    const products = getData('products');
    if (products.length === 0) {
        showAlert('warning', 'لا توجد بيانات للتصدير');
        return;
    }
    
    const exportData = products.map(product => ({
        'الاسم': product.name,
        'الوصف': product.description,
        'السعر': product.price || 0,
        'النوع': product.type === 'service' ? 'خدمة' : 'منتج',
        'المخزون': product.stock || 'غير محدد',
        'تاريخ الإضافة': formatDate(product.createdAt)
    }));
    
    exportToCSV(exportData, 'المنتجات_الخدمات.csv');
}