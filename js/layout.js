/**
 * ScholarHub - Layout kiểu BKTin (header, sidebar, rightbar, footer)
 */

const NAV_TOP = [
    { id: "home", href: window.SH_ROOT + "index.html", icon: "fa-house", label: "Trang chủ" },
    { id: "documents", href: window.SH_HTML + "documents.html", icon: "fa-file-lines", label: "Tài liệu" },
    { id: "subjects", href: window.SH_HTML + "subjects.html", icon: "fa-book", label: "Môn học" },
    { id: "premium", href: window.SH_HTML + "documents.html?filter=premium", icon: "fa-crown", label: "Tài liệu VIP" },
    { id: "upload", href: window.SH_HTML + "upload.html", icon: "fa-cloud-arrow-up", label: "Đăng tải" },
    { id: "favorites", href: window.SH_HTML + "favorites.html", icon: "fa-bookmark", label: "Yêu thích" },
    { id: "attendance", href: window.SH_HTML + "attendance.html", icon: "fa-fingerprint", label: "Điểm danh" }
];

/**
 * Logo chính — dùng logo.png trên toàn site
 * @param {string} href
 * @param {"header"|"auth"|"admin"|"footer"} variant
 */
function renderBrandLink(href, variant) {
    const v = variant || "header";
    const logo = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.LOGO) || (window.SH_ROOT + "logo.png");
    const alt = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.SITE_NAME) || "ScholarHub";
    const home = href || window.SH_ROOT + "index.html";
    return `<a href="${home}" class="site-brand site-brand--${v}" aria-label="${alt}">
        <img src="${logo}" alt="${alt}" class="site-brand__img" width="180" height="48">
    </a>`;
}

const NAV_SIDEBAR = [
    { id: "documents", href: window.SH_HTML + "documents.html", icon: "fa-file-lines", label: "Kho tài liệu" },
    { id: "subjects", href: window.SH_HTML + "subjects.html", icon: "fa-book", label: "Môn học" },
    { id: "premium", href: window.SH_HTML + "documents.html?filter=premium", icon: "fa-crown", label: "Tài liệu trả phí" },
    { id: "upload", href: window.SH_HTML + "upload.html", icon: "fa-upload", label: "Đóng góp TL" },
    { id: "favorites", href: window.SH_HTML + "favorites.html", icon: "fa-heart", label: "Yêu thích" },
    { id: "profile", href: window.SH_HTML + "profile.html", icon: "fa-user", label: "Hồ sơ cá nhân" },
    { divider: true },
    { id: "leaderboard", href: window.SH_HTML + "leaderboard.html", icon: "fa-trophy", label: "Bảng xếp hạng" },
    { id: "attendance", href: window.SH_HTML + "attendance.html", icon: "fa-fingerprint", label: "Điểm danh Face ID" },
    { id: "wallet", href: window.SH_HTML + "profile.html#nap-xu", icon: "fa-coins", label: "Nạp xu" }
];

