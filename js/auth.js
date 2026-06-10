/**
 * ScholarHub - Xác thực & quản lý xu
 */

function getCurrentUser() {
    try {
        const raw = localStorage.getItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.user);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user && user.id) {
        user.last_access = new Date().toISOString();
        if (typeof updateUserData === "function") {
            updateUserData(user.id, { last_access: user.last_access }).catch(function() {});
        }
    }
    localStorage.setItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.user, JSON.stringify(user));
    if (typeof updateHeaderUserUI === "function") updateHeaderUserUI();
}

function logoutUser() {
    localStorage.removeItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.user);
    window.location.href = window.SH_HTML + "login.html";
}

function isLoggedIn() {
    const u = getCurrentUser();
    return u && u.id;
}

function getPurchasedDocs() {
    const user = getCurrentUser();
    if (!user || !user.id) return [];
    try {
        const raw = localStorage.getItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.purchased);
        const parsed = JSON.parse(raw || "{}");
        if (Array.isArray(parsed)) {
            // Migrate legacy global purchased list to neutral bucket,
            // avoid granting all VIP docs to any newly logged in account.
            const migrated = { "__legacy__": parsed.map(function (id) { return String(id); }) };
            localStorage.setItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.purchased, JSON.stringify(migrated));
            return [];
        }
        if (!parsed || typeof parsed !== "object") return [];
        const list = parsed[String(user.id)];
        return Array.isArray(list) ? list.map(function (id) { return String(id); }) : [];
    } catch (e) {
        return [];
    }
}

function addPurchasedDoc(docId) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const uid = String(user.id);
    let store = {};
    try {
        store = JSON.parse(localStorage.getItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.purchased) || "{}");
        if (Array.isArray(store)) {
            store = {};
        }
    } catch (e) {
        store = {};
    }
    const ids = Array.isArray(store[uid]) ? store[uid].map(function (id) { return String(id); }) : [];
    const id = String(docId);
    if (ids.indexOf(id) < 0) {
        ids.push(id);
        store[uid] = ids;
        localStorage.setItem(SCHOLARHUB_CONFIG.STORAGE_KEYS.purchased, JSON.stringify(store));
    }
}

function hasPurchasedDoc(docId) {
    return getPurchasedDocs().indexOf(String(docId)) >= 0;
}

function getDocPrice(doc) {
    const gia = Number(doc.gia_xu);
    if (!isNaN(gia) && gia >= 0) return gia;
    return 0;
}

function isDocFree(doc) {
    return getDocPrice(doc) === 0;
}

function canAccessDoc(doc) {
    if (isDocFree(doc)) return true;
    if (!isLoggedIn()) return false;
    return hasPurchasedDoc(doc.id);
}

function purchaseDocument(doc) {
    const price = getDocPrice(doc);
    if (price === 0) return Promise.resolve(true);
    if (!isLoggedIn()) {
        showToast("Vui lòng đăng nhập để mua tài liệu", "error");
        return Promise.reject(new Error("not_logged_in"));
    }
    if (hasPurchasedDoc(doc.id)) return Promise.resolve(true);

    const user = getCurrentUser();
    const xu = Number(user.so_xu) || 0;
    if (xu < price) {
        showToast("Không đủ xu! Bạn có " + xu + " xu, cần " + price + " xu.", "error");
        return Promise.reject(new Error("insufficient_xu"));
    }

    const newXu = xu - price;
    const payload = {
        ho_ten: user.ho_ten,
        email: user.email,
        anh_dai_dien: user.anh_dai_dien,
        so_xu: newXu,
        diem_tich_luy: user.diem_tich_luy || 0,
        truong_hoc: user.truong_hoc || "",
        so_dien_thoai: user.so_dien_thoai || "",
        ten_dang_nhap: user.ten_dang_nhap || user.email,
        mat_khau: user.mat_khau || ""
    };

    return updateUserData(user.id, payload).then(function () {
        user.so_xu = newXu;
        setCurrentUser(user);
        addPurchasedDoc(doc.id);
        if (typeof publishUserActivity === "function") {
            publishUserActivity("da mua tai lieu VIP", doc.tieu_de || "");
        }
        showToast("Đã mua tài liệu (-" + price + " xu)", "success");
        return true;
    });
}

function loginWithApiUser(user, role) {
    const session = {
        id: user.id,
        ho_ten: user.ho_ten || "Sinh viên",
        email: user.email,
        mat_khau: user.mat_khau || "",
        anh_dai_dien: user.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0],
        so_xu: Number(user.so_xu) || Number(user.diem_tich_luy) || SCHOLARHUB_CONFIG.NEW_USER_XU,
        diem_tich_luy: Number(user.diem_tich_luy) || 0,
        truong_hoc: user.truong_hoc || "Đại học Đại Nam",
        so_dien_thoai: user.so_dien_thoai || "",
        ten_dang_nhap: user.ten_dang_nhap || user.email,
        role: role || "student"
    };
    setCurrentUser(session);
    return session;
}

function findUserByEmail(email) {
    return findUserByEmailData(email);
}

window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.logoutUser = logoutUser;
window.isLoggedIn = isLoggedIn;
window.getPurchasedDocs = getPurchasedDocs;
window.hasPurchasedDoc = hasPurchasedDoc;
window.purchaseDocument = purchaseDocument;
window.canAccessDoc = canAccessDoc;
window.getDocPrice = getDocPrice;
window.isDocFree = isDocFree;
window.loginWithApiUser = loginWithApiUser;
window.findUserByEmail = findUserByEmail;
