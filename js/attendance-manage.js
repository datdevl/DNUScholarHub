/**
 * manage.js — Quản lý điểm danh
 * Sheet1 cột: [0]=FaceID [1]=Image(URL/base64) [2]=Time [3]=Location [4]=Session [5]=Status [6]=Name
 */
const _ATT_MANAGE = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.ATTENDANCE) || {};
const MANAGE_API = _ATT_MANAGE.API_URL || "https://script.google.com/macros/s/AKfycbziGyVEP3Syw_HK6aVCpkCkFSVjhjTSeVLqAEkKD7x7x9JkRUciWmzIQT_6dycv5wN_5w/exec";

let allRows = [];
let selectedDateKey = null;
let userPickedDateFilter = false;
let studentRoster = [];
let donutDisplayPct = 0;

function getPunctualStatus(timeText, sessionText) {
    return AttendancePunctuality.getPunctualStatus(timeText, sessionText);
}

function parseViDateTime(raw) {
    return AttendancePunctuality.parseViDateTime(raw);
}

function formatDateKey(timeText) {
    const dt = parseViDateTime(timeText);
    return dt ? dt.toLocaleDateString("vi-VN") : "Chưa có thời gian";
}
function extractDateFromFaceID(faceID) {
    const v = (faceID || "").toString();
    // IT1907-ddmmyyHHMMSS
    const m = v.match(/-(\d{2})(\d{2})(\d{2})\d{6}$/);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = 2000 + Number(m[3]);
    const dt = new Date(year, month - 1, day);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString("vi-VN");
}
function getDateKeyFromRow(row) {
    const time = (row[2] || "").toString();
    const fromTime = formatDateKey(time);
    if (fromTime !== "Chưa có thời gian") return fromTime;
    return extractDateFromFaceID(row[0]) || "Chưa có thời gian";
}
function renderDateTabs(rows) {
    const box = document.getElementById("dateTabs");
    if (!box) return;
    const keys = [...new Set(rows.map(i => getDateKeyFromRow(i.content)).filter(k => k !== "Chưa có thời gian"))];
    const today = new Date().toLocaleDateString("vi-VN");
    if (!userPickedDateFilter) {
        selectedDateKey = keys.includes(today) ? today : (keys[0] || "all");
    } else if (selectedDateKey !== "all" && !keys.includes(selectedDateKey)) {
        selectedDateKey = keys.includes(today) ? today : "all";
    }

    const sortedKeys = [...keys].sort((a, b) => {
        if (a === today) return -1;
        if (b === today) return 1;
        return 0;
    });

    box.innerHTML = "";

    sortedKeys.forEach(k => {
        const count = rows.filter(i => getDateKeyFromRow(i.content) === k).length;
        const btn = document.createElement("button");
        const isToday = k === today;
        btn.type = "button";
        btn.className = `date-tab ${selectedDateKey === k ? "active" : ""}`;
        btn.innerHTML = isToday
            ? `<i class="fa-solid fa-calendar-day me-1"></i>Hôm nay · ${k} <span class="opacity-75">(${count})</span>`
            : `${k} (${count})`;
        btn.onclick = () => {
            userPickedDateFilter = true;
            selectedDateKey = k;
            filterTable();
        };
        box.appendChild(btn);
    });

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = `date-tab ${selectedDateKey === "all" ? "active" : ""}`;
    allBtn.innerHTML = `<i class="fa-solid fa-layer-group me-1"></i>Tất cả (${rows.length})`;
    allBtn.onclick = () => {
        userPickedDateFilter = true;
        selectedDateKey = "all";
        filterTable();
    };
    box.appendChild(allBtn);
}

// ===== LOAD =====
async function loadData() {
    document.getElementById("countLbl").textContent = "Đang tải...";
    try {
        const [resSheet1, resSheet2] = await Promise.all([
            fetch(MANAGE_API),
            fetch(MANAGE_API + "?sheet=2")
        ]);
        const data = await resSheet1.json();
        const studentsData = await resSheet2.json().catch(() => []);

        let sheetRows = Array.isArray(data) ? data : [];
        if (sheetRows.length && isHeaderRow(sheetRows[0])) {
            sheetRows = sheetRows.slice(1);
        }
        allRows = sheetRows
            .map((row, i) => ({ content: row, sheetRow: i + 2 }))
            .reverse();

        // Sheet2: B=MSV, C=Tên
        studentRoster = Array.isArray(studentsData)
            ? studentsData.slice(1).map(r => ({
                msv: (r[1] || "").toString().trim(),
                name: (r[2] || "").toString().trim()
              })).filter(s => s.name)
            : [];

        renderDateTabs(allRows);
        filterTable();
    } catch (err) {
        document.getElementById("tableBody").innerHTML =
            `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--danger)">❌ Lỗi: ${err.message}</td></tr>`;
        document.getElementById("countLbl").textContent = "Lỗi kết nối";
    }
}