function renderHeader(activePage) {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const logged = user && user.id;

    let topLinks = "";
    for (let i = 0; i < NAV_TOP.length; i++) {
        const n = NAV_TOP[i];
        const active = n.id === activePage ? " active" : "";
        const label = typeof t === "function" ? t(`nav_${n.id}`) : n.label;
        topLinks += `<li class="nav-item"><a class="nav-link nav-top-link${active}" href="${n.href}"><i class="fa-solid ${n.icon}"></i>${label}</a></li>`;
    }

    const userBlock = logged
        ? `<span class="coin-badge-header d-none d-md-inline-flex" id="header-xu-badge"><i class="fa-solid fa-coins"></i><span id="header-xu-val">${user.so_xu || 0}</span> Xu</span>
           <a href="${window.SH_HTML}favorites.html" class="header-icon-btn" title="Yêu thích"><i class="fa-solid fa-bookmark"></i></a>
           <a href="${window.SH_HTML}profile.html" title="Hồ sơ"><img src="${user.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0]}" class="user-avatar-sm" id="header-avatar" alt=""></a>`
        : `<a href="${window.SH_HTML}login.html" class="btn btn-primary btn-sm rounded-pill px-3">${typeof t === "function" ? t("btn_login") : "Đăng nhập"}</a>
           <a href="${window.SH_HTML}register.html" class="btn btn-outline-primary btn-sm rounded-pill px-3 ms-1">${typeof t === "function" ? t("btn_register") : "Đăng ký"}</a>`;

    const currentLang = typeof getCurrentLang === "function" ? getCurrentLang() : "vi";
    const nextLang = currentLang === "vi" ? "en" : "vi";
    // Using explicit image tags for flags to ensure cross-platform compatibility instead of emojis
    const flagIcon = currentLang === "vi" ?
        '<img src="https://flagcdn.com/w40/vn.png" alt="VN" style="width:24px;height:18px;object-fit:cover;border-radius:2px">' :
        '<img src="https://flagcdn.com/w40/gb.png" alt="EN" style="width:24px;height:18px;object-fit:cover;border-radius:2px">';

    const isDark = typeof getCurrentTheme === "function" ? getCurrentTheme() === "dark" : false;
    const themeIcon = isDark ? "fa-sun" : "fa-moon";

    return `
    <header class="app-header">
        <nav class="navbar navbar-expand-lg py-2">
            <div class="container-fluid px-3 px-lg-4">
                ${renderBrandLink(window.SH_ROOT + "index.html", "header")}
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNav"><span class="navbar-toggler-icon"></span></button>
                <div class="collapse navbar-collapse" id="topNav">
                    <ul class="navbar-nav mx-auto">${topLinks}</ul>
                    <div class="d-flex align-items-center gap-2">
                        <button class="header-icon-btn border-0 bg-transparent" onclick="typeof toggleTheme === 'function' ? toggleTheme() : null" title="Toggle Theme"><i id="theme-icon" class="fa-solid ${themeIcon}"></i></button>
                        <button class="header-icon-btn border-0 bg-transparent fs-5" onclick="typeof setLanguage === 'function' ? setLanguage('${nextLang}') : null" title="Language: ${currentLang.toUpperCase()}">${flagIcon}</button>
                        ${userBlock}
                        <a href="${window.SH_HTML}admin.html" class="header-icon-btn d-none d-md-inline-flex" title="Admin"><i class="fa-solid fa-gear"></i></a>
                    </div>
                </div>
            </div>
        </nav>
    </header>`;
}

function renderSidebar(activePage) {
    let html = '<nav class="sidebar-panel">';
    for (let i = 0; i < NAV_SIDEBAR.length; i++) {
        const item = NAV_SIDEBAR[i];
        if (item.divider) {
            html += '<div class="sidebar-divider"></div>';
            continue;
        }
        const active = item.id === activePage ? " active" : "";
        const labelKey = item.id === "premium" ? "sidebar_premium" : `sidebar_${item.id}`;
        const label = typeof t === "function" ? t(labelKey) : item.label;
        html += `<a href="${item.href}" class="sidebar-link${active}" data-nav="${item.id}"><i class="fa-solid ${item.icon}"></i>${label}</a>`;
    }
    html += `<div class="sidebar-social">
        <a href="https://www.facebook.com/datdevl" target="_blank" rel="noopener" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="#" title="Zalo"><i class="fa-solid fa-comment"></i></a>
        <a href="#" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
    </div></nav>`;
    return html;
}

