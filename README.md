# BudgetMhs — Expense Tracker Mahasiswa

Aplikasi web pencatat keuangan pribadi mahasiswa berdasarkan SRS pada proyek awal.

## Stack

- **Frontend:** Next.js 16.3.6 + React 19.2.8 + TypeScript + Tailwind CSS 4
- **Backend:** Node.js + Express 5
- **Database:** PostgreSQL
- **Auth:** Session cookie dengan `express-session`
- **Password:** `bcryptjs`
- **Database driver:** `pg`

Struktur:
```text
BudgetMhs-Expense-Tracker/
├── frontend/      # Next.js
├── backend/       # Node.js + Express
└── database/
    └── schema.sql
```

## SRS yang diimplementasikan

| SRS | Implementasi |
|---|---|
| SRS-01 | Register nama, email, password |
| SRS-02 | Login email + password |
| SRS-03 | Session login berbasis cookie |
| SRS-04 | Dashboard saldo, pemasukan, pengeluaran, transaksi terbaru |
| SRS-05 | Tambah transaksi |
| SRS-06 | Riwayat transaksi |
| SRS-07 | Edit transaksi |
| SRS-08 | Hapus transaksi + konfirmasi |
| SRS-09 | Filter semua/pemasukan/pengeluaran |
| SRS-10 | Cookie menyimpan filter terakhir |
| SRS-11 | Authorization berdasarkan `user_id` |
| SRS-12 | Logout dan invalidasi session |

## 1. Persiapan PostgreSQL

Buat database:

```sql
CREATE DATABASE budgetmhs;
```

Lalu jalankan isi `database/schema.sql` pada database tersebut.

Contoh menggunakan psql:

```bash
psql -U postgres -d budgetmhs -f database/schema.sql
```

## 2. Menjalankan backend

```bash
cd backend
npm install
```

Buat `.env` dari `.env.example`:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/budgetmhs
SESSION_SECRET=ganti-dengan-secret-panjang
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Kemudian:

```bash
npm run dev
```

Backend berjalan di `http://localhost:4000`.

## 3. Menjalankan frontend

Buka terminal baru:

```bash
cd frontend
npm install
```

Buat `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Kemudian:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 4. Alur aplikasi

```text
Register
   ↓
Login
   ↓
Session dibuat oleh backend
   ↓
Dashboard
   ├── Ringkasan saldo
   ├── Tambah transaksi
   ├── Daftar transaksi
   ├── Filter
   ├── Edit
   └── Hapus
   ↓
Logout
   ↓
Session dihancurkan
```

## 5. Catatan session

Browser mengirim cookie session ke backend. Frontend memakai `credentials: "include"` agar cookie ikut pada request API.

Untuk pengembangan lokal:
- frontend: `http://localhost:3000`
- backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

Untuk production, gunakan HTTPS dan session store berbasis database/Redis, bukan MemoryStore bawaan Express.

## 6. API utama

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Transactions
- `GET /api/transactions?type=all|income|expense`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Dashboard
- `GET /api/dashboard`

Semua endpoint transaksi dan dashboard membutuhkan session login.

## 7. Testing SRS

1. Register user A.
2. Login sebagai user A.
3. Tambahkan transaksi income dan expense.
4. Pastikan dashboard menghitung:
   `saldo = pemasukan - pengeluaran`.
5. Ubah transaksi.
6. Hapus transaksi.
7. Uji filter.
8. Logout.
9. Pastikan dashboard tidak dapat diakses setelah logout.
10. Register user B dan pastikan transaksi user A tidak muncul pada user B.
11. Coba akses ID transaksi milik user A saat login sebagai user B. API harus mengembalikan `404`.
12. Ubah filter lalu refresh browser. Filter terakhir tetap digunakan karena disimpan dalam cookie.

## 8. Perintah

Frontend:
```bash
npm run dev
npm run build
npm run start
npm run lint
```

Backend:
```bash
npm run dev
npm run start
```