// ===== RENDER =====
function renderTable(rows) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    // Đếm stats
    const today = new Date().toLocaleDateString("vi-VN");
    let okCount = 0, todayCount = 0, lateCount = 0;

    rows.forEach(item => {
        const row = item.content;
        const status = (row[5] || "").toString().trim();
        const time   = (row[2] || "").toString();
        const session = (row[4] || "").toString();
        const normalizedStatusKey = normalizeStoredStatus(status, time, session).key;
        if (normalizedStatusKey === "onTime") okCount++;
        if (normalizedStatusKey === "late") lateCount++;
        if (getDateKeyFromRow(row) === today) todayCount++;
    });

    document.getElementById("sTotal").textContent = rows.length;
    document.getElementById("sOk").textContent    = okCount;
    document.getElementById("sNo").textContent    = lateCount;
    document.getElementById("sToday").textContent = todayCount;
    document.getElementById("countLbl").textContent = `${rows.length} bản ghi`;
    updateAttendanceStats(rows);

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="ico">📭</div><div>Chưa có dữ liệu điểm danh</div></div></td></tr>`;
        return;
    }

    let lastDateKey = "";
    rows.forEach((item, index) => {
        const row     = item.content;
        const realRow = item.sheetRow;

        // Đúng theo cấu trúc Sheet1
        const faceID   = (row[0] || "—").toString();
        const imgSrc   = (row[1] || "").toString();
        const time     = (row[2] || "—").toString();
        const location = (row[3] || "—").toString();
        const session  = (row[4] || "—").toString();
        const status   = (row[5] || "—").toString().trim();
        const name     = (row[6] || "Không rõ").toString();

        const normalizedStatus = normalizeStoredStatus(status, time, session);
        const punctual = normalizedStatus;
        const dateKey = getDateKeyFromRow(row);
        const displayDate = dateKey === "Chưa có thời gian" ? "Chưa có thời gian (dữ liệu cũ/lỗi định dạng)" : dateKey;

        if (dateKey !== lastDateKey) {
            const gtr = document.createElement("tr");
            gtr.innerHTML = `<td colspan="8" class="admin-att-date-row"><i class="fa-solid fa-calendar-days me-2"></i>Ngày ${displayDate}</td>`;
            tbody.appendChild(gtr);
            lastDateKey = dateKey;
        }

        // Kiểm tra imgSrc có phải URL hay base64 hợp lệ
        const hasImg = imgSrc && imgSrc.length > 10 &&
            (imgSrc.startsWith("http") || imgSrc.startsWith("data:image"));

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="row-num">${rows.length - index}</td>
            <td>
                ${hasImg
                    ? `<img src="${imgSrc}" class="attendance-face-thumb" alt="" loading="lazy"
                            onclick="openModal('${imgSrc.startsWith('data') ? '[base64]' : imgSrc}')"
                            onerror="this.outerHTML='<div class=admin-att-placeholder><i class=\\'fa-solid fa-user\\'></i></div>'">`
                    : `<div class="admin-att-placeholder"><i class="fa-solid fa-user"></i></div>`}
            </td>
            <td><span class="mono">${faceID}</span></td>
            <td class="name-cell">${name}</td>
            <td class="meta-cell">${time}</td>
            <td class="meta-cell">${location}<br><span style="color:var(--accent);font-weight:600;">${session}</span></td>
            <td><span class="badge ${punctual.cls}"><i class="fa-solid ${punctual.key === "onTime" ? "fa-circle-check" : punctual.key === "nomatch" ? "fa-user-xmark" : "fa-clock"} me-1"></i>${punctual.label}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-sm btn-ok" title="Đánh dấu Kịp" onclick="updateStatus(${realRow},'🟢 Kịp', this)"><i class="fa-solid fa-check"></i></button>
                    <button class="btn-sm btn-no" title="Đánh dấu Trễ" onclick="updateStatus(${realRow},'🟠 Trễ', this)"><i class="fa-solid fa-clock"></i></button>
                </div>
            </td>`;
        tbody.appendChild(tr);
    });
}

function updateAttendanceStats(currentRows) {
    const totalStudents = studentRoster.length;
    const statDate = selectedDateKey === "all"
        ? new Date().toLocaleDateString("vi-VN")
        : selectedDateKey;

    const rowsForDate = allRows.filter(item => getDateKeyFromRow(item.content) === statDate);
    const presentSet = new Set();
    rowsForDate.forEach(item => {
        const row = item.content;
        const name = (row[6] || "").toString().trim();
        const status = (row[5] || "").toString().trim();
        const time = (row[2] || "").toString();
        const session = (row[4] || "").toString();
        const key = normalizeStoredStatus(status, time, session).key;
        if (name && key !== "nomatch") presentSet.add(name.toLowerCase());
    });

    const presentCount = presentSet.size;
    const absentCount = Math.max(totalStudents - presentCount, 0);
    const pct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    const sAbsent = document.getElementById("sAbsent");
    const sStudents = document.getElementById("sStudents");
    if (sAbsent) sAbsent.textContent = absentCount;
    if (sStudents) sStudents.textContent = totalStudents;

    const donut = document.getElementById("donutChart");
    const donutPct = document.getElementById("donutPct");
    const lgPresent = document.getElementById("lgPresent");
    const lgAbsent = document.getElementById("lgAbsent");
    const lgDate = document.getElementById("lgDate");

    animateDonutChart(pct);
    if (lgPresent) lgPresent.textContent = String(presentCount);
    if (lgAbsent) lgAbsent.textContent = String(absentCount);
    if (lgDate) lgDate.textContent = statDate;
}

