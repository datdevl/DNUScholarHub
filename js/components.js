/**
 * ScholarHub - Card & modal (BKTin style + xu)
 */

function buildDocCardHtml(doc, subjectName) {
    const fav = isFavorite(doc.id);
    const views = formatNumber(doc.so_luot_xem);
    const sub = subjectName || "";
    const img = getDocCoverUrl(doc, 400, 240);
    const price = getDocPrice(doc);
    const free = price === 0;
    const owned = hasPurchasedDoc(doc.id);
    const priceLabel = free ? "Miễn phí" : price + " Xu";
    const priceClass = free ? "free" : "";
    const badge = free
        ? '<span class="badge-free">FREE</span>'
        : '<span class="badge-premium"><i class="fa-solid fa-crown me-1"></i>VIP</span>';
    const cartIcon = free ? "fa-download" : owned ? "fa-check" : "fa-cart-shopping";
    const cartClass = free ? "" : "premium";

    return `
    <div class="col-6 col-md-4 col-xl-3 doc-item" data-id="${doc.id}">
        <div class="card doc-card h-100">
            <div class="card-img-wrap">
                <img src="${escapeHtml(img)}" class="card-img-top" alt="${escapeHtml(doc.tieu_de)}"
                     onerror="this.onerror=null;this.src='${escapeHtml(getDocFallbackCoverUrl(doc, 400, 240))}'">
                ${badge}
                ${owned && !free ? '<span class="purchased-badge position-absolute bottom-0 start-0 m-2">Đã mua</span>' : ""}
                <button type="button" class="btn btn-sm btn-light btn-fav position-absolute top-0 end-0 m-2 ${fav ? "active" : ""}"
                        onclick="event.stopPropagation(); handleToggleFavorite('${doc.id}', this);">
                    <i class="fa-${fav ? "solid" : "regular"} fa-bookmark"></i>
                </button>
            </div>
            <div class="card-body d-flex flex-column">
                <div class="doc-tag">${escapeHtml(doc.loai_tai_lieu || "Tài liệu")}</div>
                <h5 class="card-title">${escapeHtml(doc.tieu_de)}</h5>
                <div class="doc-meta"><i class="fa-solid fa-book me-1"></i>${escapeHtml(sub)} · <i class="fa-solid fa-eye ms-1"></i> ${views}</div>
                <div class="mb-1 mt-1">${renderStars(doc.diem_danh_gia)}</div>
                <div class="price-row mt-auto">
                    <span class="price-xu ${priceClass}"><i class="fa-solid fa-coins me-1"></i>${priceLabel}</span>
                    <button type="button" class="btn-cart ${cartClass}" onclick="event.stopPropagation(); handleDocAction('${doc.id}');" title="Chi tiết / Mua">
                        <i class="fa-solid ${cartIcon}"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function handleDocAction(id) {
    openDocDetail(id);
}

function handleToggleFavorite(docId, btn) {
    const nowFav = toggleFavorite(docId);
    const icon = btn.querySelector("i");
    if (icon) {
        icon.classList.toggle("fa-solid", nowFav);
        icon.classList.toggle("fa-regular", !nowFav);
    }
    btn.classList.toggle("active", nowFav);
}

function openDocDetail(id) {
    const modalEl = document.getElementById("docDetailModal");
    if (!modalEl) {
        window.location.href = "documents.html?id=" + id;
        return;
    }
    const body = document.getElementById("doc-detail-body");
    body.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    Promise.all([getDocumentByIdSmart(id), getAllSubjectsData()])
        .then(function (results) {
            const doc = results[0];
            const subjects = results[1];
            const subName = getSubjectName(subjects, doc.id_mon_hoc);
            const price = getDocPrice(doc);
            const free = price === 0;
            const owned = canAccessDoc(doc);
            const user = getCurrentUser();
            const userRating = getUserDocRating(doc.id);

            let actionHtml = "";
            if (free || owned) {
                actionHtml = `<a href="${escapeHtml(doc.duong_dan_file)}" target="_blank" rel="noopener" class="btn btn-primary flex-grow-1" id="btn-download-doc">
                    <i class="fa-solid fa-download me-2"></i>Tải tài liệu</a>`;
            } else if (!isLoggedIn()) {
                actionHtml = `<a href="${window.SH_HTML}login.html" class="btn btn-accent flex-grow-1"><i class="fa-solid fa-user me-2"></i>Đăng nhập để mua (${price} Xu)</a>`;
            } else {
                actionHtml = `<button type="button" class="btn btn-accent flex-grow-1" id="btn-buy-doc">
                    <i class="fa-solid fa-coins me-2"></i>Mua ngay ${price} Xu</button>
                    <p class="small text-muted mt-2 mb-0">Số dư: <strong>${user.so_xu || 0} Xu</strong></p>`;
            }

            body.innerHTML = `
                <div class="row g-4">
                    <div class="col-md-5">
                        <img src="${escapeHtml(getDocCoverUrl(doc, 600, 400))}" class="img-fluid rounded-3 w-100" alt=""
                             onerror="this.onerror=null;this.src='${escapeHtml(getDocFallbackCoverUrl(doc, 600, 400))}'">
                        ${!free ? '<div class="mt-2"><span class="badge bg-warning text-dark"><i class="fa-solid fa-crown"></i> Tài liệu trả phí</span></div>' : ""}
                    </div>
                    <div class="col-md-7">
                        <h4 class="fw-bold">${escapeHtml(doc.tieu_de)}</h4>
                        <div class="d-flex flex-wrap gap-2 my-2">
                            <span class="badge bg-primary">${escapeHtml(doc.loai_tai_lieu || "")}</span>
                            <span class="badge bg-secondary">${escapeHtml(subName)}</span>
                            ${doc.nam_hoc ? '<span class="badge bg-info text-dark">' + escapeHtml(doc.nam_hoc) + "</span>" : ""}
                        </div>
                        <p class="text-muted">${escapeHtml(doc.mo_ta || "Chưa có mô tả.")}</p>
                        <ul class="list-unstyled small">
                            <li class="mb-1"><strong>Người đăng:</strong> ${escapeHtml(doc.nguoi_dang)}</li>
                            <li class="mb-1"><strong>Giá:</strong> ${free ? "Miễn phí" : price + " Xu"}</li>
                            <li class="mb-1"><strong>Lượt xem:</strong> ${doc.so_luot_xem || 0}</li>
                            <li>${renderStars(doc.diem_danh_gia)}</li>
                        </ul>
                        <div class="mt-2 mb-2">
                            <div class="small fw-semibold mb-1">Đánh giá của bạn</div>
                            <div id="doc-rating-actions">
                                ${isLoggedIn() ? [1, 2, 3, 4, 5].map(function (s) {
                const active = userRating >= s ? "text-warning" : "text-secondary";
                return '<button type="button" class="btn btn-sm px-1 py-0 border-0 bg-transparent rate-star" data-score="' + s + '"><i class="fa-solid fa-star ' + active + '"></i></button>';
            }).join("") : '<span class="text-muted small">Đăng nhập để đánh giá</span>'}
                            </div>
                        </div>
                        <div class="d-flex gap-2 mt-3 flex-wrap">${actionHtml}
                            <button type="button" class="btn btn-outline-danger" id="btn-report-doc">
                                <i class="fa-solid fa-triangle-exclamation me-1"></i>Báo cáo lỗi
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-fav ${isFavorite(doc.id) ? "active" : ""}"
                                    onclick="handleToggleFavorite('${doc.id}', this)">
                                <i class="fa-${isFavorite(doc.id) ? "solid" : "regular"} fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>`;

            incrementViewSmart(id);

            const buyBtn = document.getElementById("btn-buy-doc");
            if (buyBtn) {
                buyBtn.addEventListener("click", function () {
                    buyBtn.disabled = true;
                    purchaseDocument(doc)
                        .then(function () {
                            openDocDetail(id);
                        })
                        .finally(function () {
                            buyBtn.disabled = false;
                        });
                });
            }

            const dlBtn = document.getElementById("btn-download-doc");
            if (dlBtn) {
                dlBtn.addEventListener("click", function () {
                    incrementDownloadSmart(id);
                    if (typeof publishUserActivity === "function") {
                        publishUserActivity("da tai tai lieu", doc.tieu_de || "");
                    }
                });
            }
            const reportBtn = document.getElementById("btn-report-doc");
            if (reportBtn) {
                reportBtn.addEventListener("click", function () {
                    submitDocumentReport(doc);
                });
            }
            document.querySelectorAll("#doc-rating-actions .rate-star").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const score = Number(btn.getAttribute("data-score")) || 0;
                    setUserDocRating(doc.id, score, doc.tieu_de || "");
                    showToast("Đã lưu đánh giá " + score + " sao", "success");
                    // Update star UI immediately without reloading modal
                    document.querySelectorAll("#doc-rating-actions .rate-star").forEach(function (starBtn) {
                        var starScore = Number(starBtn.getAttribute("data-score")) || 0;
                        var icon = starBtn.querySelector("i");
                        if (icon) {
                            if (starScore <= score) {
                                icon.classList.remove("text-secondary");
                                icon.classList.add("text-warning");
                            } else {
                                icon.classList.remove("text-warning");
                                icon.classList.add("text-secondary");
                            }
                        }
                    });
                });
            });
        })
        .catch(function () {
            body.innerHTML = `<div class="alert alert-danger mb-0">Không tải được chi tiết.</div>`;
        });
}

