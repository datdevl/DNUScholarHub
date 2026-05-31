function getMergedUsersForLeaderboard() {
    const local = typeof getLocalUsers === "function" ? getLocalUsers() : [];
    return api.getAllUsers().catch(function () { return []; }).then(function (apiList) {
        const users = local.slice();
        (apiList || []).forEach(function (u) {
            if (!u.email || /^email\s*\d+$/i.test(u.email)) return;
            const ex = users.some(function (x) {
                return (x.email || "").toLowerCase() === (u.email || "").toLowerCase();
            });
            if (!ex) users.push(normalizeApiUser(u));
        });
        return users;
    });
}

function renderLeaderboardPage(mode) {
    const listEl = document.getElementById("leaderboard-page-list");
    if (!listEl) return;
    getMergedUsersForLeaderboard().then(function (users) {
        users.sort(function (a, b) {
            const av = mode === "month" ? (Number(a.so_xu) || 0) : (Number(a.diem_tich_luy) || Number(a.so_xu) || 0);
            const bv = mode === "month" ? (Number(b.so_xu) || 0) : (Number(b.diem_tich_luy) || Number(b.so_xu) || 0);
            return bv - av;
        });
        const top = users.slice(0, 20);
        listEl.innerHTML = top.map(function (u, idx) {
            const score = mode === "month" ? (Number(u.so_xu) || 0) : (Number(u.diem_tich_luy) || Number(u.so_xu) || 0);
            return '<div class="leaderboard-item"><span class="leaderboard-rank">' + (idx + 1) + '</span><img src="' + escapeHtml(u.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[idx % 6]) + '" class="leaderboard-avatar" alt=""><div class="flex-grow-1"><div class="fw-semibold">' + escapeHtml(u.ho_ten || "Sinh viên") + '</div><div class="text-muted small">' + escapeHtml(u.truong_hoc || "DNU") + '</div></div><span class="fw-bold text-primary">' + score + "</span></div>";
        }).join("") || '<p class="text-muted">Chưa có dữ liệu.</p>';
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initLayout("leaderboard");
    renderLeaderboardPage("week");
    document.querySelectorAll("#leaderboard-page-tabs [data-mode]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll("#leaderboard-page-tabs .nav-link").forEach(function (x) { x.classList.remove("active"); });
            btn.classList.add("active");
            renderLeaderboardPage(btn.getAttribute("data-mode"));
        });
    });
});
