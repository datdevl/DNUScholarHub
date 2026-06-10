/**
 * ============================================================
 * FACE.JS — HỆ THỐNG ĐIỂM DANH AI - DNU IT1907
 * Fix: % khớp đúng | Đánh giá trạng thái | Ghi Sheet1 đầy đủ
 * Sheet2 cấu trúc: A=STT, B=MSV, C=TênSV, D=FACE(URL ảnh), E=ID
 * Sheet1 ghi: FaceID | Image | Time | Location | Session | Status | Name
 * ============================================================
 */

// ===== CẤU HÌNH (ScholarHub config hoặc mặc định EduAttend) =====
const _ATT_CFG = (typeof SCHOLARHUB_CONFIG !== "undefined" && SCHOLARHUB_CONFIG.ATTENDANCE) || {};
const FACE_API_URL  = _ATT_CFG.API_URL || "https://script.google.com/macros/s/AKfycbziGyVEP3Syw_HK6aVCpkCkFSVjhjTSeVLqAEkKD7x7x9JkRUciWmzIQT_6dycv5wN_5w/exec";
const MODEL_URL     = _ATT_CFG.MODEL_URL || "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
const FACE_THRESHOLD = _ATT_CFG.FACE_THRESHOLD != null ? _ATT_CFG.FACE_THRESHOLD : 0.55;
const NEAR_MATCH_THRESHOLD = _ATT_CFG.NEAR_MATCH_THRESHOLD != null ? _ATT_CFG.NEAR_MATCH_THRESHOLD : 0.62;
const DETECTOR_OPTS = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.45 });
const PRELOAD_DESCRIPTORS = _ATT_CFG.PRELOAD_DESCRIPTORS !== false;
const PRELOAD_BATCH = _ATT_CFG.PRELOAD_BATCH_SIZE || 4;
const STUDENT_SHEET = _ATT_CFG.STUDENT_SHEET || "2";
const ID_PREFIX = _ATT_CFG.ID_PREFIX || "IT1907";

// ===== DOM ELEMENTS =====
const video       = document.getElementById("video");
const overlay     = document.getElementById("overlay");
const overlayCtx  = overlay ? overlay.getContext("2d") : null;
const videoWrap   = document.getElementById("videoWrap");
const faceTracker = document.getElementById("faceTracker");
const faceNameText= document.getElementById("faceNameText");
const faceMetaText= document.getElementById("faceMetaText");
const camIdle     = document.getElementById("camIdle");
const scanBtn     = document.getElementById("scanBtn");
const modelStatus = document.getElementById("modelStatus");
const progressFill= document.getElementById("progressFill");
const camDot      = document.getElementById("camDot");
const camStatus   = document.getElementById("camStatus");
const scanHud     = document.getElementById("scanHud");
const qualityBadge= document.getElementById("qualityBadge");
const hudTime     = document.getElementById("hudTime");
const hudLocation = document.getElementById("hudLocation");
const hudSession  = document.getElementById("hudSession");
const hudPerson   = document.getElementById("hudPerson");
const msvInputEl  = document.getElementById("msvInput");

// ===== STATE =====
let modelsLoaded = false;
let knownFaces   = []; // [{msv, id, name, faceUrl, descriptor?}] — từ Sheet2
let detectionRafId = null;
let lastDetectTs = 0;
let knownFacesLoaded = false;
let cachedLocation = "Đang lấy vị trí...";
let currentLiveMatch = null;
let lastMatchTick = 0;
let isMatching = false;
let preloadRunning = false;
let descriptorsReady = 0;
let lastUiSnapshot = "";
const DETECT_INTERVAL_MS = 200;
const MATCH_INTERVAL_MS = 1100;
let scanAnimPhase = 0;

// =====================================================
// 1. LOAD MODELS AI
// =====================================================
async function loadModels() {
    try {
        setProgress(10, "Tải TinyFaceDetector...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setProgress(40, "Tải FaceLandmark68Tiny...");
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);

        setProgress(70, "Tải FaceRecognition...");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        setProgress(90, "Tải FaceExpression...");
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        setProgress(100, "Sẵn sàng!");
        modelsLoaded = true;

        setTimeout(() => {
            if (modelStatus) {
                modelStatus.innerHTML = `
                    <div class="d-flex align-items-center gap-2 text-success small fw-semibold">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Model AI sẵn sàng</span>
                        <span class="ms-auto text-muted fw-normal" id="knownCount">Đang tải CSDL...</span>
                    </div>`;
            }
            if (scanBtn) scanBtn.disabled = false;
            startDetectionLoop();
            startHudClock();
            refreshCachedLocation();
        }, 400);

    } catch (err) {
        modelStatus.innerHTML = `<div style="color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:10px;font-size:13px;">❌ Lỗi tải model: ${err.message}</div>`;
    }
}

function setProgress(pct, msg) {
    if (progressFill) progressFill.style.width = pct + "%";
    const el = modelStatus && modelStatus.querySelector("div:first-child");
    if (el) el.textContent = msg;
}

// =====================================================
// 2. CAMERA
// =====================================================
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: false
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            overlay.width  = video.videoWidth;
            overlay.height = video.videoHeight;
            setCamState("live", "Camera đang chạy");
            video.play();
        };
    } catch {
        setCamState("denied", "Không mở được camera");
    }
}

// =====================================================
// 3. REALTIME — phát hiện + nhận diện tên + HUD trên camera
// =====================================================
/** Map tọa độ face-api (buffer video) → pixel trong khung hiển thị (object-fit: cover, selfie mirror) */
function getVideoDisplayMetrics() {
    const wrap = videoWrap || (video && video.parentElement);
    if (!wrap || !video || !video.videoWidth) return null;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const videoAR = vw / vh;
    const containerAR = cw / ch;
    let scale, ox, oy;
    if (videoAR > containerAR) {
        scale = ch / vh;
        ox = (cw - vw * scale) / 2;
        oy = 0;
    } else {
        scale = cw / vw;
        ox = 0;
        oy = (ch - vh * scale) / 2;
    }
    return { scale, ox, oy, cw, ch, vw, vh };
}

