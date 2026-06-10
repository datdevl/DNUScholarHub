/**
 * ScholarHub - Lớp dữ liệu: chuẩn hóa MockAPI, seed demo, môn học local
 */
const DATA_KEYS = {
    subjects: "scholarhub_mon_hoc",
    seeded: "scholarhub_demo_seeded_v2",
    localUsers: "scholarhub_local_users",
    localDocuments: "scholarhub_local_documents",
    examSettings: "scholarhub_exam_settings",
    reports: "scholarhub_reports"
};

function isJunkDocument(doc) {
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
    // Auto-replace MockAPI's fake names like 'ten_tai_lieu 13' with real-sounding titles
    if (/^(ten_tai_lieu|name)\s*\d+$/i.test(doc.tieu_de || doc.ten_tai_lieu || '')) {
        const idNum = parseInt(doc.id) || Math.floor(Math.random() * 1000);
        
        const itSubjects = [
            "Cấu trúc dữ liệu và Giải thuật", "Cơ sở dữ liệu", "Lập trình C/C++", "Lập trình Java", 
            "Mạng máy tính", "Hệ điều hành", "An toàn thông tin", "Phân tích thiết kế hệ thống", 
            "Công nghệ phần mềm", "Lập trình Web", "Lập trình Di động", "Trí tuệ nhân tạo", 
            "Học máy (Machine Learning)", "Khai phá dữ liệu", "Xử lý ảnh", "Đồ họa máy tính", 
            "Kiến trúc máy tính", "Toán rời rạc", "Xác suất thống kê", "Giải tích 1", 
            "Giải tích 2", "Đại số tuyến tính", "Nhập môn Khoa học máy tính", "Kỹ thuật lập trình", 
            "Điện toán đám mây", "Internet of Things (IoT)", "Công nghệ Blockchain", "Big Data", 
            "Mật mã học", "Hệ quản trị CSDL", "Kiểm thử phần mềm", "Thiết kế UI/UX", 
            "Thương mại điện tử", "Quản trị mạng", "Lập trình Python", "Lập trình C#",
            "Mạng nơ-ron nhân tạo", "Phát triển game", "Hệ thống nhúng", "Thực tế ảo (VR/AR)"
        ];
        const docTypes = ["Đề thi cuối kỳ", "Đề thi giữa kỳ", "Slide bài giảng", "Ghi chép (Note)", "Bài tập lớn", "Báo cáo đồ án", "Tài liệu tham khảo", "Ngân hàng câu hỏi"];
        
        const subName = itSubjects[(idNum * 7) % itSubjects.length];
        const typeName = docTypes[(idNum * 3) % docTypes.length];
        
        doc.tieu_de = typeName + " - " + subName + " (Chương " + ((idNum % 7)+1) + ")";
    }

    // Auto-assign random price (Free or VIP) for mock generated items
    if (doc.gia_xu === undefined || (typeof doc.gia_xu === 'string' && doc.gia_xu.includes('gia_xu'))) {
        const idNum = parseInt(doc.id) || Math.floor(Math.random() * 100);
        doc.gia_xu = (idNum % 3 === 0) ? (10 + (idNum % 5) * 5) : 0; 
    }

    // Assign strictly UNIQUE beautiful images for mock items using Picsum Seed based on ID
    if (!doc.anh_bia || doc.anh_bia.includes('cloudflare-ipfs') || doc.anh_bia.includes('fakerjs.dev') || doc.anh_bia.includes('avatar') || doc.anh_bia.includes('placeholder')) {
        const idNum = parseInt(doc.id) || Math.floor(Math.random() * 10000);
        // Using picsum seed guarantees a completely unique image for every single ID
        const promptText = encodeURIComponent("University IT Course " + (doc.tieu_de || "document"));
        doc.anh_bia = `https://image.pollinations.ai/prompt/${promptText}?width=600&height=400&nologo=true&seed=${idNum * 123}`;
    }
    
    // Assign subject ID realistically
    if (doc.id_mon_hoc === undefined || (typeof doc.id_mon_hoc === 'string' && doc.id_mon_hoc.includes('id_mon_hoc'))) {
         const idNum = parseInt(doc.id) || Math.floor(Math.random() * 100);
         doc.id_mon_hoc = (idNum % 40) + 1; // Assuming we will have many subjects
    }

    const title = doc.tieu_de || doc.ten_tai_lieu || doc.id || "Tài liệu học tập";
    const statusRaw = String(doc.trang_thai || SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED).toLowerCase();
    const status = statusRaw === "pending" ? SCHOLARHUB_CONFIG.DOC_STATUS.PENDING : SCHOLARHUB_CONFIG.DOC_STATUS.APPROVED;
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
        trang_thai: status,
        ngay_tao: doc.ngay_tao || new Date().toISOString().split("T")[0]
    };
}