function renderRightbar() {
    return `
    <aside class="app-rightbar-inner">
        <div class="countdown-box">
            <div class="widget-title text-white mb-2" style="font-size:.85rem" id="exam-title">${typeof t === "function" ? t("rightbar_exam") : "Đếm ngược kỳ thi"}</div>
            <div class="countdown-grid" id="exam-countdown">
                <div class="countdown-item"><span class="num" id="cd-days">0</span><span class="lbl">${typeof t === "function" ? t("rightbar_days") : "Ngày"}</span></div>
                <div class="countdown-item"><span class="num" id="cd-hours">00</span><span class="lbl">${typeof t === "function" ? t("rightbar_hours") : "Giờ"}</span></div>
                <div class="countdown-item"><span class="num" id="cd-mins">00</span><span class="lbl">${typeof t === "function" ? t("rightbar_mins") : "Phút"}</span></div>
                <div class="countdown-item"><span class="num" id="cd-secs">00</span><span class="lbl">${typeof t === "function" ? t("rightbar_secs") : "Giây"}</span></div>
            </div>
        </div>
        <div class="widget-box">
            <div class="widget-title"><i class="fa-solid fa-trophy text-warning me-1"></i> ${typeof t === "function" ? t("sidebar_leaderboard") : "Bảng xếp hạng"}</div>
            <ul class="nav nav-pills nav-fill mb-2" id="lb-tabs">
                <li class="nav-item"><button class="nav-link active py-1 small" data-lb="week">${typeof t === "function" ? t("lb_week") : "Tuần"}</button></li>
                <li class="nav-item"><button class="nav-link py-1 small" data-lb="month">${typeof t === "function" ? t("lb_month") : "Tháng"}</button></li>
            </ul>
            <div id="leaderboard-list"><div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div></div>
        </div>
        <div class="widget-consult">
            <div class="fw-bold mb-2">${typeof t === "function" ? t("rightbar_consult") : "Nhận tư vấn miễn phí"}</div>
            <input type="text" class="form-control form-control-sm" id="consult-name" placeholder="${typeof t === "function" ? t("rightbar_name") : "Họ tên"}">
            <input type="email" class="form-control form-control-sm" id="consult-email" placeholder="Email">
            <input type="tel" class="form-control form-control-sm" id="consult-phone" placeholder="${typeof t === "function" ? t("rightbar_phone") : "Số điện thoại"}">
            <button type="button" class="btn btn-light btn-sm mt-1" id="btn-consult">${typeof t === "function" ? t("rightbar_send") : "Gửi yêu cầu"}</button>
        </div>
        <div class="lecturer-rail">
            <div class="lecturer-track" id="lecturer-track">
                ${renderLecturerCard("https://scontent.fhan14-1.fna.fbcdn.net/v/t39.30808-6/544828771_24235895536096060_1163072788702630779_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHgh7CktVJgcBbBsIPm0zRpksMOWwQeP3qSww5bBB4_egaN8OiFtgLA2QMRVHmbEqtYoaSfNT8_rX0PSj9wzgHF&_nc_ohc=DncYcP4Bs34Q7kNvwG8hiLK&_nc_oc=AdoNSVxhVUDTrCXykyeGT1fb5sOE9v1B7N4jw0ORKZumVqHIUHkT_MNmZIUP0gJN_dWiSAxbw8S9ugWUudHmHEqr&_nc_zt=23&_nc_ht=scontent.fhan14-1.fna&_nc_gid=PcmMlO9dNKM2WJ9nmxB2jw&_nc_ss=7b2a8&oh=00_Af8IMKVpsFMIPmkb78pbFArqIgiNqttGr_-zEG-S6A4N2w&oe=6A35F4CB","Thầy Lê Văn Phong","Giảng viên Khoa CNTT","Chuyên ngành: Khoa học dữ liệu")}
                ${renderLecturerCard("https://scontent.fhan14-1.fna.fbcdn.net/v/t39.30808-1/616166985_2632255180473473_947613393094388330_n.jpg?stp=c0.18.1365.1365a_dst-jpg_tt6&cstp=mx1365x1365&ctp=s200x200&_nc_cat=105&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeE0FrMJDEufitx8sn-a6Aqbho0IVnihgKKGjQhWeKGAoiBtTXkJrMAzYTLVIwdBhVjW_StgL0IlAfTHDFMThsUQ&_nc_ohc=o7NZ4l9JaUMQ7kNvwER3ni5&_nc_oc=AdrSHxWYQvJE-Cy9QLsOt8zzF9hgXT806NQ6CE9kFQrO2z0bZOCVlVyvHcZPUAag9giLOmX1kqvVGlA6AS7rrqi2&_nc_zt=24&_nc_ht=scontent.fhan14-1.fna&_nc_gid=MIbwlxE1BaVeJryYl2B-ng&_nc_ss=7b2a8&oh=00_Af8MOCoJZ5rtvRXw8LuGC0cumy83XzSP0E6uA5Nt0mLUXw&oe=6A35F459","Thầy Nguyễn Thế Huy Hoàng","Giảng viên Bộ môn CSDL","Chuyên ngành: Cơ sở dữ liệu")}
                ${renderLecturerCard("https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-1/658147276_2730602617322797_4675060846371236992_n.jpg?stp=dst-jpg_tt6&cstp=mx1920x1920&ctp=s200x200&_nc_cat=103&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeFty7T3A2M0V8F8LirxkrQK4whgIR8Q377jCGAhHxDfvnR5eLMbPjIFhgpp7XAcLXgcJ2zE4enPTgywMfj2DYGl&_nc_ohc=MWW35DtY8HkQ7kNvwHrjqTI&_nc_oc=AdoTQG4JF0uVlYcW6XZj5DhJQyfYZR5hklrTnJpBOo6lBYMg68xptg9Qwg-lzw03IdIyH4OZUlA7-L47xm6iQ8I-&_nc_zt=24&_nc_ht=scontent.fhan14-3.fna&_nc_gid=5R2HM8vB5kp22OYt6-Knag&_nc_ss=7b2a8&oh=00_Af90UQrgPWo_zTnCheTwDNsmReMY_ca7qndATemPlCsSow&oe=6A35F14A","Thầy Trần Hải Anh","Giảng viên Bộ môn KT&HDHMT","Chuyên ngành: AI ứng dụng")}
                 ${renderLecturerCard("https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/503099469_24122887127318543_800808978697749015_n.jpg?stp=dst-jpg_tt6&cstp=mx1500x1500&ctp=s1500x1500&_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEsbD9jwuIOmnrkCaAARHu4iuAafgB9YveK4Bp-AH1i90mGgVhVJ0-q05LIqdNNbVJiy79GMGbyS4i75cGldLT8&_nc_ohc=vU8vSaBE-GwQ7kNvwF4-Gkl&_nc_oc=AdrZE9nENXcj0uJ4W6PMqh0Ouo7NkkckWx--J_g8bgAvutdehevzH9PPw1TADgzovZyCpG_ktuWDxNv59ZOHYrE-&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=HkIuwG-P_SOBLbnjWEjksQ&_nc_ss=7b2a8&oh=00_Af98hZ8rAw42C5JR4B0Br14hwTfYcbzNoHdTH9JB6axp4w&oe=6A35FAC5","Thầy Trần Đăng Công","Truỏng Khoa CNTT")}
                 ${renderLecturerCard("https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/503099469_24122887127318543_800808978697749015_n.jpg?stp=dst-jpg_tt6&cstp=mx1500x1500&ctp=s1500x1500&_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEsbD9jwuIOmnrkCaAARHu4iuAafgB9YveK4Bp-AH1i90mGgVhVJ0-q05LIqdNNbVJiy79GMGbyS4i75cGldLT8&_nc_ohc=vU8vSaBE-GwQ7kNvwF4-Gkl&_nc_oc=AdrZE9nENXcj0uJ4W6PMqh0Ouo7NkkckWx--J_g8bgAvutdehevzH9PPw1TADgzovZyCpG_ktuWDxNv59ZOHYrE-&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=HkIuwG-P_SOBLbnjWEjksQ&_nc_ss=7b2a8&oh=00_Af98hZ8rAw42C5JR4B0Br14hwTfYcbzNoHdTH9JB6axp4w&oe=6A35FAC5","Thầy Lê Trung Hiếu","Tân Tiến Sĩ, Phó Trưởng Khoa CNTT")}
            </div>
        </div>
    </aside>`;
}