function mapFaceBoxToContainer(box, pad = 14) {
    const m = getVideoDisplayMetrics();
    if (!m || !box) return null;
    const left = m.ox + (m.vw - box.x - box.width) * m.scale - pad;
    const top = m.oy + box.y * m.scale - pad;
    const width = box.width * m.scale + pad * 2;
    const height = box.height * m.scale + pad * 2;
    return { left, top, width, height };
}

/** Khung DOM bám khuôn mặt + nhãn tên */
function positionFaceTracker(box, match, quality) {
    if (!faceTracker) return;
    const rect = mapFaceBoxToContainer(box);
    if (!rect || rect.width < 20) {
        faceTracker.classList.remove("is-active", "is-matched", "is-near", "is-ready");
        return;
    }
    faceTracker.style.left = rect.left + "px";
    faceTracker.style.top = rect.top + "px";
    faceTracker.style.width = rect.width + "px";
    faceTracker.style.height = rect.height + "px";
    faceTracker.classList.add("is-active");
            faceTracker.classList.toggle("is-matched", !!(match && match.isMatch));
            faceTracker.classList.toggle("is-near", !!(match && match.isNear && !match.isMatch));
            faceTracker.classList.toggle("is-ready", !!(quality && quality.allOk && match && match.isMatch));

    if (faceNameText && faceMetaText) {
        if (match && match.isMatch) {
            faceNameText.textContent = match.record.name;
            faceMetaText.textContent = match.confidence + "% · Sẵn sàng Quét";
        } else if (match && match.isNear) {
            faceNameText.textContent = match.record.name;
            faceMetaText.textContent = match.confidence + "% · Gần khớp, giữ yên mặt";
        } else if (match && match.msvPinned) {
            faceNameText.textContent = match.record.name;
            faceMetaText.textContent = match.confidence + "% · Chưa đủ khớp MSV";
        } else if (countReadyDescriptors() > 0) {
            faceNameText.textContent = "Đang nhận diện...";
            faceMetaText.textContent = quality && quality.allOk ? "Chờ khớp hồ sơ" : "Chỉnh góc & ánh sáng";
        } else {
            faceNameText.textContent = "Đang học CSDL";
            faceMetaText.textContent = countReadyDescriptors() + "/" + knownFaces.length + " hồ sơ";
        }
    }
}

/** Lưới quét + tia scan trên canvas (đồ thị quét khuôn mặt) */
function drawFaceScanGraph(box, matched) {
    if (!overlayCtx || !box) return;
    scanAnimPhase = (scanAnimPhase + 0.04) % 1;
    const pad = 14;
    const x = box.x - pad;
    const y = box.y - pad;
    const w = box.width + pad * 2;
    const h = box.height + pad * 2;
    const r = Math.min(18, w * 0.08, h * 0.08);
    const accent = matched ? [56, 189, 248] : [148, 163, 184];
    const glow = matched ? "rgba(56, 189, 248, 0.55)" : "rgba(255, 255, 255, 0.25)";

    overlayCtx.save();
    overlayCtx.beginPath();
    if (overlayCtx.roundRect) {
        overlayCtx.roundRect(x, y, w, h, r);
    } else {
        overlayCtx.rect(x, y, w, h);
    }
    overlayCtx.clip();

    overlayCtx.strokeStyle = "rgba(" + accent.join(",") + ",0.12)";
    overlayCtx.lineWidth = 1;
    const gridStep = 14;
    for (let gy = y; gy < y + h; gy += gridStep) {
        overlayCtx.beginPath();
        overlayCtx.moveTo(x, gy);
        overlayCtx.lineTo(x + w, gy);
        overlayCtx.stroke();
    }
    for (let gx = x; gx < x + w; gx += gridStep) {
        overlayCtx.beginPath();
        overlayCtx.moveTo(gx, y);
        overlayCtx.lineTo(gx, y + h);
        overlayCtx.stroke();
    }

    const scanY = y + h * scanAnimPhase;
    const grad = overlayCtx.createLinearGradient(x, scanY - 28, x, scanY + 28);
    grad.addColorStop(0, "rgba(56, 189, 248, 0)");
    grad.addColorStop(0.45, matched ? "rgba(56, 189, 248, 0.75)" : "rgba(255, 255, 255, 0.45)");
    grad.addColorStop(0.55, matched ? "rgba(37, 99, 235, 0.85)" : "rgba(255, 255, 255, 0.5)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0)");
    overlayCtx.fillStyle = grad;
    overlayCtx.fillRect(x, scanY - 30, w, 60);

    overlayCtx.strokeStyle = "rgba(" + accent.join(",") + ",0.35)";
    overlayCtx.lineWidth = 1;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const spokes = 8;
    for (let i = 0; i < spokes; i++) {
        const ang = (i / spokes) * Math.PI * 2 + scanAnimPhase * Math.PI * 2;
        const len = Math.min(w, h) * 0.38;
        overlayCtx.beginPath();
        overlayCtx.moveTo(cx, cy);
        overlayCtx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len);
        overlayCtx.stroke();
    }

    overlayCtx.restore();

    overlayCtx.save();
    overlayCtx.shadowColor = glow;
    overlayCtx.shadowBlur = matched ? 16 : 8;
    overlayCtx.strokeStyle = matched ? "rgba(56, 189, 248, 0.9)" : "rgba(255, 255, 255, 0.5)";
    overlayCtx.lineWidth = matched ? 2.5 : 1.5;
    overlayCtx.setLineDash(matched ? [] : [6, 5]);
    overlayCtx.beginPath();
    if (overlayCtx.roundRect) {
        overlayCtx.roundRect(x, y, w, h, r);
    } else {
        overlayCtx.rect(x, y, w, h);
    }
    overlayCtx.stroke();
    overlayCtx.setLineDash([]);
    overlayCtx.restore();
}

