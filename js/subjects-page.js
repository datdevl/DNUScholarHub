/**
 * ScholarHub - Trang môn học
 */
function loadSubjectsPage() {
    const tbody = document.getElementById("subjects-table-body");
    const loader = document.getElementById("subjects-page-loader");
    if (loader) loader.classList.remove("d-none");

    getAllSubjectsData()
        .then(function (subs) {
            if (!tbody) return;
            if (subs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">Chưa có môn học. Admin có thể thêm từ trang quản trị.</td></tr>`;
                return;
            }
            let html = "";
            for (let i = 0; i < subs.length; i++) {
                const s = subs[i];
                html += `
                <tr>
                    <td><span class="badge bg-primary">${escapeHtml(s.ma_mon_hoc)}</span></td>
                    <td class="fw-semibold">${escapeHtml(s.ten_mon_hoc)}</td>
                    <td>${escapeHtml(s.khoa_vien || "—")}</td>
                    <td>${s.so_tin_chi || 0}</td>
                    <td>
                        <a href="documents.html?mon=${s.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fa-solid fa-file-lines me-1"></i>Xem tài liệu
                        </a>
                    </td>
                </tr>`;
            }
            tbody.innerHTML = html;
        })
        .catch(function () {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Lỗi tải dữ liệu</td></tr>`;
            }
            showToast("Không thể tải danh sách môn học", "error");
        })
        .finally(function () {
            if (loader) loader.classList.add("d-none");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof initLayout === "function") initLayout("subjects");
    loadSubjectsPage();
});
