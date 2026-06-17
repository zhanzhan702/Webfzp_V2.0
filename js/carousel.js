/* ============================================================
   carousel.js — 轮播图模块
   功能：自动播放、左右箭头、底部圆点指示器
   ============================================================ */

var Carousel = (function () {
    'use strict';

    function init(containerSelector) {
        var container = document.querySelector(containerSelector);
        if (!container) return;

        // 查找子元素
        var track   = container.querySelector('.carousel-track');
        var slides  = container.querySelectorAll('.carousel-slide');
        var prevBtn = container.querySelector('.carousel-btn.prev');
        var nextBtn = container.querySelector('.carousel-btn.next');
        var dotsCt  = container.querySelector('.carousel-dots');
        var total   = slides.length;
        var current = 0;
        var timer   = null;

        if (total === 0) return;

        // 生成圆点
        if (dotsCt) {
            dotsCt.innerHTML = '';
            for (var i = 0; i < total; i++) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', (function (idx) {
                    return function () { goTo(idx); };
                })(i));
                dotsCt.appendChild(dot);
            }
        }

        /** 跳转到指定索引 */
        function goTo(index) {
            current = (index+total)%total;
            track.style.transform = 'translateX(-' + (current * 100) + '%)';

            // 更新圆点
            if (dotsCt) {
                var dots = dotsCt.querySelectorAll('.carousel-dot');
                dots.forEach(function (d, i) {
                    d.classList.toggle('active', i === current);
                });
            }
        }

        /** 下一张 */
        function next() {
            goTo(current + 1);
        }

        /** 上一张 */
        function prev() {
            goTo(current - 1);
        }

        /** 开始自动播放 */
        function startAuto() {
            stopAuto();
            timer = setInterval(next, 3000);
        }

        /** 停止自动播放 */
        function stopAuto() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        // 绑定按钮事件
        if (prevBtn) prevBtn.addEventListener('click', function () { prev(); stopAuto(); startAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', function () { next(); stopAuto(); startAuto(); });

        // 鼠标悬停时暂停，离开时恢复
        container.addEventListener('mouseenter', stopAuto);
        container.addEventListener('mouseleave', startAuto);

        // 启动
        startAuto();
    }

    return { init: init };
})();
