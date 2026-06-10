/**
 * ScholarHub - Trang chủ
 */
let homeSubjects = [];

window.handleHeroSearch = function () {
    const input = document.getElementById("hero-search");
    const q = input ? input.value.trim() : "";
    window.location.href = q ? "html/documents.html?q=" + encodeURIComponent(q) : "html/documents.html";
};

function renderDocList(docs, containerId, subjects) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";
    if (docs.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="text-muted small">Chưa có tài liệu.</p></div>';
        return;
    }
    for (let i = 0; i < docs.length; i++) {
        const name = getSubjectName(subjects, docs[i].id_mon_hoc);
        jqAppendDocCard("#" + containerId, buildDocCardHtml(docs[i], name));
    }
}

function pickUniqueDocs(list, max) {
    const seenTitles = {};
    const seenImages = {};
    const out = [];
    for (let i = 0; i < list.length; i++) {
        const d = list[i];
        const titleKey = String(d.tieu_de || "").toLowerCase().trim();
        const imgKey = String(d.anh_bia || "").toLowerCase().trim();
        if (seenTitles[titleKey] || seenImages[imgKey]) continue;
        seenTitles[titleKey] = true;
        seenImages[imgKey] = true;
        out.push(d);
        if (out.length >= max) break;
    }
    return out;
}

function loadFeaturedDocuments() {
    showLoading("featured-loader", 4);

    getAllDocumentsData()
        .then(function (docs) {
            return getAllSubjectsData().then(function (subs) {
                homeSubjects = subs;
                const approved = getApprovedDocuments(docs);
                approved.sort(function (a, b) {
                    return (Number(b.so_luot_xem) || 0) - (Number(a.so_luot_xem) || 0);
                });
                renderDocList(pickUniqueDocs(approved, 8), "featured-grid", subs);

                const premium = approved.filter(function (d) {
                    return getDocPrice(d) > 0;
                });
                renderDocList(pickUniqueDocs(premium, 4), "premium-grid", subs);
            });
        })
        .catch(function () {
            const fallback = SEED_DOCUMENTS.map(normalizeDocument);
            renderDocList(fallback.slice(0, 8), "featured-grid", getLocalSubjects());
        })
        .finally(function () {
            hideLoading("featured-loader");
        });
}

function loadPopularSubjects() {
    const row = document.getElementById("subjects-row");
    if (!row) return;

    getAllSubjectsData().then(function (subs) {
        row.innerHTML = "";
        const list = subs.slice(0, 6);
        for (let i = 0; i < list.length; i++) {
            const s = list[i];
            row.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card doc-card h-100">
                    <div class="card-body">
                        <span class="badge bg-primary mb-2">${escapeHtml(s.ma_mon_hoc)}</span>
                        <h5 class="card-title fs-6 fw-bold">${escapeHtml(s.ten_mon_hoc)}</h5>
                        <p class="text-muted small mb-2">${escapeHtml(s.khoa_vien || "")}</p>
                        <p class="small mb-0 text-primary fw-semibold">${s.so_tin_chi || 0} tín chỉ</p>
                        <a href="html/documents.html?mon=${s.id}" class="stretched-link"></a>
                    </div>
                </div>
            </div>`;
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initScholarHubData().then(function () {
        initLayout("home");
        loadFeaturedDocuments();
        loadPopularSubjects();
    });

    const heroSearch = document.getElementById("hero-search");
    if (heroSearch) {
        heroSearch.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleHeroSearch();
            }
        });
    }
});
