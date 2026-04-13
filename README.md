# Quản Lý Bán Hàng — Database Manager

A bold & modern web interface to manage all tables in the **QuanLyBanHang** MySQL database.  
Full CRUD (Create, Read, Update, Delete) for every table. Built with Node.js + Express + MySQL2 + vanilla HTML/CSS/JS.

---

## 📁 Project Structure

```
quanlybanhang/
├── server.js          ← Express backend (API + static server)
├── package.json
├── public/
│   ├── index.html     ← Single-page frontend
│   ├── style.css      ← Bold/modern dark theme
│   └── app.js         ← Frontend logic
└── README.md
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v16+
- MySQL 8 (or compatible) with the `QuanLyBanHang` database imported

---

## 🚀 Setup & Run

### 1. Import the database

Open MySQL and run your `.sql` file:

```bash
mysql -u root -p < QuanLyBanHang.sql
```

Or import via MySQL Workbench / phpMyAdmin.

### 2. Configure DB password

Open `server.js` and update line ~12:

```js
password: '', // ← put your MySQL password here
```

### 3. Install dependencies

```bash
cd quanlybanhang
npm install
```

### 4. Start the server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 📋 Features

| Feature | Details |
|---|---|
| **View all tables** | Sidebar lists all 8 tables with row counts |
| **Browse rows** | Full data grid with all columns |
| **Search** | Live search across all columns in any table |
| **Add row** | Form auto-generated from table schema |
| **Edit row** | Pre-filled form, PK fields locked |
| **Delete row** | Confirmation dialog before delete |
| **Composite PKs** | Supported (CungCap, ChiTietDonHang) |
| **Currency format** | GiaBan, GiaMua, TongTienThanhToan formatted as VND |

---

## 🗄️ Tables Managed

1. **LoaiMatHang** — Product categories
2. **NhaCungCap** — Suppliers
3. **KhachHang** — Customers
4. **NhanVien** — Employees
5. **MatHang** — Products
6. **DonHang** — Orders
7. **CungCap** — Supply relationships (composite PK)
8. **ChiTietDonHang** — Order details (composite PK)

---

## 🔧 API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/api/tables` | List all table metadata |
| GET | `/api/:table` | Get all rows |
| GET | `/api/:table/search?q=` | Search rows |
| GET | `/api/:table/row?PK=val` | Get single row |
| POST | `/api/:table` | Create row |
| PUT | `/api/:table/row?PK=val` | Update row |
| DELETE | `/api/:table/row?PK=val` | Delete row |

For composite PKs, pass multiple query params: `?MaDonHang=MDH01&MaMatHang=MMH01`