function renderLecturerCard(img, name, role, major) {
    return `<div class="lecturer-mini-card">
        <img src="${img}" alt="${escapeHtml(name)}">
        <div class="lecturer-info">
            <div class="name">${escapeHtml(name)}</div>
            <div class="meta">${escapeHtml(role)}</div>
            <div class="meta">${escapeHtml(major)}</div>
        </div>
    </div>`;
}

function renderFooter() {
    return `
    <footer class="site-footer">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-3">
                    <h6>LIÊN HỆ</h6>
                    <p class="small mb-1 opacity-75">ScholarHub - DNU</p>
                    <p class="small mb-1 opacity-75">Số 1 Phố Xốm, Hà Đông, Hà Nội</p>
                    <a href="mailto:scholarhub@dnu.edu.vn">scholarhub@dnu.edu.vn</a>
                </div>
                <div class="col-md-3">
                    <h6>THÔNG TIN</h6>
                    <a href="${window.SH_HTML}about.html">Giới thiệu</a>
                    <a href="${window.SH_HTML}documents.html">Kho tài liệu</a>
                    <a href="${window.SH_HTML}upload.html">Đăng tải</a>
                    <a href="${window.SH_HTML}attendance.html">Điểm danh Face ID</a>
                    <a href="${window.SH_HTML}admin.html#attendance">Quản lý điểm danh (Admin)</a>
                </div>
                <div class="col-md-3">
                    <h6>TÀI KHOẢN</h6>
                    <a href="${window.SH_HTML}login.html">Đăng nhập</a>
                    <a href="${window.SH_HTML}register.html">Đăng ký</a>
                    <a href="${window.SH_HTML}profile.html">Hồ sơ &amp; Xu</a>
                </div>
                <div class="col-md-3">
                    ${renderBrandLink(window.SH_ROOT + "index.html", "footer")}
                    <p class="small opacity-75 mt-2">Nền tảng chia sẻ tài liệu học tập trực tuyến cho sinh viên Đại Nam.</p>
                </div>
            </div>
            <hr class="border-light opacity-25 my-3">
            <p class="small text-center mb-0 opacity-75">© Bản quyền thuộc về ScholarHub — Nhóm 11 FIT-DNU</p>
        </div>
    </footer>
    <button type="button" class="floating-chat" title="Hỗ trợ ScholarBot AI" onclick="toggleSupportChat()"><i class="fa-solid fa-robot"></i></button>
    <div class="support-chat-box d-none" id="support-chat-box">
        <div class="support-chat-header">
            <div class="support-chat-header-top">
                <span><i class="fa-solid fa-robot me-1"></i>Hỗ trợ trực tuyến</span>
                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-sm btn-outline-light border-0 py-0 px-1" type="button" onclick="toggleModelSelect()" title="Đổi Model AI"><i class="fa-solid fa-gear" style="font-size:.72rem"></i></button>
                    <button class="btn btn-sm btn-outline-light border-0 py-0 px-1" type="button" onclick="clearChatBox()" title="Xóa lịch sử chat"><i class="fa-solid fa-trash-can" style="font-size:.72rem"></i></button>
                    <button class="btn-close btn-close-white btn-sm" type="button" onclick="toggleSupportChat()"></button>
                </div>
            </div>
            <div id="ai-model-select-wrapper" class="d-none bg-light p-2 border-bottom">
                <label class="form-label text-dark small mb-1">Chọn AI Model:</label>
                <div class="input-group input-group-sm mb-2">
                    <select id="ai-model-select" class="form-select form-select-sm text-dark" onchange="changeAIModel(this.value)">
                        <option value="openrouter/free">OpenRouter Free (Mặc định)</option>
                        <option value="google/gemini-2.5-flash-free">Gemini 2.5 Flash</option>
                        <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                        <option value="qwen/qwen-2.5-coder-32b-instruct:free">Qwen 2.5 (Free)</option>
                    </select>
                </div>
                <label class="form-label text-dark small mb-1">OpenRouter API Key (Tùy chọn):</label>
                <div class="input-group input-group-sm">
                    <input type="password" id="ai-apikey-input" class="form-control form-control-sm" placeholder="Nhập API Key...">
                    <button class="btn btn-secondary" type="button" onclick="saveAIApiKey()">Lưu</button>
                </div>
            </div>
            <div class="chat-mode-tabs">
                <button class="chat-mode-btn active" id="tab-chat-ai" onclick="switchChatMode('ai')">ScholarBot AI</button>
                <button class="chat-mode-btn" id="tab-chat-admin" onclick="switchChatMode('admin')">Admin</button>
            </div>
        </div>
        <div class="support-chat-body" id="support-chat-body"></div>
        <div class="support-chat-input">
            <input type="text" id="support-chat-input" class="form-control form-control-sm" placeholder="Nhập tin nhắn..." onkeydown="if(event.key==='Enter')document.getElementById('support-chat-send').click()">
            <button type="button" class="btn btn-primary btn-sm" id="support-chat-send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
    </div>`;
}

