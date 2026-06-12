/* ============================================================
   expense.js — 记账本模块
   功能：收支记录增删、统计面板、localStorage存储
   依赖：css/common.css, css/pages.css
   ============================================================ */

var ExpenseApp = (function () {
    'use strict';

    var STORAGE_KEY = 'expense_records';

    function getRecords() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (e) { return []; }
    }

    function saveRecords(records) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    /** 计算统计 */
    function calcStats(records) {
        var income = 0, expense = 0;
        records.forEach(function (r) {
            if (r.type === 'income') income += r.amount;
            else expense += r.amount;
        });
        return {
            income: income,
            expense: expense,
            balance: income - expense
        };
    }

    /** 渲染统计面板 */
    function renderStats(container) {
        var records = getRecords();
        var stats = calcStats(records);
        container.innerHTML = '' +
            '<div class="stat-card income">' +
            '  <div class="stat-label">本月收入</div>' +
            '  <div class="stat-value">' + stats.income.toFixed(2) + '</div>' +
            '</div>' +
            '<div class="stat-card expense">' +
            '  <div class="stat-label">本月支出</div>' +
            '  <div class="stat-value">' + stats.expense.toFixed(2) + '</div>' +
            '</div>' +
            '<div class="stat-card balance">' +
            '  <div class="stat-label">本月结余</div>' +
            '  <div class="stat-value">' + stats.balance.toFixed(2) + '</div>' +
            '</div>';
    }

    /** 渲染记录列表 */
    function renderList(container) {
        var records = getRecords();
        if (records.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>暂无记账记录</p></div>';
            return;
        }

        // 按日期倒序
        records.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        var html = '<div style="text-align:center;color:var(--text-light);font-size:13px;margin-bottom:10px;">共 ' + records.length + ' 条记录</div>';
        records.forEach(function (r, idx) {
            var typeClass = r.type === 'income' ? 'income' : 'expense';
            var typeLabel = r.type === 'income' ? '收入' : '支出';
            var sign = r.type === 'income' ? '+' : '-';
            html += '' +
                '<div class="expense-item ' + typeClass + '">' +
                '  <div class="expense-info">' +
                '    <div class="expense-category">' + escapeHtml(r.category) + ' <span class="badge ' + (r.type === 'income' ? 'badge-success' : 'badge-danger') + '">' + typeLabel + '</span></div>' +
                '    <div class="expense-date">' + r.date + (r.note ? ' · ' + escapeHtml(r.note) : '') + '</div>' +
                '  </div>' +
                '  <div class="expense-amount">' + sign + r.amount.toFixed(2) + '</div>' +
                '  <button class="btn btn-sm btn-outline expense-del-btn" data-index="' + idx + '">删除</button>' +
                '</div>';
        });
        container.innerHTML = html;

        // 绑定删除事件
        container.querySelectorAll('.expense-del-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-index'));
                deleteRecord(idx);
            });
        });
    }

    function deleteRecord(index) {
        if (!confirm('确定删除该记录吗？')) return;
        var records = getRecords();
        records.splice(index, 1);
        saveRecords(records);
        refreshAll();
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    var statsContainer, listContainer;

    function refreshAll() {
        if (statsContainer) renderStats(statsContainer);
        if (listContainer) renderList(listContainer);
    }

    function init(config) {
        config = config || {};
        statsContainer = document.querySelector(config.statsSelector || '#expenseStats');
        listContainer  = document.querySelector(config.listSelector  || '#expenseList');
        var form       = document.querySelector(config.formSelector  || '#expenseFormInner');
        var addBtn     = document.querySelector(config.addBtnSelector || '#expenseAddBtn');

        if (!form || !statsContainer || !listContainer) {
            console.warn('ExpenseApp: 缺少必要容器元素');
            return;
        }

        // 设置日期默认值
        var dateInput = form.querySelector('#expenseDate');
        if (dateInput) {
            var today = new Date();
            dateInput.value = today.getFullYear() + '-' +
                String(today.getMonth() + 1).padStart(2, '0') + '-' +
                String(today.getDate()).padStart(2, '0');
        }

        // 添加记录
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var type     = form.querySelector('#expenseType').value;
            var category = form.querySelector('#expenseCategory').value.trim();
            var amount   = parseFloat(form.querySelector('#expenseAmount').value);
            var date     = form.querySelector('#expenseDate').value;
            var note     = form.querySelector('#expenseNote').value.trim();

            if (!category) { alert('请输入类别'); return; }
            if (isNaN(amount) || amount <= 0) { alert('请输入有效金额'); return; }
            if (!date) { alert('请选择日期'); return; }

            var records = getRecords();
            records.push({
                type: type,
                category: category,
                amount: amount,
                date: date,
                note: note
            });
            saveRecords(records);
            refreshAll();
            form.reset();
            if (dateInput) {
                var t = new Date();
                dateInput.value = t.getFullYear() + '-' +
                    String(t.getMonth() + 1).padStart(2, '0') + '-' +
                    String(t.getDate()).padStart(2, '0');
            }
        });

        // 添加按钮
        if (addBtn) {
            var formWrap = document.querySelector(config.formWrapSelector || '#expenseFormWrap');
            addBtn.addEventListener('click', function () {
                if (formWrap) formWrap.style.display = 'block';
                addBtn.style.display = 'none';
            });
        }

        // 初始渲染
        renderStats(statsContainer);
        renderList(listContainer);
    }

    return { init: init };
})();
