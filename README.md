# Scholarship-Distribute-System (Scholarship Chain) 🎓⛓️

Hệ thống Quản lý và Phân phối Học bổng Đại học Minh bạch trên nền tảng Web3 & Blockchain Ethereum kết hợp Node.js & MongoDB Atlas.

---

## 🌟 Tính năng nổi bật

### 1. Dành cho Sinh viên (Student Portal)
* **Xác thực phi tập trung (Web3 Auth):** Đăng nhập an toàn qua ví MetaMask với chữ ký số mật mã (Cryptographic Signature - EIP-191) hoàn toàn miễn phí gas ETH.
* **Định danh Onboarding 1 lần duy nhất:** Sinh viên nhập Họ tên & MSSV để liên kết cố định với địa chỉ ví, không cần phải nhập lại tên mỗi lần gửi đơn.
* **Tra cứu & Nộp hồ sơ học bổng:** Khóa các chương trình học bổng đã nộp để chống gửi trùng đơn (`duplicate application`).
* **Theo dõi trạng thái thời gian thực:** Xem danh sách học bổng đã nộp và trạng thái xét duyệt (`Chờ duyệt`, `Đã duyệt`, `Từ chối`, `Đã giải ngân`).

### 2. Dành cho Quản trị viên (Admin Portal)
* **Khởi tạo Học bổng on Smart Contract & CSDL:** Tạo học bổng với ngân sách tổng, định mức mỗi suất và thời hạn nộp hồ sơ.
* **Đồng bộ On-chain hai chiều:** Nút quét và đồng bộ các học bổng từ Smart Contract về cơ sở dữ liệu MongoDB Atlas.
* **Xét duyệt & Giải ngân trực tiếp:** Phê duyệt hồ sơ và kích hoạt giao dịch chuyển ETH trực tiếp từ Smart Contract tới ví sinh viên trúng tuyển.

---

## 🏗️ Cấu trúc dự án

```text
├── backend/                   # Node.js + Express REST API Server
│   ├── config/                # Cấu hình Database MongoDB Atlas & Web3 Provider
│   ├── controllers/           # Controllers: Auth, Scholarship, Application
│   ├── middleware/            # JWT / Web3 Auth Middleware
│   ├── models/                # Mongoose Schemas (User, Scholarship, Application)
│   ├── routes/                # API Endpoints
│   ├── server.js              # Entrypoint server Express
│   └── package.json
│
├── frontend/                  # Web3 Client Interface
│   ├── assets/                # Logo, cosmic background, MetaMask SVG
│   ├── css/                   # Vanilla CSS Design System (main, auth, student, admin)
│   ├── js/                    # Client Logic Modules (auth, student, admin, api, contract)
│   └── index.html             # Single Page Application UI
│
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Khởi động Backend
```bash
cd backend
npm install
npm start
```
> Server mặc định chạy tại: `http://localhost:5000`

### 2. Khởi động Frontend
Chạy Live Server hoặc bất kỳ static HTTP server nào (e.g. `npx serve frontend` hoặc extension Live Server trong VS Code) tại cổng `http://localhost:5500`.

---

## 🛡️ Công nghệ sử dụng
* **Blockchain:** Ethereum / Hardhat / Sepolia, Ethers.js v6
* **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose)
* **Frontend:** Modern Vanilla HTML5 / CSS3 / ES Modules, Design System chuẩn Web3 Glassmorphism