function getActiveMsvLast3() {
    return normalizeLast3((msvInputEl && msvInputEl.value.trim()) || "");
}

function findRecordByLast3(last3) {
    if (!last3) return null;
    return knownFaces.find(k =>
        normalizeLast3(k.msv) === last3 || normalizeLast3(k.id) === last3
    ) || null;
}

function distanceToConfidence(dist) {
    if (dist < FACE_THRESHOLD) {
        return Math.min(100, Math.round(70 + ((FACE_THRESHOLD - dist) / FACE_THRESHOLD) * 30));
    }
    if (dist < NEAR_MATCH_THRESHOLD) {
        return Math.max(50, Math.min(69, Math.round(69 - ((dist - FACE_THRESHOLD) / (NEAR_MATCH_THRESHOLD - FACE_THRESHOLD)) * 19)));
    }
    return Math.max(0, Math.min(49, Math.round((1 - dist) * 100)));
}

function compareToRecord(descriptor, record) {
    if (!descriptor || !record || !record.descriptor) return null;
    const distance = faceapi.euclideanDistance(descriptor, record.descriptor);
    return {
        record,
        distance,
        confidence: distanceToConfidence(distance),
        isMatch: distance < FACE_THRESHOLD,
        isNear: distance >= FACE_THRESHOLD && distance < NEAR_MATCH_THRESHOLD
    };
}

/** Lấy descriptor ổn định từ camera (trung bình nhiều khung) */
async function captureDescriptorFromVideo(samples = 3) {
    const descs = [];
    for (let i = 0; i < samples; i++) {
        const det = await faceapi
            .detectSingleFace(video, DETECTOR_OPTS())
            .withFaceLandmarks(true)
            .withFaceDescriptor();
        if (det && det.descriptor) descs.push(det.descriptor);
        if (i < samples - 1) await new Promise(r => setTimeout(r, 90));
    }
    if (!descs.length) return null;
    const avg = new Float32Array(descs[0].length);
    for (const d of descs) {
        for (let i = 0; i < avg.length; i++) avg[i] += d[i];
    }
    for (let i = 0; i < avg.length; i++) avg[i] /= descs.length;
    return avg;
}

function startDetectionLoop() {
    if (detectionRafId) return;
    const detOpts = DETECTOR_OPTS;

    const tick = async (ts) => {
        detectionRafId = requestAnimationFrame(tick);
        if (!modelsLoaded || !video || !video.videoWidth || video.paused || !overlayCtx) return;
        if (ts - lastDetectTs < DETECT_INTERVAL_MS) return;
        lastDetectTs = ts;

        const dets = await faceapi
            .detectAllFaces(video, detOpts())
            .withFaceLandmarks(true)
            .withFaceExpressions();

        const resized = faceapi.resizeResults(dets, { width: video.videoWidth, height: video.videoHeight });
        const primary = resized.length ? resized.reduce((a, b) =>
            (b.detection.box.width * b.detection.box.height) > (a.detection.box.width * a.detection.box.height) ? b : a
        ) : null;

        const now = Date.now();
        if (primary && now - lastMatchTick > MATCH_INTERVAL_MS && countReadyDescriptors() > 0 && !isMatching) {
            lastMatchTick = now;
            isMatching = true;
            try {
                const withDesc = await faceapi
                    .detectSingleFace(video, detOpts())
                    .withFaceLandmarks(true)
                    .withFaceDescriptor();
                if (withDesc && withDesc.descriptor) {
                    currentLiveMatch = findBestLiveMatch(withDesc.descriptor);
                }
            } catch (e) {
                console.warn("Realtime match:", e);
            } finally {
                isMatching = false;
            }
        } else if (!primary) {
            currentLiveMatch = null;
            lastUiSnapshot = "";
        }

        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

        if (primary) {
            camIdle && camIdle.classList.add("d-none");
            scanHud && scanHud.classList.remove("d-none");
            const match = currentLiveMatch;
            const quality = evaluateFaceQuality(primary);
            positionFaceTracker(primary.detection.box, match, quality);
            drawFaceScanGraph(primary.detection.box, !!(match && match.isMatch));
            updateScanHud(primary, match, quality);
            updateLiveStatus(primary, match, quality);
        } else {
            camIdle && camIdle.classList.remove("d-none");
            faceTracker && faceTracker.classList.remove("is-active", "is-matched", "is-near", "is-ready");
            scanHud && scanHud.classList.add("d-none");
            currentLiveMatch = null;
            updateLiveStatus(null, null, null);
        }
    };

    detectionRafId = requestAnimationFrame(tick);
}

// =====================================================
// 4. PANEL TRẠNG THÁI REALTIME (bên phải)
// =====================================================
function getFaceBrightness(box) {
    try {
        const tmp = document.createElement("canvas");
        tmp.width = tmp.height = 32;
        const tc = tmp.getContext("2d");
        tc.drawImage(video, Math.max(0,box.x), Math.max(0,box.y),
            Math.min(box.width, video.videoWidth), Math.min(box.height, video.videoHeight), 0, 0, 32, 32);
        const px = tc.getImageData(0,0,32,32).data;
        let s = 0;
        for (let i=0; i<px.length; i+=4) s += px[i]*0.299 + px[i+1]*0.587 + px[i+2]*0.114;
        return s/(32*32);
    } catch { return 128; }
}

