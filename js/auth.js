/* ============================================================
   auth.js — 登录注册模块
   功能：登录浮层、注册校验、localStorage 用户管理
   依赖：需在页面中引入 css/common.css
   ============================================================ */

var Auth = (function () {
    'use strict';

    // ── 校验函数 ─────────────────────────────────────────────

    /** 用户名校验：6-20位，字母开头，字母/数字/下划线 */
    function validateUsername(username) {
        if (!username) return '请输入用户名';
        if (username.length < 6 || username.length > 20) return '用户名长度需为6-20位';
        if (!/^[a-zA-Z]/.test(username)) return '用户名必须以字母开头';
        if (!/^[a-zA-Z][a-zA-Z0-9_]{5,19}$/.test(username)) return '用户名只能包含字母、数字、下划线';
        return '';
    }

    /** 密码校验：8-20位，含大小写+数字+特殊字符，不含空格，不含用户名 */
    function validatePassword(password, username) {
        if (!password) return '请输入密码';
        if (password.length < 8 || password.length > 20) return '密码长度需为8-20位';
        if (/\s/.test(password)) return '密码不允许包含空格';
        if (!/[0-9]/.test(password)) return '密码必须包含数字';
        if (!/[a-z]/.test(password)) return '密码必须包含小写字母';
        if (!/[A-Z]/.test(password)) return '密码必须包含大写字母';
        if (!/[#\$@!\*]/.test(password)) return '密码必须包含特殊字符（# $ @ ! *）';
        if (username && password.indexOf(username) !== -1) return '密码不能包含用户名';
        return '';
    }

    // ── 弹窗提示 ─────────────────────────────────────────────

    function showToast(msg, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 2500);
    }

    // ── 用户存储 ─────────────────────────────────────────────

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem('siteUsers')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem('siteUsers', JSON.stringify(users));
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function clearCurrentUser() {
        localStorage.removeItem('currentUser');
    }

    // ── 构建登录浮层 HTML ────────────────────────────────────

    function createModalHTML() {
        return '' +
        '<div class="modal-overlay" id="authOverlay">' +
        '  <div class="modal">' +
        '    <div class="modal-header">' +
        '      <h2 id="authTitle">🔐 个人学习网站</h2>' +
        '      <p>登录以访问全部功能</p>' +
        '    </div>' +
        '    <div class="modal-tabs">' +
        '      <button class="modal-tab active" data-tab="login">登 录</button>' +
        '      <button class="modal-tab" data-tab="register">注 册</button>' +
        '    </div>' +
        '    <div class="modal-body">' +
        '      <!-- 登录表单 -->' +
        '      <div class="form-panel active" id="loginPanel">' +
        '        <div class="form-group">' +
        '          <label for="loginUser">用户名</label>' +
        '          <input type="text" id="loginUser" placeholder="请输入用户名" autocomplete="username">' +
        '        </div>' +
        '        <div class="form-group">' +
        '          <label for="loginPass">密码</label>' +
        '          <input type="password" id="loginPass" placeholder="请输入密码" autocomplete="current-password">' +
        '        </div>' +
        '        <button class="btn btn-primary btn-lg" id="loginBtn" style="width:100%;margin-top:8px;">登 录</button>' +
        '      </div>' +
        '      <!-- 注册表单 -->' +
        '      <div class="form-panel" id="registerPanel">' +
        '        <div class="form-group" id="regUserGroup">' +
        '          <label for="regUser">用户名</label>' +
        '          <input type="text" id="regUser" placeholder="6-20位，字母开头，字母/数字/下划线" autocomplete="off">' +
        '          <span class="error-msg" id="regUserError"></span>' +
        '        </div>' +
        '        <div class="form-group" id="regPassGroup">' +
        '          <label for="regPass">密码</label>' +
        '          <input type="password" id="regPass" placeholder="8-20位，含大小写+数字+特殊字符" autocomplete="new-password">' +
        '          <span class="error-msg" id="regPassError"></span>' +
        '        </div>' +
        '        <div class="form-group" id="regPass2Group">' +
        '          <label for="regPass2">确认密码</label>' +
        '          <input type="password" id="regPass2" placeholder="请再次输入密码" autocomplete="new-password">' +
        '          <span class="error-msg" id="regPass2Error"></span>' +
        '        </div>' +
        '        <button class="btn btn-success btn-lg" id="registerBtn" style="width:100%;margin-top:8px;">注 册</button>' +
        '      </div>' +
        '    </div>' +
        '    <div class="modal-footer">© 个人学习网站 · 闽江大学</div>' +
        '  </div>' +
        '</div>';
    }

    // ── 初始化 ────────────────────────────────────────────────

    function init(onLoginSuccess, onLogout) {
        var currentUser = getCurrentUser();
        if (currentUser) {
            // 已登录，直接回调
            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess(currentUser);
            }
            return;
        }

        // 插入浮层
        var modalHTML = createModalHTML();
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        var overlay          = document.getElementById('authOverlay');
        var loginPanel       = document.getElementById('loginPanel');
        var registerPanel    = document.getElementById('registerPanel');
        var loginUser        = document.getElementById('loginUser');
        var loginPass        = document.getElementById('loginPass');
        var loginBtn         = document.getElementById('loginBtn');
        var regUser          = document.getElementById('regUser');
        var regPass          = document.getElementById('regPass');
        var regPass2         = document.getElementById('regPass2');
        var registerBtn      = document.getElementById('registerBtn');
        var authTitle        = document.getElementById('authTitle');
        var tabBtns          = overlay.querySelectorAll('.modal-tab');

        var regUserGroup  = document.getElementById('regUserGroup');
        var regPassGroup  = document.getElementById('regPassGroup');
        var regPass2Group = document.getElementById('regPass2Group');
        var regUserError  = document.getElementById('regUserError');
        var regPassError  = document.getElementById('regPassError');
        var regPass2Error = document.getElementById('regPass2Error');

        // Tab 切换
        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tab = this.getAttribute('data-tab');
                tabBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                loginPanel.classList.remove('active');
                registerPanel.classList.remove('active');
                if (tab === 'login') {
                    loginPanel.classList.add('active');
                    authTitle.textContent = '🔐 个人学习网站';
                } else {
                    registerPanel.classList.add('active');
                    authTitle.textContent = '📝 注册新账号';
                }
            });
        });

        // 登录
        loginBtn.addEventListener('click', function () {
            var username = loginUser.value.trim();
            var password = loginPass.value;

            if (!username || !password) {
                showToast('请输入用户名和密码', 'warning');
                return;
            }

            var users = getUsers();
            var found = null;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username === username && users[i].password === password) {
                    found = users[i];
                    break;
                }
            }

            if (found) {
                setCurrentUser({ username: found.username });
                overlay.remove();
                showToast('登录成功，欢迎'+username+'!', 'success');
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess({ username: found.username });
                }
            } else {
                showToast('用户名或密码错误', 'error');
            }
        });

        // 回车登录
        loginPass.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') loginBtn.click();
        });

        // 注册
        registerBtn.addEventListener('click', function () {
            var username = regUser.value.trim();
            var password = regPass.value;
            var password2 = regPass2.value;

            // 清除错误状态
            regUserGroup.classList.remove('error');
            regPassGroup.classList.remove('error');
            regPass2Group.classList.remove('error');
            regUserError.textContent = '';
            regPassError.textContent = '';
            regPass2Error.textContent = '';

            // 校验用户名
            var userErr = validateUsername(username);
            if (userErr) {
                regUserGroup.classList.add('error');
                regUserError.textContent = userErr;
                return;
            }

            // 检查用户名是否已存在
            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    regUserGroup.classList.add('error');
                    regUserError.textContent = '用户名已被注册';
                    return;
                }
            }

            // 校验密码
            var passErr = validatePassword(password, username);
            if (passErr) {
                regPassGroup.classList.add('error');
                regPassError.textContent = passErr;
                return;
            }

            // 确认密码
            if (password !== password2) {
                regPass2Group.classList.add('error');
                regPass2Error.textContent = '两次输入的密码不一致';
                return;
            }

            // 保存用户
            users.push({ username: username, password: password });
            saveUsers(users);
            setCurrentUser({ username: username });
            overlay.remove();
            showToast('注册成功，欢迎傅展鹏！', 'success');
            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess({ username: username });
            }
        });

        // 回车注册
        regPass2.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') registerBtn.click();
        });
    }

    /** 退出登录 */
    function logout(onLogoutCallback) {
        clearCurrentUser();
        showToast('已退出登录', 'warning');
        setTimeout(function () {
            location.reload();
        }, 800);
    }

    /** 检查是否登录 */
    function isLoggedIn() {
        return !!getCurrentUser();
    }

    /** 获取当前用户名 */
    function getUsername() {
        var user = getCurrentUser();
        return user ? user.username : '';
    }

    // ── 公开 API ─────────────────────────────────────────────
    return {
        init: init,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getUsername: getUsername,
        validateUsername: validateUsername,
        validatePassword: validatePassword
    };
})();