function getLocalDocuments() {
    try {
        const raw = localStorage.getItem(DATA_KEYS.localDocuments);
        const arr = JSON.parse(raw || "[]");
        return Array.isArray(arr) ? arr.map(normalizeDocument) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalDocuments(list) {
    localStorage.setItem(DATA_KEYS.localDocuments, JSON.stringify(list || []));
}

function upsertLocalDocument(doc) {
    const list = getLocalDocuments();
    const id = String(doc.id);
    const idx = list.findIndex(function (item) {
        return String(item.id) === id;
    });
    if (idx >= 0) list[idx] = normalizeDocument({ ...list[idx], ...doc });
    else list.push(normalizeDocument(doc));
    saveLocalDocuments(list);
}

function deleteLocalDocumentById(id) {
    const list = getLocalDocuments().filter(function (item) {
        return String(item.id) !== String(id);
    });
    saveLocalDocuments(list);
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

function upsertLocalUserByIdentity(id, payload) {
    const users = getLocalUsers();
    const payloadEmail = String(payload.email || "").toLowerCase().trim();
    let idx = users.findIndex(function (u) {
        return String(u.id) === String(id);
    });
    if (idx < 0 && payloadEmail) {
        idx = users.findIndex(function (u) {
            return String(u.email || "").toLowerCase().trim() === payloadEmail;
        });
    }
    if (idx >= 0) {
        users[idx] = { ...users[idx], ...payload };
    } else if (payloadEmail) {
        users.push({ id: String(id), ...payload });
    }
    saveLocalUsers(users);
    return idx >= 0 ? users[idx] : users[users.length - 1];
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
            return Promise.resolve();
        });
}

function dedupeDocumentsByTitleAndImage(list) {
    const seen = {};
    const result = [];
    for (let i = 0; i < list.length; i++) {
        const d = normalizeDocument(list[i]);
        const key = (String(d.tieu_de || "").toLowerCase().trim() + "|" + String(d.anh_bia || "").toLowerCase().trim());
        if (seen[key]) continue;
        seen[key] = true;
        result.push(d);
    }
    return result;
}

function fetchAndNormalizeDocuments() {
    return api.getAllDocuments()
        .then(function (docs) {
            const apiList = (docs || []).map(normalizeDocument).filter(function (d) {
                return !isJunkDocument(d);
            });
            const localList = getLocalDocuments();
            return dedupeDocumentsByTitleAndImage(apiList.concat(localList));
        })
        .catch(function () {
            return dedupeDocumentsByTitleAndImage(getLocalDocuments());
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

    // We do NOT return local immediately if they have an API equivalent,
    // otherwise we might miss data updates. 
    // We only return local immediately if they are purely a local mock user.
    const local = getLocalUsers().find(function (u) {
        return (u.email || "").toLowerCase() === em;
    });
    if (local && String(local.id).startsWith("local")) {
        // Return purely local demo users immediately
        return Promise.resolve(local);
    }

    return api.getAllUsers()
        .then(function (users) {
            const list = users || [];
            for (let i = 0; i < list.length; i++) {
                const u = list[i];
                const mail = (u.email || "").toLowerCase();
                if (mail === em) {
                    const normUser = normalizeApiUser(u);
                    // MERGE WITH LOCAL TO GET THE LATEST PASSWORD
                    const locals = getLocalUsers();
                    const localSaved = locals.find(loc => String(loc.id) === String(normUser.id) || (loc.email || "").toLowerCase() === em);
                    if (localSaved) {
                        return { ...normUser, ...localSaved };
                    }
                    return normUser;
                }
            }
            return null;
        })
        .catch(function (err) {
            console.error("api.getAllUsers failed in findUserByEmailData:", err);
            // If API fails, AT LEAST return the local demo user if it exists!
            const fallback = getLocalUsers().find(function (u) {
                return (u.email || "").toLowerCase() === em;
            });
            return fallback || null;
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
    const localSaved = upsertLocalUserByIdentity(id, payload);
    if (String(id).indexOf("local") === 0) {
        return Promise.resolve(localSaved || payload);
    }
    return api.updateUser(id, payload).catch(function () {
        return localSaved || payload;
    });
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

function deleteLocalUserById(id) {
    const list = getLocalUsers().filter(function (u) {
        return String(u.id) !== String(id);
    });
    saveLocalUsers(list);
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
window.getLocalDocuments = getLocalDocuments;
window.saveLocalDocuments = saveLocalDocuments;
window.upsertLocalDocument = upsertLocalDocument;
window.deleteLocalDocumentById = deleteLocalDocumentById;
window.deleteLocalUserById = deleteLocalUserById;
