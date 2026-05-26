/**
 * ScholarHub - Lớp dữ liệu: chuẩn hóa MockAPI, seed demo, môn học local
 */
const DATA_KEYS = {
    subjects: "scholarhub_mon_hoc",
    seeded: "scholarhub_demo_seeded_v2",
    localUsers: "scholarhub_local_users"
};

function isJunkDocument(doc) {
    if (!doc) return true;
    const title = String(doc.tieu_de || doc.ten_tai_lieu || "").trim();
    const loai = String(doc.loai_tai_lieu || "").trim();
    if (!title) return true;
    if (/^ten_tai_lieu\s*\d*$/i.test(title)) return true;
    if (/^loai_tai_lieu\s*\d+$/i.test(loai)) return true;
    if (/^nguoi_dang\s*\d+$/i.test(String(doc.nguoi_dang || ""))) return true;
    return false;
}

function normalizeLoaiTaiLieu(raw) {
    const s = String(raw || "").trim();
    const map = { "1": "Đề thi", "2": "Slide bài giảng", "3": "Ghi chép", "4": "Tài liệu tham khảo" };
    if (map[s]) return map[s];
    if (SCHOLARHUB_CONFIG.DOC_TYPES.indexOf(s) >= 0) return s;
    if (/^loai_tai_lieu/i.test(s)) return "Tài liệu tham khảo";
    if (s === "Slide") return "Slide bài giảng";
    if (s === "Đề thi" || s.indexOf("Đề") >= 0) return "Đề thi";
    return s || "Tài liệu tham khảo";
}

function normalizeDocument(doc) {
    const title = doc.tieu_de || doc.ten_tai_lieu || "Tài liệu học tập";
    return {
        ...doc,
        id: doc.id,
        tieu_de: title,
        id_mon_hoc: Number(doc.id_mon_hoc) || 1,
        loai_tai_lieu: normalizeLoaiTaiLieu(doc.loai_tai_lieu),
        nguoi_dang: doc.nguoi_dang && !/^nguoi_dang\s*\d+$/i.test(doc.nguoi_dang) ? doc.nguoi_dang : "Sinh viên DNU",
        duong_dan_file: doc.duong_dan_file || "https://drive.google.com/",
        anh_bia: doc.anh_bia || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop",
        so_luot_xem: Number(doc.so_luot_xem) || 0,
        so_luot_tai: Number(doc.so_luot_tai) || 0,
        diem_danh_gia: Number(doc.diem_danh_gia) || 4,
        tu_khoa: doc.tu_khoa || "",
        nam_hoc: doc.nam_hoc || "2024-2025",
        mo_ta: doc.mo_ta || "",
        gia_xu: doc.gia_xu != null ? Number(doc.gia_xu) : 0,
        trang_thai: doc.trang_thai || SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED,
        ngay_tao: doc.ngay_tao || new Date().toISOString().split("T")[0]
    };
}

function getLocalSubjects() {
    try {
        const raw = localStorage.getItem(DATA_KEYS.subjects);
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length) return arr;
        }
    } catch (e) {}
    localStorage.setItem(DATA_KEYS.subjects, JSON.stringify(SEED_SUBJECTS));
    return SEED_SUBJECTS.slice();
}

function saveLocalSubjects(list) {
    localStorage.setItem(DATA_KEYS.subjects, JSON.stringify(list));
}

function getSubjectNameFromCache(subjects, idMon) {
    const found = subjects.find(function (s) {
        return String(s.id) === String(idMon);
    });
    return found ? found.ten_mon_hoc : "Môn học";
}