function initLayout(activePage, options) {
    const opts = options || {};
    const headerEl = document.getElementById("app-header");
    const sidebarEl = document.getElementById("app-sidebar");
    const rightbarEl = document.getElementById("app-rightbar");
    const footerEl = document.getElementById("app-footer");

    if (headerEl) headerEl.innerHTML = renderHeader(activePage);
    if (sidebarEl && opts.sidebar !== false) sidebarEl.innerHTML = renderSidebar(activePage);
    if (rightbarEl && opts.rightbar !== false) rightbarEl.innerHTML = renderRightbar();
    if (footerEl) footerEl.innerHTML = renderFooter();

    initCountdown();
    loadLeaderboard();
    bindConsultForm();
    initActivityTicker();
}

function updateHeaderUserUI() {
    const user = getCurrentUser();
    const xuEl = document.getElementById("header-xu-val");
    const avEl = document.getElementById("header-avatar");
    if (xuEl && user) xuEl.textContent = user.so_xu || 0;
    if (avEl && user) avEl.src = user.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0];
}

function initCountdown() {
    const settings = getExamCountdownSettings();
    const titleEl = document.getElementById("exam-title");
    if (titleEl) titleEl.textContent = settings.title;
    const target = new Date(settings.targetDate).getTime();
    function tick() {
        const now = Date.now();
        let diff = Math.max(0, target - now);
        const d = Math.floor(diff / 86400000);
        diff -= d * 86400000;
        const h = Math.floor(diff / 3600000);
        diff -= h * 3600000;
        const m = Math.floor(diff / 60000);
        diff -= m * 60000;
        const s = Math.floor(diff / 1000);
        const set = function (id, v) {
            const el = document.getElementById(id);
            if (el) el.textContent = String(v).padStart(id === "cd-days" ? 1 : 2, "0");
        };
        set("cd-days", d);
        set("cd-hours", h);
        set("cd-mins", m);
        set("cd-secs", s);
    }
    tick();
    setInterval(tick, 1000);
}

