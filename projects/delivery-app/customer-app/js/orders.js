// ============================================
// TechNomads - Driver App Orders
// ============================================

const Orders = {
    currentOrder: null,
    availableOrders: [],
    historyOrders: [],
    orderStatuses: ['pending', 'accepted', 'pickup', 'delivering', 'delivered', 'cancelled'],

    // ============================================
    // LOAD ORDERS
    // ============================================
    async loadAvailable() {
        try {
            const response = await API.orders.getAvailable();
            if (response.data) {
                this.availableOrders = response.data;
                this.renderAvailable();
            }
        } catch (error) {
            console.error('Failed to load available orders:', error);
            showToast('تعذر تحميل الطلبات المتاحة', 'error');
        }
    },

    async loadCurrent() {
        try {
            const response = await API.orders.getCurrent();
            if (response.data) {
                this.currentOrder = response.data;
                this.renderCurrent();
            }
        } catch (error) {
            console.error('Failed to load current order:', error);
        }
    },

    async loadHistory(params = {}) {
        try {
            const response = await API.orders.getHistory(params);
            if (response.data) {
                this.historyOrders = response.data;
                this.renderHistory();
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    },

    // ============================================
    // ACCEPT ORDER
    // ============================================
    async acceptOrder(orderId) {
        try {
            const response = await API.orders.accept(orderId);
            if (response.data) {
                this.currentOrder = response.data;
                this.availableOrders = this.availableOrders.filter(o => o.id !== orderId);
                this.renderAvailable();
                this.renderCurrent();
                showToast('تم قبول الطلب بنجاح!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to accept order:', error);
            showToast('فشل قبول الطلب', 'error');
            return false;
        }
    },

    // ============================================
    // UPDATE STATUS
    // ============================================
    async updateStatus(orderId, status) {
        try {
            const response = await API.orders.updateStatus(orderId, status);
            if (response.data) {
                this.currentOrder = response.data;

                // If completed, clear current order
                if (status === 'delivered' || status === 'cancelled') {
                    this.currentOrder = null;
                    this.historyOrders.unshift(response.data);
                    this.renderHistory();
                }

                this.renderCurrent();
                showToast(`تم تحديث حالة الطلب إلى ${this.getStatusText(status)}`, 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('فشل تحديث حالة الطلب', 'error');
            return false;
        }
    },

    // ============================================
    // RENDER
    // ============================================
    renderAvailable() {
        const container = document.getElementById('availableOrdersList');
        if (!container) return;

        if (this.availableOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد طلبات متاحة حالياً</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.availableOrders.map(order => `
            <div class="order-item" onclick="Orders.showAcceptModal('${order.id}')">
                <div class="order-item-header">
                    <span class="order-item-id">${order.id}</span>
                    <span class="order-item-status ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-item-route">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${order.pickupAddress || order.pickup}</span>
                    <i class="fas fa-arrow-left" style="font-size: 10px;"></i>
                    <span>${order.dropoffAddress || order.dropoff}</span>
                </div>
                <div class="order-item-footer">
                    <span class="order-item-amount">${Number(order.amount).toLocaleString()} ر.ي</span>
                    <span class="order-item-distance">
                        <i class="fas fa-road"></i> ${order.distance || '2.5 كم'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    renderCurrent() {
        const card = document.getElementById('currentOrderCard');
        if (!card) return;

        if (!this.currentOrder) {
            card.style.display = 'none';
            return;
        }

        card.style.display = 'block';

        // Update order details
        document.getElementById('currentOrderId').textContent = this.currentOrder.id;
        document.getElementById('currentOrderStatus').textContent = this.getStatusText(this.currentOrder.status);
        document.getElementById('currentOrderStatus').className = `tracking-status ${this.currentOrder.status}`;
        document.getElementById('currentPickup').textContent = this.currentOrder.pickupAddress || this.currentOrder.pickup;
        document.getElementById('currentDropoff').textContent = this.currentOrder.dropoffAddress || this.currentOrder.dropoff;
        document.getElementById('currentCustomer').textContent = this.currentOrder.customerName || 'عميل';
        document.getElementById('currentAmount').textContent = Number(this.currentOrder.amount).toLocaleString() + ' ر.ي';

        // Update progress
        this.updateProgress();

        // Update action button
        const actionBtn = document.getElementById('actionBtn');
        const actionText = document.getElementById('actionBtnText');
        const statuses = ['pending', 'accepted', 'pickup', 'delivering'];
        const currentIndex = statuses.indexOf(this.currentOrder.status);

        if (currentIndex < statuses.length - 1) {
            const nextStatus = statuses[currentIndex + 1];
            actionText.textContent = this.getActionText(nextStatus);
            actionBtn.className = 'btn-action primary';
            actionBtn.onclick = () => this.updateStatus(this.currentOrder.id, nextStatus);
        } else if (this.currentOrder.status === 'delivered') {
            actionText.textContent = 'تم التوصيل ✓';
            actionBtn.className = 'btn-action success';
            actionBtn.onclick = null;
        } else if (this.currentOrder.status === 'cancelled') {
            actionText.textContent = 'ملغي ✗';
            actionBtn.className = 'btn-action danger';
            actionBtn.onclick = null;
        }
    },

    renderHistory() {
        const container = document.getElementById('historyOrdersList');
        if (!container) return;

        if (this.historyOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>لا توجد طلبات سابقة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.historyOrders.map(order => `
            <div class="order-item" onclick="Orders.viewDetails('${order.id}')">
                <div class="order-item-header">
                    <span class="order-item-id">${order.id}</span>
                    <span class="order-item-status ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-item-route">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${order.pickupAddress || order.pickup}</span>
                    <i class="fas fa-arrow-left" style="font-size: 10px;"></i>
                    <span>${order.dropoffAddress || order.dropoff}</span>
                </div>
                <div class="order-item-footer">
                    <span class="order-item-amount">${Number(order.amount).toLocaleString()} ر.ي</span>
                    <span class="order-item-time">${this.formatTime(order.createdAt)}</span>
                </div>
            </div>
        `).join('');
    },

    // ============================================
    // PROGRESS
    // ============================================
    updateProgress() {
        const steps = ['pending', 'accepted', 'pickup', 'delivering', 'delivered'];
        const currentIndex = steps.indexOf(this.currentOrder?.status || 'pending');

        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('completed', 'active');
            if (index < currentIndex) {
                step.classList.add('completed');
            } else if (index === currentIndex) {
                step.classList.add('active');
            }
        });

        // Update progress bar
        const progress = (currentIndex / (steps.length - 1)) * 100;
        const fill = document.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = Math.min(progress, 100) + '%';
        }
    },

    // ============================================
    // HELPERS
    // ============================================
    getStatusText(status) {
        const statuses = {
            'pending': 'قيد الانتظار',
            'accepted': 'تم القبول',
            'pickup': 'في الاستلام',
            'delivering': 'في الطريق',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        return statuses[status] || status;
    },

    getActionText(status) {
        const actions = {
            'accepted': 'بدء التوصيل',
            'pickup': 'تم الاستلام',
            'delivering': 'تم التوصيل'
        };
        return actions[status] || 'تحديث';
    },

    formatTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);

        if (diff < 60) return 'الآن';
        if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
        return d.toLocaleDateString('ar-SA');
    },

    // ============================================
    // MODAL
    // ============================================
    showAcceptModal(orderId) {
        const order = this.availableOrders.find(o => o.id === orderId);
        if (!order) return;

        document.getElementById('modalOrderId').textContent = order.id;
        document.getElementById('modalPickup').textContent = order.pickupAddress || order.pickup;
        document.getElementById('modalDropoff').textContent = order.dropoffAddress || order.dropoff;
        document.getElementById('modalAmount').textContent = Number(order.amount).toLocaleString() + ' ر.ي';
        document.getElementById('modalDistance').textContent = order.distance || '2.5 كم';

        document.getElementById('acceptOrderModal').classList.add('active');
        this._selectedOrderId = orderId;
    },

    closeAcceptModal() {
        document.getElementById('acceptOrderModal').classList.remove('active');
        this._selectedOrderId = null;
    },

    confirmAccept() {
        if (this._selectedOrderId) {
            this.acceptOrder(this._selectedOrderId);
            this.closeAcceptModal();
        }
    },

    // ============================================
    // VIEW DETAILS
    // ============================================
    viewDetails(orderId) {
        const order = this.historyOrders.find(o => o.id === orderId) ||
                     this.availableOrders.find(o => o.id === orderId);
        if (!order) return;

        // Show order details modal
        // Implementation depends on UI
        showToast(`عرض تفاصيل الطلب ${orderId}`, 'info');
    }
};

// Export
window.Orders = Orders;