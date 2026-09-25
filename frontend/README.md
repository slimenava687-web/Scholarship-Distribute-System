# Scholarship Ledger Frontend

## Chạy giao diện

1. Khởi động backend tại `backend`:

```powershell
npm start
```

2. Mở thư mục project bằng VS Code và chạy `frontend/index.html` bằng Live Server tại `http://localhost:5500`. Vì frontend dùng ES modules, không nên mở trực tiếp bằng `file://`.
3. Kết nối MetaMask, sau đó bấm **Đăng nhập hệ thống**.

Frontend gọi backend tại `http://localhost:5000/api`. Có thể đổi địa chỉ trong `js/api.js` bằng `API_BASE_URL`.

Session đăng nhập được lưu trong `localStorage` với key `scholarship_session`; nút **Đăng xuất** sẽ xóa session và quay lại màn hình chào mừng.

## Cấu trúc

- `css/main.css`: reset, design tokens, layout, animations và toast.
- `css/auth.css`: màn hình đăng nhập glassmorphism.
- `css/student.css`: card học bổng, progress bar và lịch sử hồ sơ.
- `css/admin.css`: metric cards, form và bảng quản trị.
- `js/api.js`: các hàm gọi REST API.
- `js/auth.js`: MetaMask, đăng nhập, session và logout.
- `js/student.js`: dữ liệu học bổng và hồ sơ sinh viên.
- `js/admin.js`: thống kê, tạo học bổng và duyệt hồ sơ.
- `js/app.js`: khởi tạo ứng dụng và điều phối các module.
- `js/ui.js`: loading state, empty state và trạng thái loading của button.

Các tương tác quan trọng có trạng thái đang xử lý; thao tác từ chối hồ sơ yêu cầu xác nhận trước khi gọi API.