function evaluateFaceQuality(det) {
    const box = det.detection.box;
    const brightness = getFaceBrightness(box);
    const centerX = box.x + box.width / 2;
    const offsetRatio = Math.abs(centerX - video.videoWidth / 2) / (video.videoWidth / 2);
    const lightOk = brightness >= 45 && brightness <= 215;
    const angleOk = offsetRatio <= 0.35;
    const sizeOk = box.width >= 80;
    return { brightness, lightOk, angleOk, sizeOk, allOk: lightOk && angleOk && sizeOk, topExp: Object.entries(det.expressions).sort((a, b) => b[1] - a[1])[0] };
}

function updateLiveStatus(det, match, quality) {
    if (!det || !quality) {
        const html = `
            <div class="attendance-ai-insight warn"><i class="fa-regular fa-face-meh"></i> Chưa thấy khuôn mặt</div>
            <div class="attendance-ai-insight muted">Nhìn thẳng camera, đủ ánh sáng</div>`;
        if (typeof AttendanceUiThrottle !== "undefined") AttendanceUiThrottle.setLiveStatusHtml(html);
        else document.getElementById("liveStatus").innerHTML = html;
        return;
    }
    const ready = countReadyDescriptors();
    const total = knownFaces.length;
    const snap = [
        match ? match.record.name : "",
        match ? match.confidence : 0,
        quality.allOk,
        quality.lightOk,
        quality.angleOk,
        ready,
        total
    ].join("|");
    if (snap === lastUiSnapshot) return;
    lastUiSnapshot = snap;

    const msv3 = getActiveMsvLast3();
    let nameLine;
    if (match && match.isMatch) {
        nameLine = `<div class="attendance-ai-insight ok"><i class="fa-solid fa-user-check"></i> <b>${match.record.name}</b> · ${match.confidence}% — có thể Quét</div>`;
    } else if (match && match.isNear) {
        nameLine = `<div class="attendance-ai-insight warn"><i class="fa-solid fa-user-pen"></i> <b>${match.record.name}</b> · ${match.confidence}% gần khớp — giữ yên mặt</div>`;
    } else if (match && match.msvPinned) {
        nameLine = `<div class="attendance-ai-insight warn"><i class="fa-solid fa-id-card"></i> MSV ...${msv3}: <b>${match.record.name}</b> · ${match.confidence}% — chưa đủ khớp</div>`;
    } else if (msv3 && findRecordByLast3(msv3)) {
        nameLine = `<div class="attendance-ai-insight warn"><i class="fa-solid fa-id-card"></i> MSV ...${msv3}: nhìn thẳng camera để đối chiếu</div>`;
    } else {
        nameLine = `<div class="attendance-ai-insight warn"><i class="fa-solid fa-user-clock"></i> ${ready ? "Nhập MSV hoặc chỉnh góc/ánh sáng" : `Đang học CSDL (${ready}/${total})`}</div>`;
    }

    const html = `
        ${nameLine}
        <div class="attendance-ai-insight ${quality.allOk ? "ok" : "warn"}">
            <i class="fa-solid fa-${quality.allOk ? "circle-check" : "triangle-exclamation"}"></i>
            ${quality.allOk ? "Sẵn sàng quét điểm danh" : "Điều chỉnh tư thế trước khi quét"}
        </div>
        <div class="attendance-ai-insight muted">
            <i class="fa-regular fa-face-smile"></i> ${emotionVI(quality.topExp[0])} ·
            <i class="fa-solid fa-sun ms-1"></i> ${quality.lightOk ? "ánh sáng OK" : "ánh sáng chưa ổn"} ·
            <i class="fa-solid fa-crosshairs ms-1"></i> ${quality.angleOk ? "góc OK" : "góc lệch"}
        </div>`;
    if (typeof AttendanceUiThrottle !== "undefined") AttendanceUiThrottle.setLiveStatusHtml(html);
    else document.getElementById("liveStatus").innerHTML = html;
}

function updateScanHud(det, match, quality) {
    if (!scanHud || !det || !quality) return;
    const timeStr = getTime();
    const session = typeof AttendancePunctuality !== "undefined"
        ? AttendancePunctuality.getWorkSession()
        : (new Date().getHours() < 12 ? "Sáng" : "Chiều");
    const msvSuffix = getMsvSuffixDisplay();
    const hudKey = [timeStr.slice(-8), session, msvSuffix, match && match.record.name, match && match.confidence, quality.allOk].join("|");
    if (typeof AttendanceUiThrottle !== "undefined" && !AttendanceUiThrottle.shouldUpdateHud(hudKey)) return;

    if (hudTime) hudTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeStr}`;
    if (hudLocation) hudLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cachedLocation}`;
    if (hudSession) hudSession.innerHTML = `<i class="fa-regular fa-calendar"></i> ${session} · MSV: ${msvSuffix}`;

    if (qualityBadge) {
        qualityBadge.textContent = quality.allOk ? "✔ Chất lượng tốt" : "⚠ Cần chỉnh tư thế";
        qualityBadge.className = "attendance-quality-badge" + (quality.allOk ? "" : quality.lightOk && quality.sizeOk ? " warn" : " bad");
    }

    if (hudPerson) {
        if (match && match.isMatch) {
            hudPerson.innerHTML = `<i class="fa-solid fa-user-check"></i> ${match.record.name} · ${match.confidence}% · OK Quét`;
        } else if (match && (match.isNear || match.msvPinned)) {
            hudPerson.innerHTML = `<i class="fa-solid fa-user-pen"></i> ${match.record.name} · ${match.confidence}% · căn chỉnh thêm`;
        } else if (countReadyDescriptors() > 0) {
            hudPerson.innerHTML = '<i class="fa-solid fa-user-clock"></i> Chưa nhận ra · nhìn thẳng camera';
        } else {
            hudPerson.innerHTML = `<i class="fa-solid fa-database"></i> AI học CSDL (${countReadyDescriptors()}/${knownFaces.length})...`;
        }
    }
}

