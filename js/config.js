
// ==== PATH RESOLUTION LOGIC ====
const IS_HTML_DIR = window.location.pathname.indexOf('/html/') !== -1;
const ROOT_PATH = IS_HTML_DIR ? '../' : './';
const HTML_PATH = IS_HTML_DIR ? './' : 'html/';
window.SH_ROOT = ROOT_PATH;
window.SH_HTML = HTML_PATH;

/**
 * ScholarHub - Cấu hình MockAPI
 */
const SCHOLARHUB_CONFIG = {
    LOGO: window.SH_ROOT + "logo.png",
    SITE_NAME: "ScholarHub",
    API_BASE: "https://69fbe7b0fce564e25916fdc3.mockapi.io/api/v1",
    ENDPOINTS: {
        documents: "documents",
        /** MockAPI project: resource "subjects" đang chứa user (ho_ten, email) */
        users: "subjects",
        subjects: "subjects"
    },
    DOC_STATUS: {
        PENDING: "Pending",
        APPROVED: "Approved"
    },
    DOC_TYPES: ["Đề thi", "Slide bài giảng", "Ghi chép", "Tài liệu tham khảo"],
    STORAGE_KEYS: {
        favorites: "scholarhub_favorites",
        user: "scholarhub_user",
        purchased: "scholarhub_purchased"
    },
    DEFAULT_AVATARS: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Cheese",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=George"
    ],
    EXAM_COUNTDOWN: "2026-06-15T08:00:00",
    NEW_USER_XU: 50,
    UPLOAD_REWARD_XU: 10,
    /** Google Apps Script — điểm danh Face ID (EduAttend) */
    ATTENDANCE: {
        API_URL: "https://script.google.com/macros/s/AKfycbziGyVEP3Syw_HK6aVCpkCkFSVjhjTSeVLqAEkKD7x7x9JkRUciWmzIQT_6dycv5wN_5w/exec",
        /** CDN — không cần tải thư mục model về máy (theo README EduAttend) */
        MODEL_URL: "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model",
        /** Ngưỡng khớp chính thức (live + nút Quét dùng chung) */
        FACE_THRESHOLD: 0.55,
        /** Chỉ gợi ý "gần khớp" trên camera, không coi là đã khớp */
        NEAR_MATCH_THRESHOLD: 0.62,
        ID_PREFIX: "IT1907",
        /** Tải descriptor CSDL nền để nhận diện tên realtime */
        PRELOAD_DESCRIPTORS: true,
        PRELOAD_BATCH_SIZE: 4,
        /** Sheet2: STT | MSV | Tên SV | FACE | ID — CSDL khuôn mặt sinh viên */
        STUDENT_SHEET: "2",
        DRIVE_FOLDER_ID: "1qKKWlsx2vFdxVodKe9cWNoBWoZ6P6aSV"
    }
};
