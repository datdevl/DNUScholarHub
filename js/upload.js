/**
 * ScholarHub - Đăng tải tài liệu (sinh viên)
 */
function loadSubjectOptions() {
    const sel = document.getElementById("id_mon_hoc");
    if (!sel) return;

    getAllSubjectsData()
        .then(function (subs) {
            let html = '<option value="">-- Chọn môn học --</option>';
            for (let i = 0; i < subs.length; i++) {
                html += `<option value="${subs[i].id}">${escapeHtml(subs[i].ten_mon_hoc)} (${escapeHtml(subs[i].ma_mon_hoc)})</option>`;
            }
            sel.innerHTML = html;
        })
        .catch(function () {
            showToast("Không tải được danh sách môn học", "error");
        });
}

function handleUploadSubmit(e) {
    e.preventDefault();
    const form = document.getElementById("upload-form");
    if (!form) return;

    if (!validateDocumentForm(form)) {
        showToast("Vui lòng sửa các lỗi trong form", "error");
        return;
    }

    const selectedFile = form.file_upload && form.file_upload.files ? form.file_upload.files[0] : null;
    const defaultLink = form.duong_dan_file.value.trim();
    const payload = {
        tieu_de: form.tieu_de.value.trim(),
        id_mon_hoc: Number(form.id_mon_hoc.value),
        loai_tai_lieu: form.loai_tai_lieu.value,
        nguoi_dang: form.nguoi_dang.value.trim(),
        duong_dan_file: defaultLink,
        anh_bia: form.anh_bia.value.trim() || "https://picsum.photos/400/240",
        mo_ta: (form.mo_ta && form.mo_ta.value.trim()) || "",
        tu_khoa: (form.tu_khoa && form.tu_khoa.value.trim()) || "",
        nam_hoc: (form.nam_hoc && form.nam_hoc.value) || new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        so_luot_xem: 0,
        so_luot_tai: 0,
        diem_danh_gia: Number(form.diem_danh_gia.value) || 4,
        ngay_tao: new Date().toISOString().split("T")[0],
        trang_thai: SCHOLARHUB_CONFIG.DOC_STATUS.PENDING
    };

    const btn = document.getElementById("btn-submit-upload");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';
    }

    resolveUploadLink(payload, selectedFile)
        .then(function (readyPayload) {
            const localPayload = { ...readyPayload, id: "local-doc-" + Date.now() };
            upsertLocalDocument(localPayload);
            return api.createDocument(readyPayload).catch(function () {
                return localPayload;
            });
        })
        .then(function () {
            showToast("Đã gửi tài liệu! Chờ admin duyệt (Pending).", "success");
            form.reset();
            const fileNameEl = document.getElementById("file-upload-name");
            if (fileNameEl) fileNameEl.textContent = "";
            clearFieldErrors(form);
            rewardUploadXu();
        })
        .catch(function () {
            showToast("Gửi thất bại. Kiểm tra MockAPI.", "error");
        })
        .finally(function () {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-2"></i>Gửi tài liệu';
            }
        });
}

function resolveUploadLink(payload, file) {
    if (!file) return Promise.resolve(payload);
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            resolve({
                ...payload,
                duong_dan_file: String(ev.target.result || ""),
                ten_file_goc: file.name
            });
        };
        reader.onerror = function () {
            reject(new Error("read_file_failed"));
        };
        reader.readAsDataURL(file);
    });
}

function rewardUploadXu() {
    const user = getCurrentUser();
    if (!user || !user.id || String(user.id).indexOf("admin") >= 0 || String(user.id).indexOf("local") === 0) return;
    const add = SCHOLARHUB_CONFIG.UPLOAD_REWARD_XU;
    const newXu = (Number(user.so_xu) || 0) + add;
    updateUserData(user.id, {
        ho_ten: user.ho_ten,
        email: user.email,
        mat_khau: user.mat_khau || "",
        anh_dai_dien: user.anh_dai_dien,
        so_xu: newXu,
        diem_tich_luy: (Number(user.diem_tich_luy) || 0) + 5,
        truong_hoc: user.truong_hoc || "",
        so_dien_thoai: user.so_dien_thoai || "",
        ten_dang_nhap: user.ten_dang_nhap || user.email
    }).then(function () {
        user.so_xu = newXu;
        setCurrentUser(user);
        showToast("+" + add + " xu thưởng đóng góp!", "info");
    }).catch(function () {});
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof initLayout === "function") initLayout("upload");
    loadSubjectOptions();
    const user = getCurrentUser();
    const nguoiDang = document.getElementById("nguoi_dang");
    if (nguoiDang && user && user.ho_ten) nguoiDang.value = user.ho_ten;
    const form = document.getElementById("upload-form");
    if (form) form.addEventListener("submit", handleUploadSubmit);
    const fileInput = document.getElementById("file_upload");
    const fileNameEl = document.getElementById("file-upload-name");
    if (fileInput && fileNameEl) {
        fileInput.addEventListener("change", function () {
            const f = fileInput.files && fileInput.files[0];
            fileNameEl.textContent = f ? "Đã chọn: " + f.name : "";
        });
    }
});