function loadLeaderboard() {
    const container = document.getElementById("leaderboard-list");
    if (!container) return;

    const localUsers = typeof getLocalUsers === "function" ? getLocalUsers() : [];
    const apiUsers = api.getAllUsers().catch(function () { return []; });
    Promise.all([Promise.resolve(localUsers), apiUsers])
        .then(function (res) {
            const merged = res[0].slice();
            const apiList = res[1] || [];
            apiList.forEach(function (u) {
                if (!u.email || /^email\s*\d+$/i.test(u.email)) return;
                const exists = merged.some(function (m) {
                    return (m.email || "").toLowerCase() === (u.email || "").toLowerCase();
                });
                if (!exists) merged.push(normalizeApiUser(u));
            });
            renderLeaderboardByMode("week", merged, container);
            bindLeaderboardTabs(merged, container);
        })
        .catch(function () {
            container.innerHTML = '<p class="small text-muted">Đang cập nhật...</p>';
        });
}

function renderLeaderboardByMode(mode, users, container) {
    const list = users.slice().sort(function (a, b) {
        const aVal = mode === "month" ? (Number(a.so_xu) || 0) : (Number(a.diem_tich_luy) || Number(a.so_xu) || 0);
        const bVal = mode === "month" ? (Number(b.so_xu) || 0) : (Number(b.diem_tich_luy) || Number(b.so_xu) || 0);
        return bVal - aVal;
    });
    const top = list.slice(0, 5);
    if (top.length === 0) {
        container.innerHTML = '<p class="small text-muted mb-0">Chưa có dữ liệu</p>';
        return;
    }
    let html = "";
    for (let i = 0; i < top.length; i++) {
        const u = top[i];
        const av = u.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[i % 6];
        const score = mode === "month" ? (Number(u.so_xu) || 0) : (Number(u.diem_tich_luy) || Number(u.so_xu) || 0);
        html += `<div class="leaderboard-item">
            <span class="leaderboard-rank">${i + 1}</span>
            <img src="${av}" class="leaderboard-avatar" alt="">
            <div class="flex-grow-1 min-width-0">
                <div class="fw-semibold text-truncate">${escapeHtml(u.ho_ten || "SV")}</div>
                <div class="text-muted" style="font-size:.7rem">${escapeHtml(u.truong_hoc || "DNU")}</div>
            </div>
            <span class="fw-bold text-primary">${score}</span>
        </div>`;
    }
    container.innerHTML = html;
}

function bindLeaderboardTabs(users, container) {
    const tabs = document.querySelectorAll("#lb-tabs [data-lb]");
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");
            renderLeaderboardByMode(tab.getAttribute("data-lb"), users, container);
        });
    });
}

function getExamCountdownSettings() {
    try {
        const raw = localStorage.getItem("scholarhub_exam_settings");
        const cfg = JSON.parse(raw || "{}");
        return {
            title: cfg.title || "Đếm ngược kỳ thi",
            targetDate: cfg.targetDate || SCHOLARHUB_CONFIG.EXAM_COUNTDOWN
        };
    } catch (e) {
        return { title: "Đếm ngược kỳ thi", targetDate: SCHOLARHUB_CONFIG.EXAM_COUNTDOWN };
    }
}

function toggleSupportChat() {
    const box = document.getElementById("support-chat-box");
    if (!box) return;
    box.classList.toggle("d-none");
    if (!box.classList.contains("d-none")) {
        renderChatForCurrentUser();
    }
}

let currentChatMode = 'ai'; // 'ai' or 'admin'

function switchChatMode(mode) {
    currentChatMode = mode;
    document.getElementById('tab-chat-ai').classList.toggle('active', mode === 'ai');
    document.getElementById('tab-chat-admin').classList.toggle('active', mode === 'admin');
    
    const input = document.getElementById('support-chat-input');
    if (input) {
        input.placeholder = mode === 'ai' ? 'Hỏi ScholarBot...' : 'Nhắn tin cho Admin...';
    }
    renderChatForCurrentUser();
}

function clearChatBox() {
    if (currentChatMode === 'ai') {
        clearAIChat();
    } else {
        clearAdminChat();
    }
}

function getCurrentChatUserKey() {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (user && user.id) return String(user.id);
    return "guest";
}

function getChatStore() {
    try {
        const all = JSON.parse(localStorage.getItem("scholarhub_chat_threads") || "{}");
        return all && typeof all === "object" ? all : {};
    } catch (e) {
        return {};
    }
}

function saveChatStore(store) {
    localStorage.setItem("scholarhub_chat_threads", JSON.stringify(store || {}));
}

function appendChatMessage(userKey, sender, text) {
    const store = getChatStore();
    if (!store[userKey]) store[userKey] = [];
    store[userKey].push({
        id: "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        sender: sender,
        text: text,
        createdAt: new Date().toISOString()
    });
    saveChatStore(store);
}

