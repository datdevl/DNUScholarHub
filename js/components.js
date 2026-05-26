/**
 * ScholarHub - Card & modal (BKTin style + xu)
 */

function buildDocCardHtml(doc, subjectName) {
    const fav = isFavorite(doc.id);
    const views = formatNumber(doc.so_luot_xem);
    const sub = subjectName || "";
    const img = doc.anh_bia || "https://picsum.photos/seed/" + doc.id + "/400/240";
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
                     onerror="this.src='https://picsum.photos/400/240'">
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

    Promise.all([api.getDocumentById(id), getAllSubjectsData()])
        .then(function (results) {
            const doc = results[0];
            const subjects = results[1];
            const subName = getSubjectName(subjects, doc.id_mon_hoc);
            const price = getDocPrice(doc);
            const free = price === 0;
            const owned = canAccessDoc(doc);
            const user = getCurrentUser();

            let actionHtml = "";
            if (free || owned) {
                actionHtml = `<a href="${escapeHtml(doc.duong_dan_file)}" target="_blank" rel="noopener" class="btn btn-primary flex-grow-1" id="btn-download-doc">
                    <i class="fa-solid fa-download me-2"></i>Tải tài liệu</a>`;
            } else if (!isLoggedIn()) {
                actionHtml = `<a href="login.html" class="btn btn-accent flex-grow-1"><i class="fa-solid fa-user me-2"></i>Đăng nhập để mua (${price} Xu)</a>`;
            } else {
                actionHtml = `<button type="button" class="btn btn-accent flex-grow-1" id="btn-buy-doc">
                    <i class="fa-solid fa-coins me-2"></i>Mua ngay ${price} Xu</button>
                    <p class="small text-muted mt-2 mb-0">Số dư: <strong>${user.so_xu || 0} Xu</strong></p>`;
            }

            body.innerHTML = `
                <div class="row g-4">
                    <div class="col-md-5">
                        <img src="${escapeHtml(doc.anh_bia || "https://picsum.photos/600/400")}" class="img-fluid rounded-3 w-100" alt="">
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
                        <div class="d-flex gap-2 mt-3 flex-wrap">${actionHtml}
                            <button type="button" class="btn btn-outline-secondary btn-fav ${isFavorite(doc.id) ? "active" : ""}"
                                    onclick="handleToggleFavorite('${doc.id}', this)">
                                <i class="fa-${isFavorite(doc.id) ? "solid" : "regular"} fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>`;

            api.incrementView(id).catch(function () {});

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
                    api.incrementDownload(id).catch(function () {});
                });
            }
        })
        .catch(function () {
            body.innerHTML = `<div class="alert alert-danger mb-0">Không tải được chi tiết.</div>`;
        });
}

window.buildDocCardHtml = buildDocCardHtml;
window.openDocDetail = openDocDetail;
window.handleToggleFavorite = handleToggleFavorite;
window.handleDocAction = handleDocAction;
