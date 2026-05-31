/**
 * ScholarHub - Trang yêu thích (localStorage + API)
 */
function loadFavoritesPage() {
    const grid = document.getElementById("favorites-grid");
    const empty = document.getElementById("favorites-empty");
    const favIds = getFavorites();

    if (favIds.length === 0) {
        if (grid) grid.innerHTML = "";
        if (empty) empty.classList.remove("d-none");
        return;
    }
    if (empty) empty.classList.add("d-none");
    showLoading("favorites-loader", 4);

    getAllDocumentsData()
        .then(function (docs) {
            return getAllSubjectsData().then(function (subs) {
                const favDocs = [];
                for (let i = 0; i < docs.length; i++) {
                    if (favIds.indexOf(String(docs[i].id)) >= 0) {
                        const status = String(docs[i].trang_thai || "Approved").toLowerCase();
                        if (status === "approved") favDocs.push(docs[i]);
                    }
                }
                if (grid) {
                    grid.innerHTML = "";
                    if (favDocs.length === 0) {
                        if (empty) empty.classList.remove("d-none");
                        return;
                    }
                    for (let j = 0; j < favDocs.length; j++) {
                        const name = getSubjectName(subs, favDocs[j].id_mon_hoc);
                        jqAppendDocCard("#favorites-grid", buildDocCardHtml(favDocs[j], name));
                    }
                }
            });
        })
        .catch(function () {
            showToast("Lỗi tải tài liệu yêu thích", "error");
        })
        .finally(function () {
            hideLoading("favorites-loader");
        });
}

document.addEventListener("DOMContentLoaded", loadFavoritesPage);
