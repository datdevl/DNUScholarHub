/**
 * ScholarHub - Cấu hình MockAPI
 */
const SCHOLARHUB_CONFIG = {
    LOGO: "logo.png",
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
    UPLOAD_REWARD_XU: 10
};
