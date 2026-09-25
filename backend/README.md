# University Scholarship Backend

Backend Node.js + Express cho hệ thống quản lý học bổng tích hợp Blockchain.

## Cài đặt và chạy

1. Mở terminal tại thư mục `backend`.
2. Cài dependencies:

```bash
npm install
```

3. Mở file `.env` và thay `MONGODB_URI` bằng connection string MongoDB Atlas của bạn.
4. Khởi động server:

```bash
npm start
```

Server mặc định chạy tại `http://localhost:5000`.

## API

- `POST /api/auth/login`: đăng nhập bằng địa chỉ ví. Body JSON:

```json
{
  "walletAddress": "0x...",
  "name": "Nguyen Van A"
}
```

User mới được tạo với role mặc định là `student`. User đã tồn tại sẽ nhận lại thông tin hiện có.

- `POST /api/scholarships`: admin tạo học bổng mới.
- `GET /api/scholarships`: mọi người xem học bổng đang hoạt động.
- `POST /api/applications`: sinh viên nộp hồ sơ. Body gồm `scholarshipId`, `studentAddress`, `studentName`.
- `GET /api/applications/my-applications`: sinh viên xem hồ sơ của mình.
- `PATCH /api/admin/applications/:id/status`: admin duyệt hoặc từ chối hồ sơ. Body: `{ "status": "approved" }` hoặc `{ "status": "rejected" }`.
- `GET /api/health`: kiểm tra trạng thái server.

Các route quản trị đặt dưới `/api/admin` được bảo vệ bởi middleware admin. Gửi địa chỉ ví của user trong header:

```text
x-wallet-address: 0x...
```

Middleware `authenticateWallet` và `requireAdmin` được áp dụng cho các route cần quyền sinh viên hoặc admin.
