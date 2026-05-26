/**
 * ScholarHub - Layout kiểu BKTin (header, sidebar, rightbar, footer)
 */

const NAV_TOP = [
    { id: "home", href: "index.html", icon: "fa-house", label: "Trang chủ" },
    { id: "documents", href: "documents.html", icon: "fa-file-lines", label: "Tài liệu" },
    { id: "subjects", href: "subjects.html", icon: "fa-book", label: "Môn học" },
    { id: "premium", href: "documents.html?filter=premium", icon: "fa-crown", label: "Tài liệu VIP" },
    { id: "upload", href: "upload.html", icon: "fa-cloud-arrow-up", label: "Đăng tải" },
    { id: "favorites", href: "favorites.html", icon: "fa-bookmark", label: "Yêu thích" }
];

/**
 * Logo chính — dùng logo.png trên toàn site
 * @param {string} href
 * @param {"header"|"auth"|"admin"|"footer"} variant
 */
function renderBrandLink(href, variant) {
    const v = variant || "header";
    const logo = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.LOGO) || "logo.png";
    const alt = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.SITE_NAME) || "ScholarHub";
    const home = href || "index.html";
    return `<a href="${home}" class="site-brand site-brand--${v}" aria-label="${alt}">
        <img src="${logo}" alt="${alt}" class="site-brand__img" width="180" height="48">
    </a>`;
}

const NAV_SIDEBAR = [
    { id: "documents", href: "documents.html", icon: "fa-file-lines", label: "Kho tài liệu" },
    { id: "subjects", href: "subjects.html", icon: "fa-book", label: "Môn học" },
    { id: "premium", href: "documents.html?filter=premium", icon: "fa-crown", label: "Tài liệu trả phí" },
    { id: "upload", href: "upload.html", icon: "fa-upload", label: "Đóng góp TL" },
    { id: "favorites", href: "favorites.html", icon: "fa-heart", label: "Yêu thích" },
    { id: "profile", href: "profile.html", icon: "fa-user", label: "Hồ sơ cá nhân" },
    { divider: true },
    { id: "leaderboard", href: "profile.html#bang-xep-hang", icon: "fa-trophy", label: "Bảng xếp hạng" },
    { id: "wallet", href: "profile.html#nap-xu", icon: "fa-coins", label: "Nạp xu" }
];

