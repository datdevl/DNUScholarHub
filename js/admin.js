/**
 * ScholarHub Admin - CRUD, duyệt Pending/Approved, thống kê
 */
let adminTab = "stats";
let adminEditId = null;
let adminSubjectsList = [];
let adminSelectedChatUser = null;

function switchAdminTab(tab) {
    adminTab = tab;
    const panels = {
        documents: document.getElementById("panel-documents"),
        subjects: document.getElementById("panel-subjects"),
        users: document.getElementById("panel-users"),
        chats: document.getElementById("panel-chats"),
        stats: document.getElementById("panel-stats"),
        pending: document.getElementById("panel-pending"),
        reports: document.getElementById("panel-reports"),
        attendance: document.getElementById("panel-attendance")
    };
    const keys = Object.keys(panels);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (panels[k]) panels[k].classList.toggle("d-none", k !== tab);
    }
    document.querySelectorAll("[data-admin-tab]").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-admin-tab") === tab);
    });
    loadAdminPanel();
}

function loadAdminPanel() {
    if (adminTab === "documents") loadAdminDocuments("all", "admin-docs-body");
    else if (adminTab === "pending") loadAdminDocuments("pending", "admin-pending-body");
    else if (adminTab === "subjects") loadAdminSubjects();
    else if (adminTab === "users") loadAdminUsers();
    else if (adminTab === "chats") loadAdminChats();
    else if (adminTab === "reports") loadAdminReports();
    else if (adminTab === "stats") loadAdminStats();
    else if (adminTab === "attendance" && typeof startAttendanceAdmin === "function") startAttendanceAdmin();
}

function loadAdminStats() {
    Promise.all([getAllDocumentsData(), getAllSubjectsData()])
        .then(function (res) {
            const docs = res[0];
            const subs = res[1];
            let approved = 0;
            let pending = 0;
            let views = 0;
            let downloads = 0;
            for (let i = 0; i < docs.length; i++) {
                const st = docs[i].trang_thai || "Approved";
                if (st === "Pending") pending++;
                else approved++;
                views += Number(docs[i].so_luot_xem) || 0;
                downloads += Number(docs[i].so_luot_tai) || 0;
            }
            setText("stat-total-docs", docs.length);
            setText("stat-approved", approved);
            setText("stat-pending", pending);
            setText("stat-subjects", subs.length);
            setText("stat-views", formatNumber(views));
            setText("stat-downloads", formatNumber(downloads));
            renderTopViews(docs);
            fillExamSettingsForm();
        })
        .catch(function () {
            showToast("Không tải được thống kê", "error");
        });
}

function fillExamSettingsForm() {
    try {
        const cfg = JSON.parse(localStorage.getItem("scholarhub_exam_settings") || "{}");
        const titleEl = document.getElementById("exam-title-admin");
        const dateEl = document.getElementById("exam-date-admin");
        if (titleEl) titleEl.value = cfg.title || "Đếm ngược kỳ thi";
        if (dateEl) {
            const dt = cfg.targetDate || SCHOLARHUB_CONFIG.EXAM_COUNTDOWN;
            dateEl.value = toLocalDatetimeValue(dt);
        }
    } catch (e) {}
}