function getDocumentByIdSmart(id) {
    return api.getDocumentById(id).then(function (doc) {
        return normalizeDocument(doc);
    }).catch(function () {
        const local = (typeof getLocalDocuments === "function" ? getLocalDocuments() : []).find(function (d) {
            return String(d.id) === String(id);
        });
        if (local) return normalizeDocument(local);
        return Promise.reject(new Error("not_found"));
    });
}

function incrementViewSmart(id) {
    return api.incrementView(id).catch(function () {
        const list = typeof getLocalDocuments === "function" ? getLocalDocuments() : [];
        const idx = list.findIndex(function (d) { return String(d.id) === String(id); });
        if (idx >= 0) {
            list[idx].so_luot_xem = (Number(list[idx].so_luot_xem) || 0) + 1;
            saveLocalDocuments(list);
        }
    });
}

function incrementDownloadSmart(id) {
    return api.incrementDownload(id).catch(function () {
        const list = typeof getLocalDocuments === "function" ? getLocalDocuments() : [];
        const idx = list.findIndex(function (d) { return String(d.id) === String(id); });
        if (idx >= 0) {
            list[idx].so_luot_tai = (Number(list[idx].so_luot_tai) || 0) + 1;
            saveLocalDocuments(list);
        }
    });
}

function submitDocumentReport(doc) {
    const reason = prompt("Mô tả lỗi tài liệu để gửi admin:");
    if (!reason || !reason.trim()) return;
    const reports = JSON.parse(localStorage.getItem("scholarhub_reports") || "[]");
    reports.push({
        id: "rp-" + Date.now(),
        doc_id: doc.id,
        tieu_de: doc.tieu_de,
        anh_bia: doc.anh_bia || "",
        noi_dung: reason.trim(),
        ngay_tao: new Date().toISOString()
    });
    localStorage.setItem("scholarhub_reports", JSON.stringify(reports));
    if (typeof publishUserActivity === "function") {
        publishUserActivity("da bao cao loi tai lieu", doc.tieu_de || "");
    }
    showToast("Đã gửi báo cáo tài liệu tới admin", "success");
}