function renderHeader(activePage) {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const logged = user && user.id;

    let topLinks = "";
    for (let i = 0; i < NAV_TOP.length; i++) {
        const n = NAV_TOP[i];
        const active = n.id === activePage ? " active" : "";
        topLinks += `<li class="nav-item"><a class="nav-link nav-top-link${active}" href="${n.href}"><i class="fa-solid ${n.icon}"></i>${n.label}</a></li>`;
    }

    const userBlock = logged
        ? `<span class="coin-badge-header d-none d-md-inline-flex" id="header-xu-badge"><i class="fa-solid fa-coins"></i><span id="header-xu-val">${user.so_xu || 0}</span> Xu</span>
           <a href="favorites.html" class="header-icon-btn" title="Yêu thích"><i class="fa-solid fa-bookmark"></i></a>
           <a href="profile.html" title="Hồ sơ"><img src="${user.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0]}" class="user-avatar-sm" id="header-avatar" alt=""></a>`
        : `<a href="login.html" class="btn btn-primary btn-sm rounded-pill px-3">Đăng nhập</a>
           <a href="register.html" class="btn btn-outline-primary btn-sm rounded-pill px-3 ms-1">Đăng ký</a>`;

    return `
    <header class="app-header">
        <nav class="navbar navbar-expand-lg py-2">
            <div class="container-fluid px-3 px-lg-4">
                ${renderBrandLink("index.html", "header")}
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNav"><span class="navbar-toggler-icon"></span></button>
                <div class="collapse navbar-collapse" id="topNav">
                    <ul class="navbar-nav mx-auto">${topLinks}</ul>
                    <div class="d-flex align-items-center gap-2">${userBlock}
                        <a href="admin.html" class="header-icon-btn d-none d-md-inline-flex" title="Admin"><i class="fa-solid fa-gear"></i></a>
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
        html += `<a href="${item.href}" class="sidebar-link${active}" data-nav="${item.id}"><i class="fa-solid ${item.icon}"></i>${item.label}</a>`;
    }
    html += `<div class="sidebar-social">
        <a href="#" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="#" title="Zalo"><i class="fa-solid fa-comment"></i></a>
        <a href="#" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
    </div></nav>`;
    return html;
}

function renderRightbar() {
    return `
    <aside class="app-rightbar-inner">
        <div class="countdown-box">
            <div class="widget-title text-white mb-2" style="font-size:.85rem">Đếm ngược kỳ thi</div>
            <div class="countdown-grid" id="exam-countdown">
                <div class="countdown-item"><span class="num" id="cd-days">0</span><span class="lbl">Ngày</span></div>
                <div class="countdown-item"><span class="num" id="cd-hours">00</span><span class="lbl">Giờ</span></div>
                <div class="countdown-item"><span class="num" id="cd-mins">00</span><span class="lbl">Phút</span></div>
                <div class="countdown-item"><span class="num" id="cd-secs">00</span><span class="lbl">Giây</span></div>
            </div>
        </div>
        <div class="widget-box">
            <div class="widget-title"><i class="fa-solid fa-trophy text-warning me-1"></i> Bảng xếp hạng</div>
            <ul class="nav nav-pills nav-fill mb-2" id="lb-tabs">
                <li class="nav-item"><button class="nav-link active py-1 small" data-lb="week">Tuần</button></li>
                <li class="nav-item"><button class="nav-link py-1 small" data-lb="month">Tháng</button></li>
            </ul>
            <div id="leaderboard-list"><div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div></div>
        </div>
        <div class="widget-consult">
            <div class="fw-bold mb-2">Nhận tư vấn miễn phí</div>
            <input type="text" class="form-control form-control-sm" id="consult-name" placeholder="Họ tên">
            <input type="tel" class="form-control form-control-sm" id="consult-phone" placeholder="Số điện thoại">
            <button type="button" class="btn btn-light btn-sm mt-1" id="btn-consult">Gửi yêu cầu</button>
        </div>
    </aside>`;
}

function renderFooter() {
    return `
    <footer class="site-footer">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-3">
                    <h6>LIÊN HỆ</h6>
                    <p class="small mb-1 opacity-75">ScholarHub - DNU</p>
                    <p class="small mb-1 opacity-75">Số 08, Nguyễn Văn Cừ, Đà Nẵng</p>
                    <a href="mailto:scholarhub@dnu.edu.vn">scholarhub@dnu.edu.vn</a>
                </div>
                <div class="col-md-3">
                    <h6>THÔNG TIN</h6>
                    <a href="about.html">Giới thiệu</a>
                    <a href="documents.html">Kho tài liệu</a>
                    <a href="upload.html">Đăng tải</a>
                </div>
                <div class="col-md-3">
                    <h6>TÀI KHOẢN</h6>
                    <a href="login.html">Đăng nhập</a>
                    <a href="register.html">Đăng ký</a>
                    <a href="profile.html">Hồ sơ &amp; Xu</a>
                </div>
                <div class="col-md-3">
                    ${renderBrandLink("index.html", "footer")}
                    <p class="small opacity-75 mt-2">Nền tảng chia sẻ tài liệu học tập trực tuyến cho sinh viên Đại Nam.</p>
                </div>
            </div>
            <hr class="border-light opacity-25 my-3">
            <p class="small text-center mb-0 opacity-75">© Bản quyền thuộc về ScholarHub — Nhóm 11 FIT-DNU</p>
        </div>
    </footer>
    <button type="button" class="floating-chat" title="Hỗ trợ" onclick="showToast('Chat hỗ trợ đang phát triển','info')"><i class="fa-solid fa-comments"></i></button>`;
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
}

function updateHeaderUserUI() {
    const user = getCurrentUser();
    const xuEl = document.getElementById("header-xu-val");
    const avEl = document.getElementById("header-avatar");
    if (xuEl && user) xuEl.textContent = user.so_xu || 0;
    if (avEl && user) avEl.src = user.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0];
}

function initCountdown() {
    const target = new Date(SCHOLARHUB_CONFIG.EXAM_COUNTDOWN).getTime();
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
            const list = merged.slice().sort(function (a, b) {
                return (Number(b.diem_tich_luy) || Number(b.so_xu) || 0) - (Number(a.diem_tich_luy) || Number(a.so_xu) || 0);
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
                html += `<div class="leaderboard-item">
                    <span class="leaderboard-rank">${i + 1}</span>
                    <img src="${av}" class="leaderboard-avatar" alt="">
                    <div class="flex-grow-1 min-width-0">
                        <div class="fw-semibold text-truncate">${escapeHtml(u.ho_ten || "SV")}</div>
                        <div class="text-muted" style="font-size:.7rem">${escapeHtml(u.truong_hoc || "DNU")}</div>
                    </div>
                    <span class="fw-bold text-primary">${Number(u.diem_tich_luy) || Number(u.so_xu) || 0}</span>
                </div>`;
            }
            container.innerHTML = html;
        })
        .catch(function () {
            container.innerHTML = '<p class="small text-muted">Đang cập nhật...</p>';
        });
}

function bindConsultForm() {
    const btn = document.getElementById("btn-consult");
    if (!btn) return;
    btn.addEventListener("click", function () {
        const name = (document.getElementById("consult-name") || {}).value || "";
        const phone = (document.getElementById("consult-phone") || {}).value || "";
        if (!name.trim() || !phone.trim()) {
            showToast("Vui lòng nhập họ tên và SĐT", "error");
            return;
        }
        showToast("Đã gửi yêu cầu tư vấn!", "success");
    });
}

window.initLayout = initLayout;
window.updateHeaderUserUI = updateHeaderUserUI;
window.renderHeader = renderHeader;
window.renderBrandLink = renderBrandLink;