function toLocalDatetimeValue(input) {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";
    const pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function saveExamSettings() {
    const title = (document.getElementById("exam-title-admin") || {}).value || "Đếm ngược kỳ thi";
    const date = (document.getElementById("exam-date-admin") || {}).value;
    if (!date) {
        showToast("Vui lòng chọn thời gian đếm ngược", "error");
        return;
    }
    localStorage.setItem("scholarhub_exam_settings", JSON.stringify({
        title: title.trim(),
        targetDate: new Date(date).toISOString()
    }));
    showToast("Đã lưu cấu hình đếm ngược", "success");
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function renderTopViews(docs) {
    const tbody = document.getElementById("top-views-body");
    if (!tbody) return;
    const sorted = docs.slice().sort(function (a, b) {
        return (Number(b.so_luot_xem) || 0) - (Number(a.so_luot_xem) || 0);
    });
    const top = sorted.slice(0, 5);
    let html = "";
    for (let i = 0; i < top.length; i++) {
        html += `<tr><td>${i + 1}</td><td>${escapeHtml(top[i].tieu_de)}</td><td>${top[i].so_luot_xem || 0}</td><td>${top[i].so_luot_tai || 0}</td></tr>`;
    }
    tbody.innerHTML = html || "<tr><td colspan='4' class='text-muted'>Chưa có dữ liệu</td></tr>";
}

function loadAdminDocuments(mode, tbodyId) {
    const tbody = document.getElementById(tbodyId || "admin-docs-body");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></td></tr>`;

    getAllDocumentsData()
        .then(function (docs) {
            let list = docs;
            if (mode === "pending") {
                list = docs.filter(function (d) {
                    return String(d.trang_thai || "").toLowerCase() === "pending";
                });
            }
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Không có bản ghi</td></tr>`;
                return;
            }
            let html = "";
            for (let i = 0; i < list.length; i++) {
                const d = list[i];
                const st = d.trang_thai || "Approved";
                const badge = st === "Pending" ? "warning" : "success";
                html += `
                <tr>
                    <td>${d.id}</td>
                    <td class="text-truncate" style="max-width:200px">${escapeHtml(d.tieu_de)}</td>
                    <td><span class="badge bg-secondary">${escapeHtml(d.loai_tai_lieu || "")}</span></td>
                    <td>${escapeHtml(d.nguoi_dang || "")}</td>
                    <td>${d.so_luot_xem || 0}</td>
                    <td><span class="badge bg-${badge}">${st}</span></td>
                    <td>${escapeHtml(d.nam_hoc || "—")}</td>
                    <td class="text-nowrap">
                        ${st === "Pending" ? `<button class="btn btn-sm btn-success me-1" onclick="approveDoc('${d.id}')" title="Duyệt"><i class="fa-solid fa-check"></i></button>` : ""}
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editAdminDoc('${d.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAdminDoc('${d.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            }
            tbody.innerHTML = html;
        })
        .catch(function () {
            tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Lỗi tải dữ liệu</td></tr>`;
        });
}