function getRatingsStore() {
    try {
        const raw = localStorage.getItem("scholarhub_doc_ratings");
        const obj = JSON.parse(raw || "{}");
        return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
        return {};
    }
}

function saveRatingsStore(store) {
    localStorage.setItem("scholarhub_doc_ratings", JSON.stringify(store || {}));
}

function getUserDocRating(docId) {
    const user = getCurrentUser();
    if (!user || !user.id) return 0;
    const store = getRatingsStore();
    const userRatings = store[String(user.id)] || {};
    return Number(userRatings[String(docId)]) || 0;
}

function setUserDocRating(docId, value, title) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const store = getRatingsStore();
    const uid = String(user.id);
    if (!store[uid]) store[uid] = {};
    store[uid][String(docId)] = Number(value) || 0;
    saveRatingsStore(store);
    if (typeof publishUserActivity === "function") {
        publishUserActivity("da danh gia " + (Number(value) || 0) + " sao", title || "");
    }
}

function getDocCoverUrl(doc, w, h) {
    const raw = String((doc && doc.anh_bia) || "").trim();
    if (raw) return raw;
    return getDocFallbackCoverUrl(doc, w, h);
}

function getDocFallbackCoverUrl(doc, w, h) {
    const width = Number(w) || 400;
    const height = Number(h) || 240;
    const seedBase = String((doc && doc.id) || (doc && doc.tieu_de) || "doc-cover")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
    const seed = seedBase || "doc-cover";
    return "https://picsum.photos/seed/" + encodeURIComponent(seed) + "/" + width + "/" + height;
}

window.buildDocCardHtml = buildDocCardHtml;
window.openDocDetail = openDocDetail;
window.handleToggleFavorite = handleToggleFavorite;
window.handleDocAction = handleDocAction;
