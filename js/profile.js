/**
 * ScholarHub - Hồ sơ cá nhân (BKTin style)
 */
let profileUser = null;

function loadProfile() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        window.location.href = "login.html";
        return;
    }

    api.getUserById(user.id)
        .then(function (u) {
            profileUser = u;
            fillProfileForm(u);
            renderAvatarSection(u.anh_dai_dien);
            updateCoinDisplay(u);
        })
        .catch(function () {
            fillProfileForm(user);
            renderAvatarSection(user.anh_dai_dien);
            updateCoinDisplay(user);
        });
}

function fillProfileForm(u) {
    setVal("pf-ho-ten", u.ho_ten);
    setVal("pf-sdt", u.so_dien_thoai);
    setVal("pf-truong", u.truong_hoc);
    setVal("pf-username", u.ten_dang_nhap);
    setVal("pf-email", u.email);
    const emailEl = document.getElementById("pf-email");
    if (emailEl) emailEl.readOnly = true;
}

function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v || "";
}

function updateCoinDisplay(u) {
    const xu = Number(u.so_xu) || Number(u.diem_tich_luy) || 0;
    const el = document.getElementById("profile-xu-count");
    if (el) el.textContent = xu;
    const hdr = document.getElementById("header-xu-val");
    if (hdr) hdr.textContent = xu;
}

function renderAvatarSection(currentUrl) {
    const main = document.getElementById("profile-avatar-main");
    const grid = document.getElementById("avatar-samples-grid");
    if (!main || !grid) return;

    const url = currentUrl || SCHOLARHUB_CONFIG.DEFAULT_AVATARS[0];
    main.src = url;
    main.onclick = function () {
        document.getElementById("avatar-file-input").click();
    };

    let html = "";
    const samples = SCHOLARHUB_CONFIG.DEFAULT_AVATARS;
    for (let i = 0; i < samples.length; i++) {
        html += `<img src="${samples[i]}" class="avatar-sample ${url === samples[i] ? "selected" : ""}" data-url="${samples[i]}" alt="">`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll(".avatar-sample").forEach(function (img) {
        img.addEventListener("click", function () {
            const u = img.getAttribute("data-url");
            main.src = u;
            grid.querySelectorAll(".avatar-sample").forEach(function (s) {
                s.classList.toggle("selected", s === img);
            });
        });
    });
}

function saveProfile(e) {
    e.preventDefault();
    const form = document.getElementById("profile-form");
    if (!form) return;

    const user = getCurrentUser();
    const avatar = document.getElementById("profile-avatar-main").src;

    const payload = {
        ho_ten: document.getElementById("pf-ho-ten").value.trim(),
        so_dien_thoai: document.getElementById("pf-sdt").value.trim(),
        truong_hoc: document.getElementById("pf-truong").value.trim(),
        ten_dang_nhap: document.getElementById("pf-username").value.trim(),
        email: user.email,
        anh_dai_dien: avatar,
        so_xu: Number(user.so_xu) || 0,
        diem_tich_luy: Number(user.diem_tich_luy) || 0
    };

    if (!payload.ho_ten) {
        showToast("Họ tên không được trống", "error");
        return;
    }

    updateUserData(user.id, payload)
        .then(function () {
            const updated = { ...user, ...payload };
            setCurrentUser(updated);
            showToast("Đã lưu thay đổi!", "success");
        })
        .catch(function () {
            showToast("Lưu thất bại", "error");
        });
}

function napXu(amount) {
    const user = getCurrentUser();
    if (!user) return;
    const add = Number(amount) || 0;
    const newXu = (Number(user.so_xu) || 0) + add;
    const newDiem = (Number(user.diem_tich_luy) || 0) + Math.floor(add / 2);

    updateUserData(user.id, {
        ho_ten: user.ho_ten,
        email: user.email,
        mat_khau: user.mat_khau || "",
        anh_dai_dien: user.anh_dai_dien,
        so_xu: newXu,
        diem_tich_luy: newDiem,
        truong_hoc: user.truong_hoc || "",
        so_dien_thoai: user.so_dien_thoai || "",
        ten_dang_nhap: user.ten_dang_nhap || user.email
    })
        .then(function () {
            user.so_xu = newXu;
            user.diem_tich_luy = newDiem;
            setCurrentUser(user);
            updateCoinDisplay(user);
            showToast("Nạp thành công +" + add + " Xu!", "success");
        })
        .catch(function () {
            showToast("Nạp xu thất bại", "error");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    initLayout("profile", { sidebar: false });
    loadProfile();

    const form = document.getElementById("profile-form");
    if (form) form.addEventListener("submit", saveProfile);

    document.querySelectorAll("[data-nap-xu]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            napXu(Number(btn.getAttribute("data-nap-xu")));
        });
    });

    const fileInput = document.getElementById("avatar-file-input");
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                document.getElementById("profile-avatar-main").src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (window.location.hash === "#nap-xu") {
        const tab = document.querySelector('[data-bs-target="#tab-wallet"]');
        if (tab) bootstrap.Tab.getOrCreateInstance(tab).show();
    }
});
