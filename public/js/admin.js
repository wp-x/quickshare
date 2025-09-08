// 管理页面JavaScript功能
class AdminPanel {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.searchQuery = '';
        this.selectedPages = new Set();
        this.apiOrigin = window.location.origin;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.loadPages();
    }

    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // 全选功能
        const selectAllCheckbox = document.getElementById('select-all');
        selectAllCheckbox.addEventListener('change', (e) => {
            this.handleSelectAll(e.target.checked);
        });

        // 批量删除
        const batchDeleteBtn = document.getElementById('batch-delete-btn');
        batchDeleteBtn.addEventListener('click', () => this.handleBatchDelete());

        // 分页按钮
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        
        prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // 模态框事件
        const modal = document.getElementById('delete-modal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-delete');
        
        closeBtn.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    async loadStats() {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`尝试获取统计信息 (第${retryCount + 1}次)`);
                const statsUrl = new URL('/api/admin/stats', this.apiOrigin).toString();
                const { status, data: result } = await this.httpJson(statsUrl, { 
                    method: 'GET',
                    timeout: 10000 // 10秒超时
                });
                
                if (status === 401 || status === 403) {
                    window.location.href = '/login';
                    return;
                }
                
                if (result && result.success) {
                    console.log('统计信息获取成功:', result.data);
                    this.updateStatsDisplay(result.data);
                    return; // 成功则退出重试循环
                } else {
                    throw new Error(result.error || '获取统计信息失败');
                }
            } catch (error) {
                console.error(`获取统计信息错误 (第${retryCount + 1}次尝试):`, error);
                retryCount++;
                
                if (retryCount >= maxRetries) {
                    this.showMessage('加载统计信息失败，请刷新页面重试', 'error');
                    // 显示加载失败的占位符
                    this.showStatsError();
                    return;
                }
                
                // 等待一段时间后重试 (指数退避)
                const delay = Math.pow(2, retryCount) * 1000; // 2秒, 4秒, 8秒
                console.log(`等待${delay}ms后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    updateStatsDisplay(stats) {
        document.getElementById('total-pages').textContent = stats.total;
        document.getElementById('protected-pages').textContent = stats.protected_count;
        document.getElementById('today-pages').textContent = stats.today_count;
        document.getElementById('recent-pages').textContent = stats.recent_count;
    }

    showStatsError() {
        // 显示加载失败的占位符
        document.getElementById('total-pages').textContent = '--';
        document.getElementById('protected-pages').textContent = '--';
        document.getElementById('today-pages').textContent = '--';
        document.getElementById('recent-pages').textContent = '--';
    }

    async loadPages() {
        this.showLoading();
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                search: this.searchQuery
            });
            
            const listUrl = new URL('/api/admin/pages', this.apiOrigin);
            listUrl.search = params.toString();
            const { status, data: result } = await this.httpJson(listUrl.toString(), { method: 'GET' });
            if (status === 401 || status === 403) {
                window.location.href = '/login';
                return;
            }
            
            if (result && result.success) {
                this.updatePagesDisplay(result.data);
                this.updatePagination(result.pagination);
            } else {
                this.showMessage('加载页面列表失败', 'error');
            }
        } catch (error) {
            console.error('加载页面列表错误:', error);
            this.showMessage('加载页面列表失败', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updatePagesDisplay(pages) {
        const tbody = document.getElementById('pages-tbody');
        tbody.innerHTML = '';

        if (pages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }

        pages.forEach(page => {
            const row = this.createPageRow(page);
            tbody.appendChild(row);
        });

        // 重新绑定复选框事件
        this.bindCheckboxEvents();
    }

    createPageRow(page) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="page-checkbox" data-id="${page.id}">
            </td>
            <td>
                <div class="page-title" title="${this.escapeHtml(page.title || '无标题')}">${this.escapeHtml(page.title || '无标题')}</div>
            </td>
            <td>
                <span class="page-id">${page.id}</span>
            </td>
            <td>
                <span class="type-badge ${page.code_type}">${page.code_type}</span>
            </td>
            <td>
                <span class="protection-status ${page.is_protected ? 'protected' : 'unprotected'}">
                    <i class="fas ${page.is_protected ? 'fa-lock' : 'fa-lock-open'}"></i>
                    ${page.is_protected ? '受保护' : '公开'}
                </span>
            </td>
            <td>
                <div class="password-cell" title="${page.is_protected ? '点击复制密码: ' + page.password : '无密码'}">
                    ${page.is_protected ? 
                        `<span class="password-text" onclick="adminPanel.copyPassword('${page.password}')">${page.password}</span>` : 
                        '<span class="no-password">-</span>'
                    }
                </div>
            </td>
            <td>${page.created_at_formatted}</td>
            <td>
                <div class="action-buttons">
                    <a href="/view/${page.id}" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye"></i> 查看
                    </a>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deletePage('${page.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll('.page-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const pageId = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedPages.add(pageId);
                } else {
                    this.selectedPages.delete(pageId);
                }
                this.updateBatchDeleteButton();
                this.updateSelectAllCheckbox();
            });
        });
    }

    updateBatchDeleteButton() {
        const batchDeleteBtn = document.getElementById('batch-delete-btn');
        batchDeleteBtn.disabled = this.selectedPages.size === 0;
        batchDeleteBtn.innerHTML = `
            <i class="fas fa-trash"></i> 
            批量删除 ${this.selectedPages.size > 0 ? `(${this.selectedPages.size})` : ''}
        `;
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('select-all');
        const checkboxes = document.querySelectorAll('.page-checkbox');
        const checkedCount = document.querySelectorAll('.page-checkbox:checked').length;
        
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
        selectAllCheckbox.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
    }

    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.page-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const pageId = checkbox.dataset.id;
            if (checked) {
                this.selectedPages.add(pageId);
            } else {
                this.selectedPages.delete(pageId);
            }
        });
        this.updateBatchDeleteButton();
    }

    updatePagination(pagination) {
        // 更新分页信息
        const start = (pagination.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(pagination.currentPage * this.pageSize, pagination.totalItems);
        document.getElementById('pagination-info').textContent = 
            `显示第 ${start}-${end} 条，共 ${pagination.totalItems} 条记录`;

        // 更新分页按钮
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        prevBtn.disabled = !pagination.hasPrev;
        nextBtn.disabled = !pagination.hasNext;

        // 更新页码
        this.updatePageNumbers(pagination);
    }

    updatePageNumbers(pagination) {
        const pageNumbersContainer = document.getElementById('page-numbers');
        pageNumbersContainer.innerHTML = '';

        const maxVisiblePages = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.href = '#';
            pageBtn.className = `page-number ${i === pagination.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(i);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }
    }

    goToPage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.selectedPages.clear();
        this.loadPages();
    }

    handleSearch() {
        const searchInput = document.getElementById('search-input');
        this.searchQuery = searchInput.value.trim();
        this.currentPage = 1;
        this.selectedPages.clear();
        this.loadPages();
    }

    deletePage(pageId) {
        this.showDeleteModal([pageId], '确定要删除这个页面吗？此操作不可撤销。');
    }

    handleBatchDelete() {
        if (this.selectedPages.size === 0) return;
        
        const message = `确定要删除选中的 ${this.selectedPages.size} 个页面吗？此操作不可撤销。`;
        this.showDeleteModal(Array.from(this.selectedPages), message);
    }

    showDeleteModal(pageIds, message) {
        const modal = document.getElementById('delete-modal');
        const messageElement = document.getElementById('delete-message');
        const confirmBtn = document.getElementById('confirm-delete');
        
        messageElement.textContent = message;
        modal.style.display = 'block';
        
        // 移除之前的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // 添加新的事件监听器
        newConfirmBtn.addEventListener('click', () => {
            this.confirmDelete(pageIds);
        });
    }

    hideModal() {
        const modal = document.getElementById('delete-modal');
        modal.style.display = 'none';
    }

    async confirmDelete(pageIds) {
        this.hideModal();
        this.showLoading();

        try {
            let status, result;
            if (pageIds.length === 1) {
                // 单个删除
                const delUrl = new URL(`/api/admin/pages/${pageIds[0]}`, this.apiOrigin);
                ({ status, data: result } = await this.httpJson(delUrl.toString(), { method: 'DELETE' }));
            } else {
                // 批量删除
                const batchUrl = new URL('/api/admin/pages/batch-delete', this.apiOrigin);
                ({ status, data: result } = await this.httpJson(batchUrl.toString(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: { ids: pageIds }
                }));
            }

            if (status === 401 || status === 403) {
                window.location.href = '/login';
                return;
            }
            
            if (result.success) {
                this.showMessage(result.message || '删除成功', 'success');
                this.selectedPages.clear();
                this.loadPages();
                this.loadStats(); // 重新加载统计信息
            } else {
                this.showMessage(result.error || '删除失败', 'error');
            }
        } catch (error) {
            console.error('删除页面错误:', error);
            this.showMessage('删除失败', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // 使用 XMLHttpRequest 实现的 JSON 请求，避免被 fetch 拦截/篡改
    httpJson(url, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const headers = options.headers || {};
        const body = options.body;
        const timeout = options.timeout || 30000; // 默认30秒超时

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.withCredentials = true;
            xhr.timeout = timeout; // 设置超时时间
            xhr.setRequestHeader('Accept', 'application/json');
            if (headers['Content-Type']) xhr.setRequestHeader('Content-Type', headers['Content-Type']);

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));
            xhr.onload = () => {
                let data;
                try {
                    data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                } catch (e) {
                    data = { success: false, error: 'Invalid JSON', raw: xhr.responseText };
                }
                resolve({ status: xhr.status, data });
            };

            if (method === 'GET' || method === 'HEAD' || body === undefined) {
                xhr.send();
            } else {
                const payload = typeof body === 'string' ? body : JSON.stringify(body);
                if (!headers['Content-Type']) xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(payload);
            }
        });
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.classList.add('show');

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyPassword(password) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(password).then(() => {
                this.showMessage('密码已复制到剪贴板', 'success');
            }).catch(err => {
                console.error('复制失败:', err);
                this.showMessage('复制失败', 'error');
            });
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showMessage('密码已复制到剪贴板', 'success');
            } catch (err) {
                console.error('复制失败:', err);
                this.showMessage('复制失败', 'error');
            }
            document.body.removeChild(textArea);
        }
    }
}

// 初始化管理面板
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
}); 