// ===== FILTER =====
function filterTable() {
    const q      = document.getElementById("searchInput").value.toLowerCase();
    const fStat  = document.getElementById("filterStatus").value;

    renderDateTabs(allRows);
    const filtered = allRows.filter(item => {
        const row    = item.content;
        const name   = (row[6] || "").toLowerCase();
        const faceID = (row[0] || "").toLowerCase();
        const loc    = (row[3] || "").toLowerCase();
        const time   = (row[2] || "").toString();
        const session= (row[4] || "").toString();
        const status = (row[5] || "").toString().trim();
        const punctual = normalizeStoredStatus(status, time, session).key;
        const dateKey = getDateKeyFromRow(row);

        const matchQ = !q || name.includes(q) || faceID.includes(q) || loc.includes(q);
        const matchS = !fStat
            || (fStat === "ok" && punctual === "onTime")
            || (fStat === "late" && punctual === "late")
            || (fStat === "nomatch" && punctual === "nomatch");
        const matchD = !selectedDateKey || selectedDateKey === "all" || dateKey === selectedDateKey;

        return matchQ && matchS && matchD;
    });

    renderTable(filtered);
}

// ===== UPDATE STATUS =====
async function updateStatus(row, status, btnEl) {
    try {
        if (btnEl) {
            btnEl.classList.add("is-saving");
            setTimeout(() => btnEl.classList.remove("is-saving"), 280);
        }
        const url = `${MANAGE_API}?update=true&row=${row}&status=${encodeURIComponent(status)}`;
        await fetch(url, { method: "POST" });
        await loadData();
    } catch (err) {
        alert("❌ Lỗi cập nhật: " + err.message);
    }
}

function normalizeStoredStatus(status, time, session) {
    const s = (status || "").toLowerCase();
    if (s === "kịp" || s === "ok" || s === "kip" || s === "kịp" || s.includes("kịp") || s.includes("kip")) {
        return { key: "onTime", label: "Kịp", sheetStatus: "🟢 Kịp", cls: "ok" };
    }
    if (s === "trễ" || s === "late" || s === "tre" || s === "trễ" || s.includes("trễ") || s.includes("tre")) {
        return { key: "late", label: "Trễ", sheetStatus: "🟠 Trễ", cls: "late" };
    }

    if (s.includes("không khớp") || s.includes("khong khop") || s === "⚠") {
        return { key: "nomatch", label: "Không khớp", cls: "no" };
    }

    // Check for explicit Kịp/Trễ overrides from sheet
    if (s.includes("kịp") || s === "ok" || s.includes("kip")) {
        return { key: "onTime", label: "Kịp", sheetStatus: "🟢 Kịp", cls: "ok" };
    }
    if (s.includes("trễ") || s.includes("tre") || s === "late") {
        return { key: "late", label: "Trễ", sheetStatus: "🟠 Trễ", cls: "late" };
    }

    return getPunctualStatus(time, session);
}

function animateDonutChart(targetPct) {
    const donut = document.getElementById("donutChart");
    const donutPct = document.getElementById("donutPct");
    if (!donut) return;
    const target = Math.max(0, Math.min(100, targetPct));
    const start = donutDisplayPct;
    const t0 = performance.now();
    const duration = 700;

    function step(now) {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        donutDisplayPct = Math.round(start + (target - start) * eased);
        donut.style.setProperty("--p", String(donutDisplayPct));
        if (donutPct) donutPct.textContent = `${donutDisplayPct}%`;
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function isHeaderRow(row) {
    if (!Array.isArray(row)) return false;
    const c0 = (row[0] || "").toString().toLowerCase();
    const c2 = (row[2] || "").toString().toLowerCase();
    return c0.includes("face") || c0 === "id" || c2.includes("thời gian") || c2.includes("time");
}

// ===== MODAL =====
function openModal(src) {
    if (src === "[base64]") { alert("Ảnh base64 — xem trong Google Sheet"); return; }
    const modal = document.getElementById("imgModal");
    document.getElementById("modalImg").src = src;
    if (modal) {
        modal.classList.add("open");
        modal.style.display = "flex";
    }
}
function closeModal() {
    const modal = document.getElementById("imgModal");
    if (modal) {
        modal.classList.remove("open");
        modal.style.display = "none";
    }
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

let attendancePollTimer = null;
function startAttendanceAdmin() {
    loadData();
    if (!attendancePollTimer) {
        attendancePollTimer = setInterval(loadData, 15000);
    }
}

if (document.getElementById("tableBody") && !document.querySelector(".admin-sidebar")) {
    loadData();
    setInterval(loadData, 15000);
}

window.startAttendanceAdmin = startAttendanceAdmin;
