/**
 * ScholarHub - Trang tài liệu
 */
let allDocsCache = [];
let subjectsCache = [];

function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}

function populateFilters(subjects) {
    const selMon = document.getElementById("filter-mon");
    const selNam = document.getElementById("filter-nam");
    const selLoai = document.getElementById("filter-loai");

    if (selMon) {
        let opts = '<option value="">Tất cả môn học</option>';
        for (let i = 0; i < subjects.length; i++) {
            opts += `<option value="${subjects[i].id}">${escapeHtml(subjects[i].ten_mon_hoc)}</option>`;
        }
        selMon.innerHTML = opts;
        const monParam = getQueryParam("mon");
        if (monParam) selMon.value = monParam;
    }

    if (selNam) {
        const years = [];
        for (let j = 0; j < allDocsCache.length; j++) {
            const y = allDocsCache[j].nam_hoc;
            if (y && years.indexOf(y) < 0) years.push(y);
        }
        years.sort().reverse();
        let yearOpts = '<option value="">Tất cả năm học</option>';
        for (let k = 0; k < years.length; k++) {
            yearOpts += `<option value="${escapeHtml(years[k])}">${escapeHtml(years[k])}</option>`;
        }
        selNam.innerHTML = yearOpts;
    }

    if (selLoai) {
        let loaiOpts = '<option value="">Tất cả loại</option>';
        const types = SCHOLARHUB_CONFIG.DOC_TYPES;
        for (let t = 0; t < types.length; t++) {
            loaiOpts += `<option value="${escapeHtml(types[t])}">${escapeHtml(types[t])}</option>`;
        }
        selLoai.innerHTML = loaiOpts;
    }
}

function filterDocuments() {
    const q = (document.getElementById("search-docs") || {}).value || "";
    const term = q.toLowerCase().trim();
    const mon = (document.getElementById("filter-mon") || {}).value || "";
    const nam = (document.getElementById("filter-nam") || {}).value || "";
    const loai = (document.getElementById("filter-loai") || {}).value || "";
    const sort = (document.getElementById("sort-docs") || {}).value || "views";

    let list = getApprovedDocuments(allDocsCache);

    if (term) {
        list = list.filter(function (d) {
            const title = (d.tieu_de || "").toLowerCase();
            const tags = (d.tu_khoa || "").toLowerCase();
            const author = (d.nguoi_dang || "").toLowerCase();
            return title.includes(term) || tags.includes(term) || author.includes(term);
        });
    }
    if (mon) {
        list = list.filter(function (d) {
            return String(d.id_mon_hoc) === String(mon);
        });
    }
    if (nam) {
        list = list.filter(function (d) {
            return d.nam_hoc === nam;
        });
    }
    if (loai) {
        list = list.filter(function (d) {
            return d.loai_tai_lieu === loai;
        });
    }

    const premiumFilter = getQueryParam("filter") === "premium";
    if (premiumFilter) {
        list = list.filter(function (d) {
            return getDocPrice(d) > 0;
        });
    }

    if (sort === "views") {
        list.sort(function (a, b) {
            return (Number(b.so_luot_xem) || 0) - (Number(a.so_luot_xem) || 0);
        });
    } else if (sort === "newest") {
        list.sort(function (a, b) {
            return new Date(b.ngay_tao || 0) - new Date(a.ngay_tao || 0);
        });
    } else if (sort === "rating") {
        list.sort(function (a, b) {
            return (Number(b.diem_danh_gia) || 0) - (Number(a.diem_danh_gia) || 0);
        });
    }

    renderDocGrid(list);
    const countEl = document.getElementById("result-count");
    if (countEl) countEl.textContent = list.length + " kết quả";
}

function renderDocGrid(docs) {
    const grid = document.getElementById("docs-grid");
    if (!grid) return;
    grid.innerHTML = "";
    if (docs.length === 0) {
        grid.innerHTML = `<div class="col-12 empty-state"><i class="fa-solid fa-magnifying-glass fa-3x mb-3 opacity-25"></i><p>Không tìm thấy tài liệu phù hợp.</p></div>`;
        return;
    }
    for (let i = 0; i < docs.length; i++) {
        const subName = getSubjectName(subjectsCache, docs[i].id_mon_hoc);
        jqAppendDocCard("#docs-grid", buildDocCardHtml(docs[i], subName));
    }
}

function loadDocumentsPage() {
    showLoading("docs-loader", 8);
    const grid = document.getElementById("docs-grid");
    if (grid) grid.innerHTML = "";

    initScholarHubData()
        .then(function () {
            return getAllDocumentsData().then(function (docs) {
                return getAllSubjectsData().then(function (subs) {
                    allDocsCache = docs;
                    subjectsCache = subs;
                    populateFilters(subs);
                    const qParam = getQueryParam("q");
                    if (qParam) {
                        const searchInput = document.getElementById("search-docs");
                        if (searchInput) searchInput.value = qParam;
                    }
                    filterDocuments();
                    const idParam = getQueryParam("id");
                    if (idParam) openDocDetail(idParam);
                });
            });
        })
        .catch(function () {
            if (grid) {
                grid.innerHTML = `<div class="col-12"><div class="alert alert-warning">Đang dùng dữ liệu demo offline.</div></div>`;
            }
            allDocsCache = SEED_DOCUMENTS.map(normalizeDocument);
            subjectsCache = getLocalSubjects();
            populateFilters(subjectsCache);
            filterDocuments();
        })
        .finally(function () {
            hideLoading("docs-loader");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    initLayout("documents");
    loadDocumentsPage();

    const searchInput = document.getElementById("search-docs");
    if (searchInput) {
        searchInput.addEventListener("input", filterDocuments);
    }

    ["filter-mon", "filter-nam", "filter-loai", "sort-docs"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", filterDocuments);
    });

    const btnSearch = document.getElementById("btn-search-docs");
    if (btnSearch) btnSearch.addEventListener("click", filterDocuments);
});
