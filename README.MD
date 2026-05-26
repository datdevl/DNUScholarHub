# 📚 ScholarHub

**ScholarHub** — Nền tảng chia sẻ và tìm kiếm tài liệu học tập trực tuyến cho sinh viên Đại học Đại Nam.

## ✨ Tính năng

### 🌐 Public (Sinh viên)

- Tìm tài liệu, lọc theo **môn học**, **năm học**, **loại tài liệu**
- Xem mô tả, link download, đánh giá sao
- Đánh dấu **yêu thích** (localStorage)
- Đăng tải tài liệu (trạng thái `Pending` chờ duyệt)
- Đếm **lượt xem** bằng `PUT` API

### ⚙️ Admin

- Thêm / sửa / xóa tài liệu & môn học
- Duyệt tài liệu: `Pending` → `Approved`
- Thống kê lượt xem, lượt tải, top tài liệu

## 🛠 Tech Stack

| # | Công nghệ | Đã áp dụng |
|---|-----------|------------|
| 1 | JavaScript thuần | Biến, if/for, hàm có tham số & return, DOM events, querySelector |
| 2 | Fetch API | GET/POST/PUT/DELETE, `.then`/`.catch`, skeleton loading, xử lý lỗi |
| 3 | Form Validation | Required, URL, inline error, chặn submit, reset form |
| 4 | jQuery | Selector, `.on()`, fadeIn/slideDown, `$.ajax()` |
| 5 | Bootstrap 5 | Grid, Navbar, Card, Modal, Badge, Toast, Table, Form |
| 6 | MockAPI.io | `documents`, `subjects`, `nguoi_dung` |
| 7 | Vercel | Deploy từ GitHub (xem hướng dẫn bên dưới) |

## 📁 Cấu trúc

```
├── index.html          # Trang chủ
├── documents.html      # Kho tài liệu + lọc
├── subjects.html       # Danh mục môn học
├── favorites.html      # Yêu thích
├── upload.html         # Đăng tải
├── login.html          # Đăng nhập demo
├── about.html          # Giới thiệu
├── admin.html          # Quản trị
├── css/scholarhub.css
└── js/
    ├── config.js       # MockAPI URL
    ├── api.js          # CRUD Fetch
    ├── utils.js        # Toast, validation, favorites
    ├── components.js   # Card, modal chi tiết
    ├── jquery-ui.js    # Hiệu ứng jQuery
    └── ...
```

## 🔗 MockAPI

**Base URL:** `https://69fbe7b0fce564e25916fdc3.mockapi.io/api/v1`

| Resource | Endpoint | Mô tả |
|----------|----------|--------|
| Tài liệu | `/documents` | `tieu_de`, `id_mon_hoc`, `loai_tai_lieu`, `trang_thai`, `nam_hoc`, `so_luot_xem`, ... |
| Môn học | `/subjects` | `ten_mon_hoc`, `ma_mon_hoc`, `khoa_vien`, `so_tin_chi`, `mo_ta` |
| Người dùng | `/nguoi_dung` | `ho_ten`, `email`, `anh_dai_dien`, `diem_tich_luy` |

Chỉnh URL trong `js/config.js` nếu bạn tạo project MockAPI mới.

## 🚀 Chạy local

Mở `index.html` bằng Live Server hoặc:

```bash
npx serve .
```

## ☁️ Deploy Vercel

1. Push code lên GitHub (public)
2. Vào [vercel.com](https://vercel.com) → Import repository
3. Framework: **Other** (static HTML)
4. Deploy → lấy link demo

## 🔐 Demo đăng nhập

- **Admin:** `admin@scholarhub.vn` / `admin123` → chuyển tới `admin.html`
- **Sinh viên:** email bất kỳ → `index.html`

---

*Made with ❤️ for DNU students — Nhóm 11 FIT*
"# ScholarHub" 