function renderChatForCurrentUser() {
    const body = document.getElementById("support-chat-body");
    if (!body) return;
    
    if (currentChatMode === 'ai') {
        if (body.children.length === 0 || body.innerHTML.includes('Admin')) {
            clearAIChat();
        }
    } else {
        const userKey = getCurrentChatUserKey();
        const store = getChatStore();
        const msgs = store[userKey] || [];
        if (!msgs.length) {
            body.innerHTML = '<div class="chat-msg bot"><i class="fa-solid fa-headset chat-bot-icon"></i>Xin chào! Admin đã nhận được kết nối. Bạn cần giúp gì ạ?</div>';
            return;
        }
        body.innerHTML = msgs.map(function (m) {
            return '<div class="chat-msg ' + (m.sender === "user" ? "user" : "bot") + '">' + escapeHtml(m.text) + "</div>";
        }).join("");
        body.scrollTop = body.scrollHeight;
    }
}

function addChatBubble(body, sender, html) {
    var div = document.createElement("div");
    div.className = "chat-msg " + sender;
    if (sender === "bot") {
        div.innerHTML = '<i class="fa-solid fa-robot chat-bot-icon"></i>' + html;
    } else {
        div.innerHTML = html;
    }
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function showTypingIndicator(body) {
    var div = document.createElement("div");
    div.className = "chat-msg bot typing-indicator";
    div.id = "ai-typing";
    div.innerHTML = '<i class="fa-solid fa-robot chat-bot-icon"></i><span class="typing-dots"><span></span><span></span><span></span></span>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
    var el = document.getElementById("ai-typing");
    if (el) el.remove();
}

function clearAIChat() {
    if (typeof GeminiChat !== "undefined") GeminiChat.clearHistory();
    var body = document.getElementById("support-chat-body");
    if (body) {
        body.innerHTML = '<div class="chat-msg bot"><i class="fa-solid fa-robot chat-bot-icon"></i>Xin chào! Mình là <strong>ScholarBot</strong> — trợ lý AI của ScholarHub. Bạn cần hỗ trợ gì?</div>';
    }
}

function clearAdminChat() {
    const userKey = getCurrentChatUserKey();
    const store = getChatStore();
    store[userKey] = [];
    saveChatStore(store);
    var body = document.getElementById('support-chat-body');
    if (body) {
        body.innerHTML = '<div class="chat-msg bot"><i class="fa-solid fa-headset chat-bot-icon"></i>Xin chào! Admin đã nhận được kết nối. Bạn cần giúp gì ạ?</div>';
    }
}

document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("#support-chat-send");
    if (!btn) return;

    const input = document.getElementById("support-chat-input");
    const body = document.getElementById("support-chat-body");
    const text = input && input.value ? input.value.trim() : "";
    if (!text || !body) return;

    if (currentChatMode === 'ai') {
        addChatBubble(body, "user", escapeHtml(text));
        input.value = "";
        input.disabled = true;
        btn.disabled = true;

        showTypingIndicator(body);

        if (typeof GeminiChat !== "undefined") {
            GeminiChat.sendMessage(text, function (reply) {
                removeTypingIndicator();
                addChatBubble(body, "bot", GeminiChat.formatResponse(reply));
                input.disabled = false;
                btn.disabled = false;
                input.focus();
            }, function (err) {
                removeTypingIndicator();
                addChatBubble(body, "bot error", "Xin lỗi, có lỗi xảy ra: " + escapeHtml(err));
                input.disabled = false;
                btn.disabled = false;
                input.focus();
            });
        } else {
            removeTypingIndicator();
            addChatBubble(body, "bot error", "AI chưa sẵn sàng. Vui lòng thử lại sau.");
            input.disabled = false;
            btn.disabled = false;
        }
    } else {
        // Admin chat mode
        input.value = "";
        const userKey = getCurrentChatUserKey();
        appendChatMessage(userKey, "user", text);
        renderChatForCurrentUser(); // update ui immediately
    }
});

function bindConsultForm() {
    const btn = document.getElementById("btn-consult");
    if (!btn) return;
    btn.addEventListener("click", function () {
        const name = (document.getElementById("consult-name") || {}).value || "";
        const email = (document.getElementById("consult-email") || {}).value || "";
        const phone = (document.getElementById("consult-phone") || {}).value || "";
        if (!name.trim() || !phone.trim() || !email.trim()) {
            showToast("Vui lòng nhập họ tên, email và SĐT", "error");
            return;
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            showToast("Email không hợp lệ", "error");
            return;
        }

        showToast("Đã gửi yêu cầu tư vấn!", "success");
    });
}