function loadAdminUsers() {
    const tbody = document.getElementById("admin-users-body");
    if (!tbody) return;
    ensureDemoLocalUsers();
    const local = getLocalUsers();
    api.getAllUsers().catch(function () { return []; }).then(function (apiList) {
            const users = local.slice();
            (apiList || []).forEach(function (u) {
                if (!u.email || /^email\s*\d+$/i.test(u.email)) return;
                const ex = users.some(function (x) {
                    return (x.email || "").toLowerCase() === (u.email || "").toLowerCase();
                });
                if (!ex) users.push(normalizeApiUser(u));
            });
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có user. Đăng ký tại trang Register.</td></tr>';
                return;
            }
            let html = "";
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                const av = u.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0];
                const lastAccess = u.last_access ? new Date(u.last_access).toLocaleString('vi-VN') : "Chưa có";
                html += `<tr>
                    <td><img src="${av}" width="36" height="36" class="rounded-circle" alt=""></td>
                    <td>${escapeHtml(u.ho_ten || "")}</td>
                    <td>${escapeHtml(u.email || "")}</td>
                    <td><input type="number" class="form-control form-control-sm" style="width:80px" id="xu-${u.id}" value="${u.so_xu || 0}"></td>
                    <td>${u.diem_tich_luy || 0}</td>
                    <td>${escapeHtml(lastAccess)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="saveUserXu('${u.id}')" title="Lưu Xu"><i class="fa-solid fa-save"></i></button>
                        <button class="btn btn-sm btn-warning me-1" onclick="changeUserPassword('${u.id}')" title="Đổi MK"><i class="fa-solid fa-key"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUserAccount('${u.id}')" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            }
            tbody.innerHTML = html;
        })
        .catch(function () {
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Lỗi tải nguoi_dung</td></tr>';
        });
}

function saveUserXu(id) {
    const inp = document.getElementById("xu-" + id);
    const xu = Number(inp.value) || 0;
    const locals = getLocalUsers();
    const local = locals.find(function (u) { return String(u.id) === String(id); });
    const payload = local
        ? { ...local, so_xu: xu }
        : { so_xu: xu };
    updateUserData(id, payload).then(function () {
        showToast("Đã cập nhật xu user #" + id, "success");
    }).catch(function () {
        showToast("Cập nhật thất bại", "error");
    });
}

function changeUserPassword(id) {
    const newPass = prompt("Nhập mật khẩu mới cho người dùng:");
    if (!newPass) return;

    
    const locals = getLocalUsers();
    const localUser = locals.find(function(u) { return String(u.id) === String(id); });
    const payload = localUser ? { ...localUser, mat_khau: newPass } : { mat_khau: newPass };
    
    updateUserData(id, payload).then(function () {
        showToast("Đổi mật khẩu thành công", "success");
        loadAdminUsers();
    }).catch(function () {
        showToast("Đổi mật khẩu thất bại", "error");
    });
}

function deleteUserAccount(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    api.deleteUser(id)
        .then(function () {
            deleteLocalUserById(id);
            showToast("Đã xóa người dùng", "success");
            loadAdminUsers();
        })
        .catch(function () {
            deleteLocalUserById(id);
            showToast("Đã xóa người dùng local", "success");
            loadAdminUsers();
        });
}

window.saveUserXu = saveUserXu;
window.changeUserPassword = changeUserPassword;
window.deleteUserAccount = deleteUserAccount;

function loadAdminSubjects() {
    const tbody = document.getElementById("admin-subjects-body");
    if (!tbody) return;

    getAllSubjectsData()
        .then(function (subs) {
            adminSubjectsList = subs;
            if (subs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Chưa có môn học</td></tr>`;
                return;
            }
            let html = "";
            for (let i = 0; i < subs.length; i++) {
                const s = subs[i];
                html += `
                <tr>
                    <td>${escapeHtml(s.ma_mon_hoc)}</td>
                    <td>${escapeHtml(s.ten_mon_hoc)}</td>
                    <td>${escapeHtml(s.khoa_vien || "")}</td>
                    <td>${s.so_tin_chi || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editAdminSubject('${s.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAdminSubject('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            }
            tbody.innerHTML = html;
        })
        .catch(function () {
            showToast("Lỗi tải môn học", "error");
        });
}

function approveDoc(id) {
    api.getDocumentById(id)
        .then(function (doc) {
            return api.updateDocument(id, { ...doc, trang_thai: SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED });
        })
        .then(function () {
            showToast("Đã duyệt tài liệu!", "success");
            loadAdminPanel();
        })
        .catch(function () {
            showToast("Duyệt thất bại", "error");
        });
}

function deleteAdminDoc(id) {
    if (!confirm("Xóa tài liệu này?")) return;
    api.deleteDocument(id)
        .then(function () {
            showToast("Đã xóa tài liệu", "success");
            loadAdminPanel();
        })
        .catch(function () {
            deleteLocalDocumentById(id);
            showToast("Đã xóa tài liệu local", "success");
            loadAdminPanel();
        });
}

function deleteAdminSubject(id) {
    if (!confirm("Xóa môn học này?")) return;
    deleteLocalSubject(id)
        .then(function () {
            showToast("Đã xóa môn học", "success");
            loadAdminPanel();
        })
        .catch(function () {
            showToast("Xóa thất bại", "error");
        });
}

function showAdminModal(type, data) {
    adminEditId = data && data.id ? data.id : null;
    const title = document.getElementById("admin-modal-title");
    const body = document.getElementById("admin-modal-body");
    if (type === "document") {
        if (title) title.textContent = adminEditId ? "Sửa tài liệu" : "Thêm tài liệu";
        body.innerHTML = buildDocumentFormHtml(data);
        fillSubjectSelectInForm();
        setTimeout(window.setupAdminFileUploadListener, 100);
    } else {
        if (title) title.textContent = adminEditId ? "Sửa môn học" : "Thêm môn học";
        body.innerHTML = buildSubjectFormHtml(data);
    }
    new bootstrap.Modal(document.getElementById("adminFormModal")).show();
}

function fillSubjectSelectInForm() {
    getAllSubjectsData().then(function (subs) {
        const sel = document.getElementById("id_mon_hoc");
        if (!sel) return;
        let opts = '<option value="">-- Chọn --</option>';
        for (let i = 0; i < subs.length; i++) {
            opts += `<option value="${subs[i].id}">${escapeHtml(subs[i].ten_mon_hoc)}</option>`;
        }
        sel.innerHTML = opts;
        if (adminEditId) {
            const hidden = document.querySelector("#admin-modal-body [data-prev-mon]");
            if (hidden) sel.value = hidden.getAttribute("data-prev-mon");
        }
    });
}

window.setupAdminFileUploadListener = function() {
    const fileInput = document.getElementById("file_upload");
    const fileNameEl = document.getElementById("file-upload-name");
    if (fileInput && fileNameEl) {
        fileInput.addEventListener("change", function () {
            const f = fileInput.files && fileInput.files[0];
            if (f) {
                fileNameEl.textContent = "Đã chọn: " + f.name;
            }
        });
    }
};

function buildDocumentFormHtml(data) {
    const d = data || {};
    const types = SCHOLARHUB_CONFIG.DOC_TYPES;
    let typeOpts = "";
    for (let i = 0; i < types.length; i++) {
        const sel = d.loai_tai_lieu === types[i] ? "selected" : "";
        typeOpts += `<option value="${types[i]}" ${sel}>${types[i]}</option>`;
    }
    return `
    <form id="admin-doc-form" data-prev-mon="${d.id_mon_hoc || ""}">
        <div class="row g-3">
            <div class="col-12">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" class="form-control" id="tieu_de" value="${escapeHtml(d.tieu_de || "")}">
                <div class="field-error" id="tieu_de-error"></div>
            </div>
            <div class="col-md-6">
                <label class="form-label">Môn học *</label>
                <select class="form-select" id="id_mon_hoc"></select>
                <div class="field-error" id="id_mon_hoc-error"></div>
            </div>
            <div class="col-md-6">
                <label class="form-label">Loại tài liệu</label>
                <select class="form-select" id="loai_tai_lieu">${typeOpts}</select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Người đăng *</label>
                <input type="text" class="form-control" id="nguoi_dang" value="${escapeHtml(d.nguoi_dang || "")}">
                <div class="field-error" id="nguoi_dang-error"></div>
            </div>
            <div class="col-md-6">
                <label class="form-label">Năm học</label>
                <input type="text" class="form-control" id="nam_hoc" value="${escapeHtml(d.nam_hoc || "2024-2025")}" placeholder="2024-2025">
            </div>
            <div class="col-12">
                <label class="form-label">Link tải (URL) *</label>
                <input type="url" class="form-control" id="duong_dan_file" value="${escapeHtml(d.duong_dan_file || "")}">
                <div class="field-error" id="duong_dan_file-error"></div>
            </div>
            <div class="col-12">
                <label class="form-label">Ảnh bìa (URL)</label>
                <input type="url" class="form-control" id="anh_bia" value="${escapeHtml(d.anh_bia || "")}">
                <div class="field-error" id="anh_bia-error"></div>
            </div>
            <div class="col-12">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="mo_ta" rows="2">${escapeHtml(d.mo_ta || "")}</textarea>
            </div>
            <div class="col-md-4">
                <label class="form-label">Điểm đánh giá (1-5)</label>
                <input type="number" class="form-control" id="diem_danh_gia" min="1" max="5" step="0.1" value="${d.diem_danh_gia || 4}">
                <div class="field-error" id="diem_danh_gia-error"></div>
            </div>
            <div class="col-md-4">
                <label class="form-label">Trạng thái</label>
                <select class="form-select" id="trang_thai">
                    <option value="Approved" ${(d.trang_thai || "Approved") === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Pending" ${d.trang_thai === "Pending" ? "selected" : ""}>Pending</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Từ khóa</label>
                <input type="text" class="form-control" id="tu_khoa" value="${escapeHtml(d.tu_khoa || "")}">
            </div>
            <div class="col-md-4">
                <label class="form-label">Giá xu (0 = miễn phí)</label>
                <input type="number" class="form-control" id="gia_xu" min="0" value="${d.gia_xu != null ? d.gia_xu : 0}">
            </div>
        </div>
    </form>`;
}

function buildSubjectFormHtml(data) {
    const s = data || {};
    return `
    <form id="admin-sub-form">
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Tên môn học *</label>
                <input type="text" class="form-control" id="ten_mon_hoc" value="${escapeHtml(s.ten_mon_hoc || "")}">
                <div class="field-error" id="ten_mon_hoc-error"></div>
            </div>
            <div class="col-md-6">
                <label class="form-label">Mã môn *</label>
                <input type="text" class="form-control" id="ma_mon_hoc" value="${escapeHtml(s.ma_mon_hoc || "")}">
                <div class="field-error" id="ma_mon_hoc-error"></div>
            </div>
            <div class="col-md-6">
                <label class="form-label">Khoa/Viện</label>
                <input type="text" class="form-control" id="khoa_vien" value="${escapeHtml(s.khoa_vien || "")}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Số tín chỉ *</label>
                <input type="number" class="form-control" id="so_tin_chi" min="1" value="${s.so_tin_chi || 3}">
                <div class="field-error" id="so_tin_chi-error"></div>
            </div>
            <div class="col-12">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="mo_ta" rows="2">${escapeHtml(s.mo_ta || "")}</textarea>
            </div>
        </div>
    </form>`;
}

function editAdminDoc(id) {
    api.getDocumentById(id).then(function (d) {
        showAdminModal("document", d);
        setTimeout(function () {
            const sel = document.getElementById("id_mon_hoc");
            if (sel) sel.value = d.id_mon_hoc;
        }, 300);
    });
}

function editAdminSubject(id) {
    getAllSubjectsData().then(function (subs) {
        const s = subs.find(function (x) { return String(x.id) === String(id); });
        showAdminModal("subject", s || {});
    });
}

function saveAdminForm() {
    const isDoc = document.getElementById("admin-doc-form");
    if (isDoc) {
        const form = document.getElementById("admin-doc-form");
        if (!validateDocumentForm(form)) return;
        const payload = {
            tieu_de: form.querySelector("#tieu_de").value.trim(),
            id_mon_hoc: Number(form.querySelector("#id_mon_hoc").value),
            loai_tai_lieu: form.querySelector("#loai_tai_lieu").value,
            nguoi_dang: form.querySelector("#nguoi_dang").value.trim(),
            duong_dan_file: form.querySelector("#duong_dan_file").value.trim(),
            anh_bia: form.querySelector("#anh_bia").value.trim() || "https://picsum.photos/400/240",
            mo_ta: form.querySelector("#mo_ta").value.trim(),
            nam_hoc: form.querySelector("#nam_hoc").value.trim(),
            diem_danh_gia: Number(form.querySelector("#diem_danh_gia").value) || 4,
            tu_khoa: form.querySelector("#tu_khoa").value.trim(),
            gia_xu: Number(form.querySelector("#gia_xu").value) || 0,
            trang_thai: form.querySelector("#trang_thai").value,
            ngay_tao: new Date().toISOString().split("T")[0],
            so_luot_xem: 0,
            so_luot_tai: 0
        };
        const req = adminEditId
            ? api.getDocumentById(adminEditId).then(function (old) {
                return api.updateDocument(adminEditId, {
                    ...old,
                    ...payload,
                    so_luot_xem: old.so_luot_xem,
                    so_luot_tai: old.so_luot_tai
                });
            })
            : api.createDocument(payload);
        req.then(function () {
            showToast("Lưu tài liệu thành công!", "success");
            bootstrap.Modal.getInstance(document.getElementById("adminFormModal")).hide();
            form.reset();
            loadAdminPanel();
        }).catch(function () {
            showToast("Lưu thất bại", "error");
        });
    } else {
        const form = document.getElementById("admin-sub-form");
        if (!form || !validateSubjectForm(form)) return;
        const payload = {
            ten_mon_hoc: form.querySelector("#ten_mon_hoc").value.trim(),
            ma_mon_hoc: form.querySelector("#ma_mon_hoc").value.trim(),
            khoa_vien: form.querySelector("#khoa_vien").value.trim(),
            so_tin_chi: Number(form.querySelector("#so_tin_chi").value),
            mo_ta: form.querySelector("#mo_ta").value.trim()
        };
        const req = adminEditId
            ? updateLocalSubject(adminEditId, payload)
            : createLocalSubject(payload);
        req.then(function () {
            showToast("Lưu môn học thành công!", "success");
            bootstrap.Modal.getInstance(document.getElementById("adminFormModal")).hide();
            form.reset();
            loadAdminPanel();
        }).catch(function () {
            showToast("Lưu thất bại", "error");
        });
    }
}

function loadAdminReports() {
    const tbody = document.getElementById("admin-reports-body");
    if (!tbody) return;
    let reports = [];
    try {
        reports = JSON.parse(localStorage.getItem("scholarhub_reports") || "[]");
    } catch (e) {}
    if (!reports.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có báo cáo</td></tr>';
        return;
    }
    reports.sort(function (a, b) { return new Date(b.ngay_tao) - new Date(a.ngay_tao); });
    tbody.innerHTML = reports.map(function (r) {
        const img = r.anh_bia || "https://picsum.photos/80/56";
        return "<tr><td>" + formatDate(r.ngay_tao) + "</td><td>" + escapeHtml(r.doc_id) + "</td><td><img src=\"" + escapeHtml(img) + "\" width=\"56\" height=\"40\" style=\"object-fit:cover;border-radius:6px\"></td><td>" + escapeHtml(r.tieu_de || "") + "</td><td>" + escapeHtml(r.noi_dung || "") + "</td><td><button class=\"btn btn-sm btn-outline-danger\" onclick=\"deleteReport('" + escapeHtml(r.id) + "')\"><i class=\"fa-solid fa-trash\"></i></button></td></tr>";
    }).join("");
}

function deleteReport(id) {
    let reports = [];
    try {
        reports = JSON.parse(localStorage.getItem("scholarhub_reports") || "[]");
    } catch (e) {}
    reports = reports.filter(function (r) { return String(r.id) !== String(id); });
    localStorage.setItem("scholarhub_reports", JSON.stringify(reports));
    loadAdminReports();
    showToast("Đã xóa báo cáo", "success");
}

function getAdminChatStore() {
    try {
        const raw = localStorage.getItem("scholarhub_chat_threads");
        const obj = JSON.parse(raw || "{}");
        return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
        return {};
    }
}

function saveAdminChatStore(store) {
    localStorage.setItem("scholarhub_chat_threads", JSON.stringify(store || {}));
}

function loadAdminChats() {
    const usersBox = document.getElementById("admin-chat-users");
    const threadBox = document.getElementById("admin-chat-thread");
    if (!usersBox || !threadBox) return;
    const store = getAdminChatStore();
    const userKeys = Object.keys(store).sort(function (a, b) {
        const aList = store[a] || [];
        const bList = store[b] || [];
        const aTime = aList.length ? new Date(aList[aList.length - 1].createdAt).getTime() : 0;
        const bTime = bList.length ? new Date(bList[bList.length - 1].createdAt).getTime() : 0;
        return bTime - aTime;
    });
    if (!userKeys.length) {
        usersBox.innerHTML = '<div class="list-group-item text-muted">Chưa có tin nhắn</div>';
        threadBox.innerHTML = '<p class="text-muted mb-0">Chưa có hội thoại.</p>';
        return;
    }
    usersBox.innerHTML = userKeys.map(function (key) {
        const msgs = store[key] || [];
        const last = msgs.length ? msgs[msgs.length - 1].text : "";
        return '<button type="button" class="list-group-item list-group-item-action ' + (adminSelectedChatUser === key ? "active" : "") + '" onclick="openAdminChatThread(\'' + key + '\')"><div class="fw-semibold">' + escapeHtml(key) + '</div><small class="text-muted">' + escapeHtml(last) + "</small></button>";
    }).join("");
    if (!adminSelectedChatUser || !store[adminSelectedChatUser]) {
        adminSelectedChatUser = userKeys[0];
    }
    openAdminChatThread(adminSelectedChatUser);
}

function deleteAdminChatThread(userKey) {
    if (!confirm("Bạn có chắc chắn muốn xóa hội thoại với " + userKey + "?")) return;
    const store = getAdminChatStore();
    delete store[userKey];
    saveAdminChatStore(store);
    if (adminSelectedChatUser === userKey) {
        adminSelectedChatUser = null;
        const titleEl = document.getElementById("admin-chat-title");
        const threadBox = document.getElementById("admin-chat-thread");
        if (titleEl) titleEl.textContent = "Nội dung chat";
        if (threadBox) threadBox.innerHTML = '<p class="text-muted mb-0">Chưa có hội thoại.</p>';
    }
    loadAdminChats();
}

function openAdminChatThread(userKey) {
    adminSelectedChatUser = userKey;
    const titleEl = document.getElementById("admin-chat-title");
    const threadBox = document.getElementById("admin-chat-thread");
    if (!threadBox) return;
    const store = getAdminChatStore();
    const msgs = store[userKey] || [];
    if (titleEl) titleEl.textContent = "Nội dung chat - " + userKey;
    threadBox.innerHTML = msgs.map(function (m) {
        const cls = m.sender === "admin" ? "bg-primary text-white text-end ms-auto" : "bg-light";
        return '<div class="p-2 rounded mb-2 ' + cls + '" style="max-width:85%">' + escapeHtml(m.text) + "</div>";
    }).join("");
    threadBox.scrollTop = threadBox.scrollHeight;
}

function sendAdminReply() {
    const input = document.getElementById("admin-chat-reply");
    if (!input || !adminSelectedChatUser) return;
    const text = input.value.trim();
    if (!text) return;
    const store = getAdminChatStore();
    if (!store[adminSelectedChatUser]) store[adminSelectedChatUser] = [];
    store[adminSelectedChatUser].push({
        id: "admin-" + Date.now(),
        sender: "admin",
        text: text,
        createdAt: new Date().toISOString()
    });
    saveAdminChatStore(store);
    input.value = "";
    loadAdminChats();
    showToast("Đã gửi phản hồi cho user", "success");
}

document.addEventListener("DOMContentLoaded", function () {
    if (location.hash === "#attendance") {
        switchAdminTab("attendance");
    } else {
        loadAdminPanel();
    }
    document.querySelectorAll("[data-admin-tab]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            switchAdminTab(btn.getAttribute("data-admin-tab"));
        });
    });
});

window.switchAdminTab = switchAdminTab;
window.showAdminModal = showAdminModal;
window.saveAdminForm = saveAdminForm;
window.editAdminDoc = editAdminDoc;
window.editAdminSubject = editAdminSubject;
window.deleteAdminDoc = deleteAdminDoc;
window.deleteAdminSubject = deleteAdminSubject;
window.approveDoc = approveDoc;
window.saveExamSettings = saveExamSettings;
window.openAdminChatThread = openAdminChatThread;
window.sendAdminReply = sendAdminReply;
window.deleteReport = deleteReport;
