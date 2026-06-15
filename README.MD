<div align="center">
  <img src="./logo.png" alt="ScholarHub Logo" width="220" />
  <h1>🎓 ScholarHub - Nền tảng chia sẻ tài liệu FIT DNU</h1>
  <p><em>Kho lưu trữ, chia sẻ tài liệu học tập thông minh dành cho sinh viên Đại học Đại Nam</em></p>
  
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://github.com/datdevl/DNUScholarHub)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/datdevl/DNUScholarHub)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/datdevl/DNUScholarHub)
  [![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
  [![AI Ready](https://img.shields.io/badge/AI_Chatbot-OpenRouter-000000?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)
</div>

---

## 🌟 Giới thiệu (Introduction)
**ScholarHub** là dự án nền tảng lưu trữ và chia sẻ tài liệu học tập trực tuyến (đề thi, slide, bài giảng, ghi chép...) được phát triển đặc biệt dành cho sinh viên Khoa Công nghệ Thông tin (FIT) - Trường Đại học Đại Nam (DNU).

Dự án không chỉ là một kho tài liệu thông thường mà còn tiên phong tích hợp các công nghệ hiện đại như **Điểm danh bằng AI Face ID**, **Trợ lý ảo học tập thông minh (ScholarBot)** và **Cơ chế điểm thưởng (Xu)** để xây dựng một cộng đồng học tập sôi nổi, chất lượng.

## ✨ Tính năng nổi bật (Key Features)

### 📚 Dành cho Sinh viên (Client)
- **Kho tài liệu đồ sộ**: Tìm kiếm, xem trước và tải xuống đề thi, giáo trình, slide bài giảng nhanh chóng.
- **Tài liệu VIP & Hệ thống Xu**: Cơ chế mua bán tài liệu chất lượng cao bằng Xu. Nhận ngay Xu khi đăng ký mới hoặc mỗi lần đóng góp tài liệu.
- **Điểm danh Face ID (EduAttend)**: Trải nghiệm điểm danh thông minh, nhận diện khuôn mặt realtime ngay trên trình duyệt với độ chính xác cao.
- **Trợ lý ảo ScholarBot AI**: Chatbot hỗ trợ học tập thông minh (hỗ trợ tùy chọn đổi Model LLM linh hoạt, tích hợp API Key cá nhân khi hết hạn mức).
- **Bảng xếp hạng (Leaderboard)**: Đua top sinh viên đóng góp năng nổ nhất theo Tuần/Tháng.
- **UI/UX Hiện đại**: Hỗ trợ toàn diện **Dark Mode / Light Mode** và Đa ngôn ngữ (Tiếng Việt / Tiếng Anh) với độ tùy biến cao.

### ⚙️ Dành cho Quản trị viên (Admin)
- **Dashboard Tổng quan**: Thống kê trực quan số lượng sinh viên, tài liệu, giao dịch Xu.
- **Kiểm duyệt tài liệu**: Duyệt hoặc từ chối các tài liệu đóng góp từ sinh viên.
- **Hỗ trợ trực tuyến**: Khung chat hỗ trợ 1-1 với sinh viên theo thời gian thực (tích hợp tính năng xóa lịch sử tiện lợi).
- **Quản lý điểm danh**: Báo cáo, xem danh sách sinh viên đã điểm danh Face ID.

## 🛠 Công nghệ sử dụng (Tech Stack)
- **Giao diện (Frontend):** HTML5, CSS3, JavaScript (ES6)
- **Framework/Thư viện:** Bootstrap 5.3, FontAwesome 6, jQuery
- **AI & Machine Learning:** `face-api.js` (Nhận diện khuôn mặt), `OpenRouter API` (LLM Models: Gemini, Llama, Qwen...)
- **Lưu trữ dữ liệu:** LocalStorage, Web Storage API, MockAPI (Mô phỏng Backend)

## 📂 Cấu trúc thư mục (Folder Structure)
```text
DNUScholarHub/
├── css/               # Chứa các tệp CSS (Style chính, Dark/Light theme)
├── html/              # Các trang HTML chức năng (Home, Profile, Admin, FaceID...)
├── js/                # Logic xử lý chính (API, Auth, Face Tracker, Chatbot UI...)
├── models/            # Trọng số (Weights) AI phục vụ cho face-api.js
├── index.html         # Trang chủ mặc định
├── logo.png           # Logo định dạng chuẩn
└── README.md          # Tài liệu dự án
```

## 🚀 Hướng dẫn cài đặt & Chạy dự án (Installation)
Dự án được xây dựng tập trung xử lý ở Frontend, không yêu cầu cài đặt Backend Server phức tạp.

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/datdevl/DNUScholarHub.git
   ```
2. **Mở thư mục dự án:**
   ```bash
   cd DNUScholarHub
   ```
3. **Khởi chạy:**
   - *Cách 1:* Mở trực tiếp file `index.html` bằng trình duyệt (Chrome, Edge, Safari).
   - *Cách 2 (Khuyến nghị):* Sử dụng **Live Server** (Extention trên VS Code). Nhấn `Go Live` để khởi chạy trên localhost. *Lưu ý: Tính năng Camera Face ID yêu cầu chạy trên localhost hoặc HTTPS để trình duyệt cấp quyền truy cập.*

## 👥 Nhóm phát triển (Development Team)
- **Tác giả:** Nhóm 11 FIT-DNU
- **Đơn vị:** Khoa Công nghệ Thông tin - Trường Đại học Đại Nam

---
<div align="center">
  <i>Được xây dựng với ❤️ và nỗ lực mang lại giá trị học tập thực sự!</i>
</div>


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

*Made with ❤️ for DNU students — DevFour*
"# ScholarHub" 