/** Live: ưu tiên hồ sơ trùng MSV đã nhập, cùng ngưỡng với nút Quét */
function findBestLiveMatch(descriptor) {
    const last3 = getActiveMsvLast3();
    if (last3) {
        const pinned = findRecordByLast3(last3);
        if (pinned && pinned.descriptor) {
            const cmp = compareToRecord(descriptor, pinned);
            if (cmp) return { ...cmp, msvPinned: true };
        }
    }

    let best = null;
    let bestDist = Infinity;
    for (const rec of knownFaces) {
        if (!rec.descriptor) continue;
        const d = faceapi.euclideanDistance(descriptor, rec.descriptor);
        if (d < bestDist) {
            bestDist = d;
            best = rec;
        }
    }
    if (!best || bestDist >= NEAR_MATCH_THRESHOLD) return null;
    const cmp = compareToRecord(descriptor, best);
    return cmp ? { ...cmp, msvPinned: false } : null;
}

function countReadyDescriptors() {
    return knownFaces.filter(k => k.descriptor).length;
}

function getMsvSuffixDisplay() {
    const v = (msvInputEl && msvInputEl.value.trim()) || "";
    if (v) return "..." + normalizeLast3(v);
    if (currentLiveMatch && currentLiveMatch.record.msv) {
        return "..." + normalizeLast3(currentLiveMatch.record.msv);
    }
    return "...---";
}

function setCamState(state, text) {
    if (camDot) camDot.className = "attendance-dot " + state;
    if (camStatus && text) camStatus.textContent = text;
}

