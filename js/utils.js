/**
 * ScholarHub - Tiện ích: Toast, Favorites, Validation, Format
 */

/** Hiển thị Bootstrap Toast */
function showToast(message, type) {
    const toastType = type || "success";
    let bgClass = "text-bg-primary";
    if (toastType === "success") bgClass = "text-bg-success";
    else if (toastType === "error") bgClass = "text-bg-danger";
    else if (toastType === "info") bgClass = "text-bg-info";
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container position-fixed bottom-0 end-0 p-3";
        document.body.appendChild(container);
    }
    const id = "toast-" + Date.now();
    container.insertAdjacentHTML("beforeend", `
        <div id="${id}" class="toast align-items-center ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`);
    const el = document.getElementById(id);
    const bsToast = new bootstrap.Toast(el, { delay: 3500 });
    bsToast.show();
    el.addEventListener("hidden.bs.toast", function () {
        el.remove();
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}

function formatNumber(num) {
    const n = Number(num) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN");
}

function renderStars(rating) {
    const r = Math.min(5, Math.max(0, Number(rating) || 0));
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fa-solid fa-star ${i <= Math.round(r) ? "text-warning" : "text-secondary opacity-25"}"></i>`;
    }
    return html;
}

/* ---------- FAVORITES (localStorage) ---------- */
function getFavorites() {
    try {
        const raw = localStorage.getItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.favorites);
        const arr = JSON.parse(raw || "[]");
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function isFavorite(docId) {
    return getFavorites().includes(String(docId));
}

function toggleFavorite(docId) {
    const id = String(docId);
    let favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) {
        favs.splice(idx, 1);
        showToast("Đã bỏ khỏi yêu thích", "info");
    } else {
        favs.push(id);
        showToast("Đã thêm vào yêu thích", "success");
    }
    localStorage.setItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.favorites, JSON.stringify(favs));
    return favs.includes(id);
}

/* ---------- LOADING UI ---------- */
function showLoading(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const n = count || 8;
    let html = "";
    for (let i = 0; i < n; i++) {
        html += `<div class="col-sm-6 col-lg-4 col-xl-3"><div class="skeleton skeleton-card"></div></div>`;
    }
    container.innerHTML = html;
    container.classList.remove("d-none");
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.classList.add("d-none");
}

/* ---------- FORM VALIDATION ---------- */
function clearFieldErrors(formEl) {
    const errors = formEl.querySelectorAll(".field-error");
    for (let i = 0; i < errors.length; i++) {
        errors[i].classList.remove("show");
        errors[i].textContent = "";
    }
    const inputs = formEl.querySelectorAll(".is-invalid-custom");
    for (let j = 0; j < inputs.length; j++) {
        inputs[j].classList.remove("is-invalid-custom");
    }
}

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(inputId + "-error");
    if (input) input.classList.add("is-invalid-custom");
    if (errEl) {
        errEl.textContent = message;
        errEl.classList.add("show");
    }
}

function isValidUrl(str) {
    if (!str || typeof str !== "string") return false;
    try {
        const u = new URL(str.trim());
        return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
        return false;
    }
}

/**
 * Validate form tài liệu
 * @param {HTMLFormElement} formEl
 * @returns {boolean}
 */
function validateDocumentForm(formEl) {
    clearFieldErrors(formEl);
    let valid = true;

    const tieuDe = formEl.querySelector("#tieu_de");
    const nguoiDang = formEl.querySelector("#nguoi_dang");
    const duongDan = formEl.querySelector("#duong_dan_file");
    const anhBia = formEl.querySelector("#anh_bia");
    const diem = formEl.querySelector("#diem_danh_gia");
    const idMon = formEl.querySelector("#id_mon_hoc");

    if (!tieuDe || !tieuDe.value.trim()) {
        showFieldError("tieu_de", "Tiêu đề không được để trống");
        valid = false;
    }
    if (!nguoiDang || !nguoiDang.value.trim()) {
        showFieldError("nguoi_dang", "Tên người đăng không được để trống");
        valid = false;
    }
    if (!idMon || !idMon.value) {
        showFieldError("id_mon_hoc", "Vui lòng chọn môn học");
        valid = false;
    }
    const fileInput = formEl.querySelector("#file_upload");
    const hasLocalFile = fileInput && fileInput.files && fileInput.files.length > 0;
    if (!hasLocalFile) {
        if (!duongDan || !isValidUrl(duongDan.value)) {
            showFieldError("duong_dan_file", "Nhập link tải hợp lệ hoặc chọn file từ máy");
            valid = false;
        }
    }
    if (anhBia && anhBia.value.trim() && !isValidUrl(anhBia.value)) {
        showFieldError("anh_bia", "URL ảnh bìa không hợp lệ");
        valid = false;
    }
    if (diem) {
        const v = Number(diem.value);
        if (diem.value !== "" && (isNaN(v) || v < 1 || v > 5)) {
            showFieldError("diem_danh_gia", "Điểm đánh giá từ 1 đến 5");
            valid = false;
        }
    }

    return valid;
}

function validateSubjectForm(formEl) {
    clearFieldErrors(formEl);
    let valid = true;

    const ten = formEl.querySelector("#ten_mon_hoc");
    const ma = formEl.querySelector("#ma_mon_hoc");
    const tinChi = formEl.querySelector("#so_tin_chi");

    if (!ten || !ten.value.trim()) {
        showFieldError("ten_mon_hoc", "Tên môn học không được để trống");
        valid = false;
    }
    if (!ma || !ma.value.trim()) {
        showFieldError("ma_mon_hoc", "Mã môn học không được để trống");
        valid = false;
    }
    if (tinChi) {
        const tc = Number(tinChi.value);
        if (!tinChi.value || isNaN(tc) || tc <= 0) {
            showFieldError("so_tin_chi", "Số tín chỉ phải lớn hơn 0");
            valid = false;
        }
    }

    return valid;
}

function getApprovedDocuments(docs) {
    return docs.filter(function (d) {
        const status = String(d.trang_thai || SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED).toLowerCase();
        return status === String(SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED).toLowerCase();
    });
}

function getSubjectName(subjects, idMon) {
    const list = subjects || (typeof getLocalSubjects === "function" ? getLocalSubjects() : []);
    if (typeof getSubjectNameFromCache === "function") {
        return getSubjectNameFromCache(list, idMon);
    }
    const found = list.find(function (s) {
        return String(s.id) === String(idMon);
    });
    return found ? found.ten_mon_hoc : "Môn học";
}

window.showToast = showToast;
window.getFavorites = getFavorites;
window.toggleFavorite = toggleFavorite;
window.isFavorite = isFavorite;
