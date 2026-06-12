/* ============================================================
   dashboard.js — 课程数据仪表盘模块
   功能：Mock成绩数据、Canvas柱状图、GPA环形图、课程进度条
   依赖：css/common.css, css/pages.css
   ============================================================ */

var DashboardApp = (function () {
    'use strict';

    // ── Mock 数据 ─────────────────────────────────────────────

    var mockData = [
        { name: 'Web技术基础',   score: 92, credit: 3, progress: 100, color: '#1a73e8' },
        { name: 'Java语言',       score: 85, credit: 4, progress: 85,  color: '#2c9dff' },
        { name: '数据库原理',     score: 78, credit: 3, progress: 70,  color: '#1cf4e9' },
        { name: '计算机组成原理', score: 88, credit: 4, progress: 90,  color: '#e74c3c' },
        { name: '离散数学',       score: 80, credit: 3, progress: 75,  color: '#f8009d' },
        { name: '中国近现代史纲要', score: 90, credit: 2, progress: 100, color: '#fffb00' }
    ];

    /** 计算GPA（4.0制） */
    function calcGPA(score) {
        if (score >= 90) return 4.0;
        if (score >= 85) return 3.7;
        if (score >= 82) return 3.3;
        if (score >= 78) return 3.0;
        if (score >= 75) return 2.7;
        if (score >= 72) return 2.3;
        if (score >= 68) return 2.0;
        if (score >= 64) return 1.5;
        if (score >= 60) return 1.0;
        return 0;
    }

    function getAvgGPA() {
        var total = 0, credits = 0;
        mockData.forEach(function (c) {
            total += calcGPA(c.score) * c.credit;
            credits += c.credit;
        });
        return credits > 0 ? (total / credits).toFixed(2) : 0;
    }

    /** 成绩表格 */
    function renderTable(container) {
        var html = '<table><thead><tr><th>课程名称</th><th>成绩</th><th>学分</th><th>GPA</th><th>等级</th></tr></thead><tbody>';
        mockData.forEach(function (c) {
            var gpa = calcGPA(c.score);
            var level = gpa >= 3.7 ? '优秀' : gpa >= 2.7 ? '良好' : gpa >= 1.5 ? '中等' : '及格';
            var levelColor = gpa >= 3.7 ? 'badge-success' : gpa >= 2.7 ? 'badge-primary' : gpa >= 1.5 ? 'badge-warning' : 'badge-danger';
            html += '<tr>' +
                '<td>' + c.name + '</td>' +
                '<td style="font-weight:700;">' + c.score + '</td>' +
                '<td>' + c.credit + '</td>' +
                '<td>' + gpa.toFixed(1) + '</td>' +
                '<td><span class="badge ' + levelColor + '">' + level + '</span></td>' +
                '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /** GPA 环形图 (CSS conic-gradient) */
    function renderGPA(container) {
        var gpa = parseFloat(getAvgGPA());
        var percent = (gpa / 4.0) * 100;
        var color = gpa >= 3.0 ? '#27ae60' : gpa >= 2.0 ? '#f39c12' : '#e74c3c';
        container.innerHTML = '' +
            '<div class="gpa-ring" style="background: conic-gradient(' + color + ' ' + percent + '%, #e9ecef ' + percent + '% 100%);">' +
            '  <div style="position:absolute;width:110px;height:110px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;">' +
            '    <span style="font-size:28px;font-weight:700;color:' + color + ';">' + gpa + '</span>' +
            '    <span style="font-size:11px;color:#999;">/ 4.0</span>' +
            '  </div>' +
            '</div>' +
            '<p style="text-align:center;font-size:12px;color:#999;margin-top:4px;">学期平均绩点</p>';
    }

    /** 课程进度条列表 */
    function renderProgress(container) {
        var html = '';
        mockData.forEach(function (c) {
            var progColor = c.progress >= 100 ? '#27ae60' : c.color;
            html += '' +
                '<div class="course-progress-item">' +
                '  <div class="label"><span>' + c.name + '</span><span style="font-weight:700;">' + c.progress + '%</span></div>' +
                '  <div class="progress-bar">' +
                '    <div class="progress-fill" style="width:' + c.progress + '%;background:' + progColor + ';"></div>' +
                '  </div>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    /** Canvas 柱状图 */
    function renderChart(canvas) {
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width = canvas.parentElement.clientWidth || 500;
        var h = canvas.height = 300;

        var padding = { top: 30, right: 20, bottom: 60, left: 50 };
        var chartW = w - padding.left - padding.right;
        var chartH = h - padding.top - padding.bottom;
        var barCount = mockData.length;
        var barWidth = Math.min(50, (chartW / barCount) * 0.7);
        var gap = chartW / barCount;
        var maxScore = 100;

        // 背景
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);

        // Y轴刻度线
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (var i = 0; i <= 5; i++) {
            var y = padding.top + (chartH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            // Y轴标签
            ctx.fillStyle = '#999';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(maxScore - i * 20, padding.left - 8, y + 4);
        }

        // 柱状图
        mockData.forEach(function (c, idx) {
            var x = padding.left + gap * idx + (gap - barWidth) / 2;
            var barH = (c.score / maxScore) * chartH;
            var y = padding.top + chartH - barH;

            // 渐变柱
            var grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
            grad.addColorStop(0, c.color);
            grad.addColorStop(1, c.color + '88');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, barH);

            // 分数文字
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(c.score + '分', x + barWidth / 2, y - 6);

            // X轴标签（课程名缩写）
            ctx.fillStyle = '#666';
            ctx.font = '11px sans-serif';
            var shortName = c.name.length > 4 ? c.name.substring(0, 4) + '…' : c.name;
            ctx.fillText(shortName, x + barWidth / 2, h - padding.bottom + 18);
        });

        // X轴
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartH);
        ctx.lineTo(w - padding.right, padding.top + chartH);
        ctx.stroke();
    }

    function init(config) {
        config = config || {};
        var tableContainer    = document.querySelector(config.tableSelector    || '#dashboardTable');
        var gpaContainer      = document.querySelector(config.gpaSelector       || '#dashboardGPA');
        var progressContainer = document.querySelector(config.progressSelector  || '#dashboardProgress');
        var chartCanvas       = document.querySelector(config.chartSelector     || '#dashboardChart');

        if (tableContainer)    renderTable(tableContainer);
        if (gpaContainer)      renderGPA(gpaContainer);
        if (progressContainer) renderProgress(progressContainer);
        if (chartCanvas)       renderChart(chartCanvas);

        // 响应式重绘
        window.addEventListener('resize', function () {
            if (chartCanvas) renderChart(chartCanvas);
        });
    }

    return { init: init };
})();
