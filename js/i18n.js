const I18N = {
    vi: {
        "nav_home": "Trang chủ",
        "nav_documents": "Tài liệu",
        "nav_subjects": "Môn học",
        "nav_vip": "Tài liệu VIP",
        "nav_premium": "Tài liệu VIP",
        "nav_upload": "Đăng tải",
        "nav_favorites": "Yêu thích",
        "nav_attendance": "Điểm danh",
        
        "sidebar_docs": "Kho tài liệu",
        "sidebar_documents": "Kho tài liệu",
        "sidebar_subjects": "Môn học",
        "sidebar_premium": "Tài liệu trả phí",
        "sidebar_upload": "Đóng góp TL",
        "sidebar_favorites": "Yêu thích",
        "sidebar_profile": "Hồ sơ cá nhân",
        "sidebar_leaderboard": "Bảng xếp hạng",
        "sidebar_wallet": "Nạp xu",
        "sidebar_attendance": "Điểm danh Face ID",

        "btn_login": "Đăng nhập",
        "btn_register": "Đăng ký",
        "btn_logout": "Đăng xuất",
        
        "rightbar_exam": "Đếm ngược kỳ thi",
        "rightbar_days": "Ngày",
        "rightbar_hours": "Giờ",
        "rightbar_mins": "Phút",
        "rightbar_secs": "Giây",
        "rightbar_consult": "Nhận tư vấn miễn phí",
        "rightbar_name": "Họ tên",
        "rightbar_phone": "Số điện thoại",
        "rightbar_send": "Gửi yêu cầu",
        "rightbar_leaderboard": "Bảng xếp hạng",
        "lb_week": "Tuần",
        "lb_month": "Tháng"
    },
    en: {
        "nav_home": "Home",
        "nav_documents": "Documents",
        "nav_subjects": "Subjects",
        "nav_vip": "VIP Docs",
        "nav_premium": "VIP Docs",
        "nav_upload": "Upload",
        "nav_favorites": "Favorites",
        "nav_attendance": "Attendance",
        
        "sidebar_docs": "Document Library",
        "sidebar_documents": "Document Library",
        "sidebar_subjects": "Subjects",
        "sidebar_premium": "Premium Docs",
        "sidebar_upload": "Upload",
        "sidebar_favorites": "Favorites",
        "sidebar_profile": "My Profile",
        "sidebar_leaderboard": "Leaderboard",
        "sidebar_wallet": "Add Coins",
        "sidebar_attendance": "Face ID Attendance",

        "btn_login": "Login",
        "btn_register": "Register",
        "btn_logout": "Logout",
        
        "rightbar_exam": "Exam Countdown",
        "rightbar_days": "Days",
        "rightbar_hours": "Hours",
        "rightbar_mins": "Mins",
        "rightbar_secs": "Secs",
        "rightbar_consult": "Free Consultation",
        "rightbar_name": "Full Name",
        "rightbar_phone": "Phone Number",
        "rightbar_send": "Send Request",
        "rightbar_leaderboard": "Leaderboard",
        "lb_week": "Week",
        "lb_month": "Month"
    }
};

function getCurrentLang() {
    return localStorage.getItem('scholarhub_lang') || 'vi';
}

function setLanguage(lang) {
    if (lang === 'vi' || lang === 'en') {
        localStorage.setItem('scholarhub_lang', lang);
        window.location.reload();
    }
}

function t(key) {
    const lang = getCurrentLang();
    return I18N[lang] && I18N[lang][key] ? I18N[lang][key] : (I18N['vi'][key] || key);
}