function getLocalUsers() {
    try {
        const raw = localStorage.getItem(DATA_KEYS.localUsers);
        const arr = JSON.parse(raw || "[]");
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function saveLocalUsers(users) {
    localStorage.setItem(DATA_KEYS.localUsers, JSON.stringify(users));
}

function ensureDemoLocalUsers() {
    let users = getLocalUsers();
    let changed = false;
    SEED_DEMO_USERS.forEach(function (demo) {
        const exists = users.some(function (u) {
            return (u.email || "").toLowerCase() === demo.email.toLowerCase();
        });
        if (!exists) {
            users.push({ ...demo, id: "local-demo-" + demo.email });
            changed = true;
        }
    });
    if (changed || users.length === 0) {
        if (users.length === 0) {
            users = SEED_DEMO_USERS.map(function (d, i) {
                return { ...d, id: "local-" + (i + 1) };
            });
        }
        saveLocalUsers(users);
    }
    return users;
}

function seedDocumentsToApi() {
    if (localStorage.getItem(DATA_KEYS.seeded) === "done") {
        return Promise.resolve();
    }
    const posts = SEED_DOCUMENTS.map(function (doc) {
        return api.createDocument(doc);
    });
    return Promise.all(posts)
        .then(function () {
            localStorage.setItem(DATA_KEYS.seeded, "done");
        })
        .catch(function (err) {
            console.warn("Seed API:", err);
            localStorage.setItem(DATA_KEYS.seeded, "done");
        });
}

function fetchAndNormalizeDocuments() {
    return api.getAllDocuments()
        .then(function (docs) {
            const list = (docs || []).map(normalizeDocument).filter(function (d) {
                return !isJunkDocument(d);
            });
            if (list.length >= 6) {
                return list;
            }
            return seedDocumentsToApi().then(function () {
                return api.getAllDocuments();
            }).then(function (all) {
                const merged = (all || []).map(normalizeDocument).filter(function (d) {
                    return !isJunkDocument(d);
                });
                if (merged.length >= 6) return merged;
                return SEED_DOCUMENTS.map(normalizeDocument);
            });
        })
        .catch(function () {
            return SEED_DOCUMENTS.map(normalizeDocument);
        });
}

function getAllSubjectsData() {
    return Promise.resolve(getLocalSubjects());
}

function getAllDocumentsData() {
    return fetchAndNormalizeDocuments();
}

function findUserByEmailData(email) {
    const em = (email || "").toLowerCase().trim();
    ensureDemoLocalUsers();

    const local = getLocalUsers().find(function (u) {
        return (u.email || "").toLowerCase() === em;
    });
    if (local) return Promise.resolve(local);

    return api.getAllUsers()
        .then(function (users) {
            const list = users || [];
            for (let i = 0; i < list.length; i++) {
                const u = list[i];
                const mail = (u.email || "").toLowerCase();
                if (mail === em) {
                    return normalizeApiUser(u);
                }
            }
            return null;
        })
        .catch(function () {
            return null;
        });
}

function normalizeApiUser(u) {
    const pass = u.mat_khau || u.thong_tin || "";
    return {
        id: u.id,
        ho_ten: u.ho_ten && !/^ho_ten\s*\d+$/i.test(u.ho_ten) ? u.ho_ten : "Sinh viên",
        email: u.email,
        mat_khau: typeof pass === "string" && !/^thong_tin\s*\d+$/i.test(pass) ? pass : "",
        anh_dai_dien: u.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0],
        so_xu: Number(u.so_xu) || Number(u.diem_tich_luy) || 0,
        diem_tich_luy: Number(u.diem_tich_luy) || 0,
        truong_hoc: u.truong_hoc || "Đại học Đại Nam",
        ten_dang_nhap: u.ten_dang_nhap || (u.email || "").split("@")[0],
        so_dien_thoai: u.so_dien_thoai || ""
    };
}

function registerUserData(payload) {
    ensureDemoLocalUsers();
    const users = getLocalUsers();
    const exists = users.some(function (u) {
        return (u.email || "").toLowerCase() === payload.email.toLowerCase();
    });
    if (exists) return Promise.reject(new Error("exists"));

    const newUser = {
        id: "local-" + Date.now(),
        ho_ten: payload.ho_ten,
        email: payload.email,
        mat_khau: payload.mat_khau,
        truong_hoc: payload.truong_hoc || "Đại học Đại Nam",
        anh_dai_dien: payload.anh_dai_dien || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0],
        so_xu: payload.so_xu != null ? payload.so_xu : SCHOLARHUB_CONFIG.NEW_USER_XU,
        diem_tich_luy: 0,
        ten_dang_nhap: payload.ten_dang_nhap || payload.email.split("@")[0],
        so_dien_thoai: ""
    };
    users.push(newUser);
    saveLocalUsers(users);

    return api.createUser({
        ho_ten: newUser.ho_ten,
        email: newUser.email,
        mat_khau: newUser.mat_khau,
        thong_tin: newUser.mat_khau,
        anh_dai_dien: newUser.anh_dai_dien,
        so_xu: newUser.so_xu,
        diem_tich_luy: 0,
        truong_hoc: newUser.truong_hoc,
        ten_dang_nhap: newUser.ten_dang_nhap
    }).then(function (apiUser) {
        if (apiUser && apiUser.id) {
            newUser.id = apiUser.id;
            saveLocalUsers(users);
        }
        return newUser;
    }).catch(function () {
        return newUser;
    });
}

function updateUserData(id, payload) {
    const users = getLocalUsers();
    const idx = users.findIndex(function (u) {
        return String(u.id) === String(id);
    });
    if (idx >= 0) {
        users[idx] = { ...users[idx], ...payload };
        saveLocalUsers(users);
    }
    if (String(id).indexOf("local") === 0) {
        return Promise.resolve(users[idx] || payload);
    }
    return api.updateUser(id, payload);
}

function createLocalSubject(data) {
    const list = getLocalSubjects();
    const id = String(Date.now());
    const item = { ...data, id: id };
    list.push(item);
    saveLocalSubjects(list);
    return Promise.resolve(item);
}

function updateLocalSubject(id, data) {
    const list = getLocalSubjects();
    const idx = list.findIndex(function (s) {
        return String(s.id) === String(id);
    });
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...data, id: list[idx].id };
        saveLocalSubjects(list);
        return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("not found"));
}

function deleteLocalSubject(id) {
    let list = getLocalSubjects();
    list = list.filter(function (s) {
        return String(s.id) !== String(id);
    });
    saveLocalSubjects(list);
    return Promise.resolve();
}

function initScholarHubData() {
    getLocalSubjects();
    ensureDemoLocalUsers();
    return seedDocumentsToApi();
}

window.getAllSubjectsData = getAllSubjectsData;
window.getAllDocumentsData = getAllDocumentsData;
window.findUserByEmailData = findUserByEmailData;
window.registerUserData = registerUserData;
window.updateUserData = updateUserData;
window.getSubjectNameFromCache = getSubjectNameFromCache;
window.normalizeDocument = normalizeDocument;
window.initScholarHubData = initScholarHubData;
window.getLocalSubjects = getLocalSubjects;
window.getLocalUsers = getLocalUsers;
window.normalizeApiUser = normalizeApiUser;
window.createLocalSubject = createLocalSubject;
window.updateLocalSubject = updateLocalSubject;
window.deleteLocalSubject = deleteLocalSubject;
