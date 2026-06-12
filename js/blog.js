/* ============================================================
   blog.js — 个人博客模块
   功能：文章发布/编辑/删除/查看详情、localStorage存储
   依赖：css/common.css, css/pages.css
   ============================================================ */

var BlogApp = (function () {
    'use strict';

    var STORAGE_KEY = 'blog_posts';

    function getPosts() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (e) { return []; }
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    /** 获取摘要（前100字） */
    function getSummary(text) {
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }

    /** 渲染文章列表 */
    function renderList(container) {
        var posts = getPosts();
        if (posts.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>暂无文章，点击上方按钮开始写作</p></div>';
            return;
        }
        posts.sort(function (a, b) { return b.id - a.id; });
        var html = '';
        posts.forEach(function (p) {
            html += '' +
                '<article class="blog-card" data-id="' + p.id + '">' +
                '  <h3>' + escapeHtml(p.title) + '</h3>' +
                '  <div class="blog-summary">' + escapeHtml(getSummary(p.content)) + '</div>' +
                '  <div class="blog-meta">' +
                '    <time>' + p.date + '</time>' +
                '    <span>' + escapeHtml(p.category || '未分类') + '</span>' +
                '    <button class="btn btn-sm btn-outline blog-del-btn" data-id="' + p.id + '" style="margin-left:auto;">删除</button>' +
                '  </div>' +
                '</article>';
        });
        container.innerHTML = html;

        // 点击卡片查看详情
        container.querySelectorAll('.blog-card').forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.classList.contains('blog-del-btn')) return;
                var id = parseInt(this.getAttribute('data-id'));
                showDetail(container, id);
            });
        });

        // 删除按钮
        container.querySelectorAll('.blog-del-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var id = parseInt(this.getAttribute('data-id'));
                if (confirm('确定删除此文章吗？')) {
                    deletePost(id);
                    renderList(container);
                }
            });
        });
    }

    /** 查看文章详情 */
    function showDetail(container, id) {
        var posts = getPosts();
        var post = null;
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].id === id) { post = posts[i]; break; }
        }
        if (!post) return;

        container.innerHTML = '' +
            '<article class="blog-detail">' +
            '  <button class="btn btn-outline btn-sm back-btn" id="blogBackBtn">← 返回列表</button>' +
            '  <h2>' + escapeHtml(post.title) + '</h2>' +
            '  <div class="blog-detail-meta">' +
            '    <time>' + post.date + '</time> · ' + escapeHtml(post.category || '未分类') +
            '  </div>' +
            '  <div class="blog-detail-body">' + escapeHtml(post.content) + '</div>' +
            '  <div style="margin-top:16px;">' +
            '    <button class="btn btn-sm btn-outline" id="blogEditBtn" data-id="' + post.id + '">编辑</button>' +
            '  </div>' +
            '</article>';

        document.getElementById('blogBackBtn').addEventListener('click', function () {
            renderList(container);
        });

        document.getElementById('blogEditBtn').addEventListener('click', function () {
            showEditor(post);
        });
    }

    /** 显示编辑器 */
    function showEditor(post) {
        var editor = document.getElementById('blogEditor');
        var blogList = document.getElementById('blogList');
        if (!editor || !blogList) return;

        editor.style.display = 'block';
        blogList.style.display = 'none';
        document.getElementById('blogEditorTitle').textContent = post ? '编辑文章' : '新建文章';
        document.getElementById('blogTitle').value = post ? post.title : '';
        document.getElementById('blogCategory').value = post ? (post.category || '') : '';
        document.getElementById('blogContent').value = post ? post.content : '';
        document.getElementById('blogEditId').value = post ? post.id : '';

        // 滚动到编辑器
        editor.scrollIntoView({ behavior: 'smooth' });
    }

    function deletePost(id) {
        var posts = getPosts();
        var newPosts = posts.filter(function (p) { return p.id !== id; });
        savePosts(newPosts);
    }

    function init(config) {
        config = config || {};
        var listContainer = document.querySelector(config.listSelector || '#blogList');
        var editor        = document.querySelector(config.editorSelector || '#blogEditor');
        var form          = document.querySelector(config.formSelector || '#blogForm');
        var cancelBtn     = document.querySelector(config.cancelSelector || '#blogCancelBtn');
        var newBtn        = document.querySelector(config.newBtnSelector || '#blogNewBtn');

        if (!listContainer) return;

        // 新建文章按钮
        if (newBtn) {
            newBtn.addEventListener('click', function () {
                showEditor(null);
            });
        }

        // 取消编辑
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                if (editor) editor.style.display = 'none';
                if (listContainer) listContainer.style.display = 'block';
                renderList(listContainer);
            });
        }

        // 保存文章
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var title    = document.getElementById('blogTitle').value.trim();
                var category = document.getElementById('blogCategory').value.trim();
                var content  = document.getElementById('blogContent').value.trim();
                var editId   = document.getElementById('blogEditId').value;

                if (!title) { alert('请输入文章标题'); return; }
                if (!content) { alert('请输入文章内容'); return; }

                var posts = getPosts();
                var now = new Date();
                var dateStr = now.getFullYear() + '-' +
                    String(now.getMonth() + 1).padStart(2, '0') + '-' +
                    String(now.getDate()).padStart(2, '0');

                if (editId) {
                    // 编辑模式
                    for (var i = 0; i < posts.length; i++) {
                        if (posts[i].id === parseInt(editId)) {
                            posts[i].title = title;
                            posts[i].category = category;
                            posts[i].content = content;
                            posts[i].date = dateStr;
                            break;
                        }
                    }
                } else {
                    // 新建模式
                    posts.push({
                        id: Date.now(),
                        title: title,
                        category: category || '未分类',
                        content: content,
                        date: dateStr
                    });
                }

                savePosts(posts);
                if (editor) editor.style.display = 'none';
                if (listContainer) listContainer.style.display = 'block';
                form.reset();
                document.getElementById('blogEditId').value = '';
                document.getElementById('blogEditorTitle').textContent = '新建文章';
                renderList(listContainer);
            });
        }

        // 初始渲染
        if (editor) editor.style.display = 'none';
        if (listContainer) listContainer.style.display = 'block';
        renderList(listContainer);
    }

    return { init: init };
})();