function getActivityFeed() {
    try {
        const raw = localStorage.getItem("scholarhub_activity_feed");
        const arr = JSON.parse(raw || "[]");
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function saveActivityFeed(feed) {
    localStorage.setItem("scholarhub_activity_feed", JSON.stringify(feed || []));
}

function publishUserActivity(action, target) {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user || !user.id) return;
    const feed = getActivityFeed();
    const newItem = {
        id: "act-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        user_id: String(user.id),
        user_name: user.ho_ten || user.ten_dang_nhap || user.email || "Người dùng",
        avatar: user.anh_dai_dien || (SCHOLARHUB_CONFIG.DEFAULT_AVATARS || [])[0] || "",
        action: action,
        target: target || "",
        created_at: new Date().toISOString()
    };
    feed.push(newItem);
    const clipped = feed.slice(-120);
    saveActivityFeed(clipped);

    if (typeof showActivityToast === "function") {
        showActivityToast(newItem);
        sessionStorage.setItem("scholarhub_activity_last_seen", String(new Date(newItem.created_at).getTime()));
    }
}

function initActivityTicker() {
    if (window.__activityTickerBound) return;
    window.__activityTickerBound = true;

    if (!sessionStorage.getItem("scholarhub_activity_last_seen")) {
        const feed = getActivityFeed();
        let initialTime = Date.now();
        if (feed.length > 0) {
            // Start polling from the last item so we don't replay the entire history
            initialTime = new Date(feed[feed.length - 1].created_at).getTime() - 1000;
        }
        sessionStorage.setItem("scholarhub_activity_last_seen", String(initialTime));
    }

    const poll = function () {
        const feed = getActivityFeed();
        if (!feed.length) return;
        const lastSeen = Number(sessionStorage.getItem("scholarhub_activity_last_seen") || "0");
        const next = feed.find(function (item) {
            return new Date(item.created_at).getTime() > lastSeen;
        });
        if (!next) return;
        showActivityToast(next);
        sessionStorage.setItem("scholarhub_activity_last_seen", String(new Date(next.created_at).getTime()));
    };

    poll();
    setInterval(poll, 4000);
    window.addEventListener("storage", function (e) {
        if (e.key === "scholarhub_activity_feed") poll();
    });
}

function showActivityToast(item) {
    let container = document.getElementById("activity-feed-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "activity-feed-container";
        container.className = "activity-feed-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "activity-toast";
    toast.innerHTML = '<img src="' + escapeHtml(item.avatar || "") + '" alt=""><div class="activity-toast-content"><div class="activity-toast-user">' + escapeHtml(item.user_name || "Người dùng") + '</div><div class="activity-toast-text">' + escapeHtml(item.action || "đã thao tác") + (item.target ? ": " + escapeHtml(item.target) : "") + "</div></div>";
    container.appendChild(toast);
    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () { toast.remove(); }, 320);
    }, 3600);
}

window.initLayout = initLayout;
window.updateHeaderUserUI = updateHeaderUserUI;
window.renderHeader = renderHeader;
window.renderBrandLink = renderBrandLink;
window.toggleSupportChat = toggleSupportChat;
window.clearAIChat = clearAIChat;
window.publishUserActivity = publishUserActivity;

window.switchChatMode = switchChatMode;
window.clearChatBox = clearChatBox;


window.toggleModelSelect = function toggleModelSelect() {
    const wrapper = document.getElementById('ai-model-select-wrapper');
    if (wrapper) wrapper.classList.toggle('d-none');
    
    if (typeof GeminiChat !== 'undefined') {
        const select = document.getElementById('ai-model-select');
        const keyInput = document.getElementById('ai-apikey-input');
        
        if (select) {
            const current = GeminiChat.getModel();
            const optionExists = Array.from(select.options).some(opt => opt.value === current);
            if (!optionExists) {
                const opt = document.createElement('option');
                opt.value = current;
                opt.text = current + ' (Tùy chỉnh)';
                select.appendChild(opt);
            }
            select.value = current;
        }
        
        if (keyInput) {
            const k = GeminiChat.getApiKey();
            if (k && k !== "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") {
                keyInput.value = k;
            } else {
                keyInput.value = "";
            }
        }
    } 
};

window.changeAIModel = function changeAIModel(modelId) {
    if (typeof GeminiChat !== 'undefined') {
        GeminiChat.setModel(modelId);
        showToast('Đã đổi model AI thành: ' + modelId, 'success');
        document.getElementById('ai-model-select-wrapper').classList.add('d-none');
    }
};

window.saveAIApiKey = function saveAIApiKey() {
    if (typeof GeminiChat !== 'undefined') {
        const val = document.getElementById('ai-apikey-input').value.trim();
        GeminiChat.setApiKey(val);
        showToast(val ? 'Đã lưu API Key thành công' : 'Đã xóa API Key, dùng mặc định', 'success');
        document.getElementById('ai-model-select-wrapper').classList.add('d-none');
    }
};