function startHudClock() {
    const tick = () => {
        if (hudTime && scanHud && !scanHud.classList.contains("d-none")) {
            hudTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${getTime()}`;
        }
    };
    tick();
    setInterval(tick, 1000);
}

async function refreshCachedLocation() {
    cachedLocation = await getLocation();
    if (hudLocation) hudLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cachedLocation}`;
}

async function preloadDescriptorsInBackground() {
    if (preloadRunning || !PRELOAD_DESCRIPTORS) return;
    preloadRunning = true;
    const total = knownFaces.length;
    for (let i = 0; i < total; i += PRELOAD_BATCH) {
        const batch = knownFaces.slice(i, i + PRELOAD_BATCH);
        await Promise.all(batch.map(async (rec) => {
            if (!rec.descriptor) {
                await getDescriptorFromRecord(rec).catch(() => null);
            }
        }));
        descriptorsReady = countReadyDescriptors();
        updateKnownCountLabel();
        await new Promise(r => setTimeout(r, 40));
    }
    preloadRunning = false;
    descriptorsReady = countReadyDescriptors();
    updateKnownCountLabel();
}

function updateKnownCountLabel() {
    const el = document.getElementById("knownCount");
    if (!el) return;
    const total = knownFaces.length;
    const ready = countReadyDescriptors();
    if (preloadRunning) {
        el.innerHTML = `<i class="fa-solid fa-database"></i> CSDL: ${ready}/${total} · đang học AI...`;
    } else if (ready > 0) {
        el.innerHTML = `<i class="fa-solid fa-database"></i> ${total} hồ sơ · AI nhận diện ${ready}`;
    } else if (total > 0) {
        el.innerHTML = `<i class="fa-solid fa-database"></i> ${total} hồ sơ CSDL`;
    }
}

// =====================================================
// 5. LOAD KNOWN FACES TỪ SHEET2
// Sheet2 cột: A=STT | B=MSV | C=TênSV | D=FACE_URL | E=ID
// =====================================================
async function loadKnownFaces() {
    try {
        knownFacesLoaded = false;
        const countEl = document.getElementById("knownCount");
        if (countEl) countEl.textContent = "Đang tải CSDL...";
        // Ưu tiên lấy Sheet2; nếu Apps Script chưa hỗ trợ sheet param thì fallback Sheet1
        let data = [];
        try {
            const res2 = await fetch(FACE_API_URL + "?sheet=" + encodeURIComponent(STUDENT_SHEET));
            data = await res2.json();
        } catch {
            data = [];
        }
        if (!Array.isArray(data) || data.length === 0) {
            try {
                const res1 = await fetch(FACE_API_URL);
                data = await res1.json();
            } catch {
                data = [];
            }
        }
        knownFaces = [];
        let totalProfiles = 0;

        const rows = Array.isArray(data) ? data : [];

        // Nhận diện schema:
        // - Sheet2: [STT, MSV, TênSV, FACE_URL/filename, ID]
        // - Sheet1: [FaceID, Image(URL), Time, Location, Session, Status, Name]
        const isLikelySheet2 = rows.some(r =>
            Array.isArray(r) &&
            r.length >= 4 &&
            /\d{6,}/.test((r[1] || "").toString()) &&
            (r[2] || "").toString().trim() !== ""
        );

        for (const row of rows) {
            if (!Array.isArray(row)) continue;

            let msv = "";
            let id = "";
            let name = "";
            let faceUrl = "";

            if (isLikelySheet2) {
                // Sheet2 format
                msv = (row[1] || "").toString().trim();
                name = (row[2] || "").toString().trim();
                faceUrl = (row[3] || "").toString().trim();
                id = (row[4] || "").toString().trim();
            } else {
                // Sheet1 format fallback
                msv = "";
                name = (row[6] || "").toString().trim();
                faceUrl = (row[1] || "").toString().trim();
                id = "";
            }

            // Bỏ các dòng header/rác và URL không hợp lệ
            if (!name || !faceUrl) continue;
            if (!/^https?:\/\//i.test(faceUrl) && !/^data:image\//i.test(faceUrl)) continue;
            knownFaces.push({ msv, id, name, faceUrl, descriptor: null });
            totalProfiles++;
            if (countEl) countEl.innerHTML = `<i class="fa-solid fa-database"></i> Đang tải... ${totalProfiles}`;
        }

        knownFacesLoaded = true;
        updateKnownCountLabel();
        console.log(`✅ Loaded ${totalProfiles} profiles from CSDL`);
        if (PRELOAD_DESCRIPTORS && totalProfiles > 0) {
            preloadDescriptorsInBackground();
        }
    } catch (err) {
        console.warn("Không load được CSDL:", err);
        const el = document.getElementById("knownCount");
        if (el) el.textContent = "Không kết nối được CSDL";
        knownFacesLoaded = false;
    }
}

// =====================================================
// 6. SCAN FACE — SO SÁNH + GHI SHEET1
// Sheet1 ghi theo thứ tự: FaceID | Image | Time | Location | Session | Status | Name
// =====================================================
async function scanFace() {
    const msv = document.getElementById("msvInput").value.trim();
    if (!msv)              { showResult("error","⚠️","Thiếu MSV","Nhập 3 số cuối mã sinh viên."); return; }
    if (!modelsLoaded)     { showResult("error","⏳","Chưa sẵn sàng","Model AI đang tải, vui lòng đợi."); return; }
    if (!video.videoWidth) { showResult("error","📷","Camera chưa sẵn sàng","Cấp quyền camera."); return; }

    document.getElementById("scanSound")?.play().catch(()=>{});
    scanBtn.disabled = true;
    scanBtn.innerHTML = `<span class="spin">⏳</span> Đang xử lý AI...`;
    setCamState("scanning", "Đang quét...");

    try {
        // Đảm bảo có CSDL ảnh gốc để AI so sánh trước khi quét
        if (!knownFacesLoaded || knownFaces.length === 0) {
            await loadKnownFaces();
        }
        if (knownFaces.length === 0) {
            showResult("error", "📚", "Chưa có dữ liệu CSDL", "Không tìm thấy hồ sơ trong Sheet2 để đối chiếu.");
            resetBtn(); return;
        }

        // ── A. CHỤP FRAME (ảnh lưu Sheet) ──
        const snap = document.createElement("canvas");
        snap.width = video.videoWidth; snap.height = video.videoHeight;
        snap.getContext("2d").drawImage(video, 0, 0);

        // ── B. DETECT trên camera (cùng cấu hình với live) + trung bình nhiều khung ──
        let det = await faceapi
            .detectSingleFace(video, DETECTOR_OPTS())
            .withFaceLandmarks(true)
            .withFaceDescriptor()
            .withFaceExpressions();

        const averagedDescriptor = await captureDescriptorFromVideo(4);

        if (!det && !averagedDescriptor) {
            det = await faceapi
                .detectSingleFace(snap, DETECTOR_OPTS())
                .withFaceLandmarks(true)
                .withFaceDescriptor()
                .withFaceExpressions();
        }

        if (!det && averagedDescriptor) {
            det = await faceapi
                .detectSingleFace(video, DETECTOR_OPTS())
                .withFaceLandmarks(true)
                .withFaceExpressions();
        }

        if (!det) {
            showResult("error","😶","Không phát hiện khuôn mặt","Nhìn thẳng, đảm bảo đủ ánh sáng.");
            resetBtn(); return;
        }

        // ── C. ĐÁNH GIÁ TRẠNG THÁI ──
        const box         = det.detection.box;
        const brightness  = getFaceBrightness(box);
        const offsetRatio = Math.abs((box.x+box.width/2) - snap.width/2) / (snap.width/2);
        const topExp      = Object.entries(det.expressions).sort((a,b)=>b[1]-a[1])[0];
        const lightOk     = brightness >= 45 && brightness <= 215;
        const angleOk     = offsetRatio <= 0.35;
        const sizeOk      = box.width >= 80;
        const qualityOk   = lightOk && angleOk && sizeOk;

        // ── D. TRA CỨU ĐÚNG HỒ SƠ THEO 3 SỐ CUỐI MSV/ID ──
        const inputLast3 = normalizeLast3(msv);
        const targetRecord = findRecordByLast3(inputLast3);

        if (!targetRecord) {
            showResult("warning", "📋", `MSV ...${msv} chưa có trong CSDL`, "Không tìm thấy hồ sơ trùng 3 số cuối MSV/ID trong Sheet2.");
            resetBtn(); return;
        }

        const targetDescriptor = await getDescriptorFromRecord(targetRecord);
        if (!targetDescriptor) {
            showResult("error", "🖼️", "Không đọc được ảnh FACE gốc", `Hồ sơ ${targetRecord.name} có link FACE không hợp lệ hoặc chưa cấp quyền Drive.`);
            resetBtn(); return;
        }

        // ── E. SO SÁNH 1-1 (cùng descriptor CSDL + nhiều mẫu camera) ──
        const distances = [];
        if (det.descriptor && targetDescriptor) {
            distances.push(faceapi.euclideanDistance(det.descriptor, targetDescriptor));
        }
        if (averagedDescriptor && targetDescriptor) {
            distances.push(faceapi.euclideanDistance(averagedDescriptor, targetDescriptor));
        }
        if (currentLiveMatch && currentLiveMatch.record === targetRecord && Number.isFinite(currentLiveMatch.distance)) {
            distances.push(currentLiveMatch.distance);
        }

        const distance = distances.length ? Math.min(...distances) : Infinity;
        const bestMatch = {
            name: targetRecord.name,
            msv: targetRecord.msv,
            id: targetRecord.id,
            distance
        };
        const isMatch = distance < FACE_THRESHOLD;
        const confidence = distanceToConfidence(distance);

        // ── G. LẤY INFO ──
        const time     = getTime();
        const location = await getLocation();
        const session  = typeof AttendancePunctuality !== "undefined"
            ? AttendancePunctuality.getWorkSession()
            : (new Date().getHours() < 12 ? "Sáng" : "Chiều");
        const punctual = typeof AttendancePunctuality !== "undefined"
            ? AttendancePunctuality.getPunctualStatus(time, session)
            : { sheetStatus: isMatch ? "🟢 Kịp" : "🟠 Trễ" };

        // ── H. TẠO ẢNH CÓ WATERMARK (đúng chiều, không bị ngược) ──
        const size   = Math.min(snap.width, snap.height);
        const sq     = document.createElement("canvas");
        sq.width = sq.height = size;
        const sqc = sq.getContext("2d");

        // Flip ngang để ảnh đúng chiều (camera front bị ngược raw)
        sqc.save();
        sqc.translate(size, 0); sqc.scale(-1, 1);
        sqc.drawImage(snap, (snap.width-size)/2, (snap.height-size)/2, size, size, 0, 0, size, size);
        sqc.restore();

        // Watermark bar
        sqc.fillStyle = "rgba(0,0,0,0.68)";
        sqc.fillRect(0, size-108, size, 108);

        sqc.fillStyle = "#ffffff";
        sqc.font = "bold 15px 'Courier New', monospace";
        sqc.fillText(`⏰ ${time}`, 14, size-86);
        sqc.fillText(`📍 ${location}`, 14, size-64);
        sqc.fillText(`📅 ${session} | MSV: ...${msv}`, 14, size-42);
        sqc.fillText(`👤 ${isMatch ? bestMatch.name : "Chưa nhận ra"} | ${confidence}%`, 14, size-18);

        // Badge chất lượng
        sqc.fillStyle = qualityOk ? "rgba(22,163,74,0.92)" : "rgba(217,119,6,0.92)";
        sqc.fillRect(size-170, size-108, 170, 32);
        sqc.fillStyle = "#fff"; sqc.font = "bold 12px monospace";
        sqc.fillText(qualityOk ? "✅ Chất lượng tốt" : "⚠️ Chất lượng thấp", size-166, size-86);

        const imgBase64 = sq.toDataURL("image/jpeg", 0.88);

        // ── I. TẠO CUSTOM ID ──
        const n = new Date();
        const customID = `${ID_PREFIX}-${p(n.getDate())}${p(n.getMonth()+1)}${String(n.getFullYear()).slice(-2)}${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;

        // ── J. GỬI LÊN SHEET1 (đúng thứ tự cột) ──
        // Apps Script nhận: faceID | image | time | location | session | status | name
        const fd = new FormData();
        fd.append("faceID",      customID);
        fd.append("image",       imgBase64);          // Apps Script lưu lên Drive rồi ghi URL vào Sheet1 cột B
        fd.append("time",        time);
        fd.append("location",    location);
        fd.append("session",     session);
        fd.append("status", isMatch ? punctual.sheetStatus : "⚠ Không khớp");
        fd.append("name",        bestMatch.name || `MSV-${msv}`);  // cột G = Name
        // Extra info (Apps Script có thể bỏ qua nếu không dùng)
        fd.append("msvLast3",    msv);
        fd.append("matchedMsv",  bestMatch.msv || "");
        fd.append("compareMode", "MSV_ID_EXACT");
        fd.append("confidence",  confidence + "%");
        fd.append("matched",     isMatch ? "true" : "false");
        fd.append("distance",    bestMatch.distance === Infinity ? "N/A" : bestMatch.distance.toFixed(4));
        fd.append("emotion",     emotionVI(topExp[0]) + " (" + (topExp[1]*100).toFixed(0) + "%)");
        fd.append("quality",     qualityOk ? "Tốt" : "Thấp");

        const apiRes  = await fetch(FACE_API_URL, { method: "POST", body: fd });
        const apiData = await apiRes.json().catch(() => ({}));

        // ── K. HIỂN THỊ KẾT QUẢ ──
        const nameDisplay  = bestMatch.name || (apiData.name || `MSV ...${msv}`);
        const emoLine      = `${emojiMap(topExp[0])} Cảm xúc: ${emotionVI(topExp[0])} (${(topExp[1]*100).toFixed(0)}%)`;
        const qualLine     = [
            lightOk  ? "💡 Ánh sáng tốt" : "💡 Ánh sáng kém",
            angleOk  ? "📐 Góc đúng"     : "📐 Góc lệch",
            sizeOk   ? "📏 Khoảng cách OK":"📏 Quá xa"
        ].join("  |  ");

        if (isMatch) {
            showResult("success", "✅",
                `Xin chào, ${nameDisplay}!`,
                `🎯 Độ khớp khuôn mặt: ${confidence}%\n🕒 ${time}\n📍 ${location}\n📅 Buổi ${session}\n${emoLine}\n${qualLine}\n✔ Đã lưu vào hệ thống`);
        } else {
            const tip = confidence >= 50
                ? "Gần khớp — giữ yên mặt 2–3 giây đến khi camera ≥70% (khung xanh) rồi Quét lại."
                : "Kiểm tra MSV, ánh sáng và ảnh FACE gốc trên Sheet2.";
            showResult("warning", "📋",
                `MSV: ...${msv} chưa đủ khớp (${confidence}%)`,
                `⚠️ Hồ sơ: ${nameDisplay}\n💡 ${tip}\n🕒 ${time}\n📍 ${location}\n📅 Buổi ${session}\n${emoLine}\n${qualLine}\n✔ Đã lưu vào hệ thống`);
        }

        setCamState("granted", "Điểm danh xong");

    } catch (err) {
        console.error(err);
        showResult("error", "❌", "Lỗi hệ thống", err.message);
        setCamState("live", "Camera đang chạy");
    }

    resetBtn();
}

// =====================================================
// HELPERS
// =====================================================
function p(n) { return String(n).padStart(2, '0'); }
function normalizeLast3(v) {
    const digits = (v || "").toString().replace(/\D/g, "");
    return digits.slice(-3);
}
function buildFaceImageCandidates(rawUrl) {
    const u = (rawUrl || "").toString().trim();
    if (!u) return [];
    if (/^data:image\//i.test(u)) return [u];

    const out = [u];

    // Hỗ trợ link Google Drive thường gặp:
    // - https://drive.google.com/file/d/FILE_ID/view
    // - https://drive.google.com/open?id=FILE_ID
    // - https://drive.google.com/uc?id=FILE_ID
    const idMatch = u.match(/\/file\/d\/([^/]+)/i)
        || u.match(/[?&]id=([^&]+)/i)
        || u.match(/\/d\/([^/]+)/i);
    const fileId = idMatch ? idMatch[1] : "";

    if (fileId) {
        out.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`);
        out.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
        out.push(`https://lh3.googleusercontent.com/d/${fileId}=s1000`);
    }

    return [...new Set(out)];
}
function extractDriveFileId(url) {
    const u = (url || "").toString();
    const idMatch = u.match(/\/file\/d\/([^/]+)/i)
        || u.match(/[?&]id=([^&]+)/i)
        || u.match(/\/d\/([^/]+)/i);
    return idMatch ? idMatch[1] : "";
}
function isGoogleDriveUrl(url) {
    return /drive\.google\.com/i.test((url || "").toString());
}
async function getDescriptorFromRecord(record) {
    if (!record || !record.faceUrl) return null;
    if (record.descriptor) return record.descriptor;

    let img = null;
    const isDrive = isGoogleDriveUrl(record.faceUrl);

    // Link Drive: lấy qua proxy API để tránh CORS
    if (isDrive) {
        const fid = extractDriveFileId(record.faceUrl);
        if (fid) {
            const dataUrl = await fetchFaceDataUrlViaApi(fid);
            if (dataUrl) img = await faceapi.fetchImage(dataUrl).catch(() => null);
        }
    }

    // Link không phải Drive: thử trực tiếp
    if (!img) {
        const candidates = buildFaceImageCandidates(record.faceUrl);
        for (const candidateUrl of candidates) {
            img = await faceapi.fetchImage(candidateUrl).catch(() => null);
            if (img) break;
        }
    }
    if (!img) return null;

    const det = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    if (!det) return null;

    record.descriptor = det.descriptor; // cache để lần sau nhanh hơn
    return det.descriptor;
}
async function fetchFaceDataUrlViaApi(fileId) {
    try {
        const u = `${FACE_API_URL}?proxyImage=1&id=${encodeURIComponent(fileId)}`;
        const r = await fetch(u);
        const j = await r.json().catch(() => null);
        if (j && j.success && /^data:image\//i.test(j.dataUrl || "")) return j.dataUrl;
    } catch {}
    return null;
}

function resetBtn() {
    if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = `<i class="fa-solid fa-face-smile me-1"></i> Quét khuôn mặt`;
    }
    if (!camDot || !String(camDot.className).includes("granted")) {
        setCamState("live", "Camera đang chạy");
    }
}

function showResult(type, icon, title, msg) {
    const box = document.getElementById("resultBox");
    if (!box) return;
    box.className = `attendance-result-box ${type}`;
    box.style.display = "block";
    document.getElementById("resultIcon").textContent = icon;
    document.getElementById("resultName").textContent = title;
    const m = document.getElementById("resultMeta");
    m.style.whiteSpace = "pre-line";
    m.textContent = msg;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getTime() {
    return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
}

async function getLocation() {
    try {
        const pos = await new Promise((r,j) =>
            navigator.geolocation.getCurrentPosition(r, j, { timeout: 5000 }));
        const d = await (await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        )).json();
        return d.address.suburb || d.address.city_district || d.address.county || "DNU";
    } catch { return "Dai Nam University"; }
}

function emojiMap(e) {
    return {happy:"😊",sad:"😢",angry:"😠",surprised:"😮",neutral:"😐",fearful:"😨",disgusted:"🤢"}[e] || "😐";
}
function emotionVI(e) {
    return {happy:"Vui vẻ",sad:"Buồn",angry:"Tức giận",surprised:"Ngạc nhiên",neutral:"Bình thường",fearful:"Sợ hãi",disgusted:"Khó chịu"}[e] || "Bình thường";
}

// =====================================================
// INIT
// =====================================================
(async function init() {
    await startCamera();
    await new Promise(r => { const c = () => typeof faceapi !== "undefined" ? r() : setTimeout(c, 150); c(); });
    await loadModels();
    loadKnownFaces();
    if (msvInputEl) {
        msvInputEl.addEventListener("input", () => {
            currentLiveMatch = null;
            lastUiSnapshot = "";
            if (typeof AttendanceUiThrottle !== "undefined") AttendanceUiThrottle.reset();
            if (scanHud && !scanHud.classList.contains("d-none") && hudSession) {
                const session = new Date().getHours() < 12 ? "Sáng" : "Chiều";
                hudSession.innerHTML = `<i class="fa-regular fa-calendar"></i> ${session} · MSV: ${getMsvSuffixDisplay()}`;
            }
        });
    }
    window.addEventListener("resize", () => {
        if (faceTracker && faceTracker.classList.contains("is-active")) {
            faceTracker.classList.remove("is-active");
        }
    });
})();
