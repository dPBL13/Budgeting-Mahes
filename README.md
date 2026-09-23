# Aplikasi Expense Tracker Mahasiswa "Budgeting Mahes"

### 1. GAMBARAN UMUM

Budgeting Mahes merupakan aplikasi web yang memungkinkan mahasiswa mengelola keuangan pribadi secara sederhana. Pengguna dapat membuat akun, melakukan login, mencatat pemasukan dan pengeluaran, melihat riwayat transaksi, serta mengetahui kondisi keuangannya melalui informasi saldo, total pemasukan, dan total pengeluaran.

Setiap transaksi terhubung dengan pengguna yang sedang login sehingga setiap pengguna hanya dapat mengakses dan mengelola data keuangannya sendiri. Aplikasi menggunakan session untuk mempertahankan status login dan cookies untuk menyimpan minimal satu preferensi pengguna.

<br>

### 2. TUJUAN SISTEM

- Memudahkan mahasiswa mencatat pemasukan dan pengeluaran pribadi.
- Memudahkan pengguna melihat riwayat transaksi.
- Menampilkan kondisi keuangan melalui saldo, total pemasukan, dan total pengeluaran.
- Membatasi akses data agar setiap pengguna hanya dapat mengakses data miliknya sendiri.
- Mempertahankan status autentikasi selama session masih berlaku.
- Menyimpan minimal satu preferensi pengguna menggunakan cookies.

<br>

### 3. AKTOR SISTEM

| Aktor | Deskripsi |
|---|---|
| User/Mahasiswa | Pengguna yang melakukan registrasi, login, mengelola transaksi, melihat dashboard, menggunakan filter, dan logout. |

<br>

### 4. KEBUTUHAN FUNGSIONAL
#### Software Requirements Specification (SRS)

| ID | Fitur | Kebutuhan |
|---|---|---|
| SRS-01 | Register | Membuat akun dengan nama, email, password |
| SRS-02 | Login | Masuk menggunakan email dan password |
| SRS-03 | Session | Mempertahankan user selama session berlaku |
| SRS-04 | Dashboard | Menampilkan nama, saldo, pemasukan, pengeluaran, transaksi terbaru |
| SRS-05 | Create | Menambah transaksi |
| SRS-06 | Read | Melihat transaksi |
| SRS-07 | Update | Mengubah transaksi |
| SRS-08 | Delete | Menghapus transaksi |
| SRS-09 | Filter | Memfilter transaksi berdasarkan jenis |
| SRS-10 | Cookies | Menyimpan minimal satu preferensi |
| SRS-11 | Authorization | Membatasi user agar hanya mengakses data sendiri |
| SRS-12 | Logout | Mengakhiri session |


#### SRS-01 — Register
Sistem harus menyediakan fitur registrasi pengguna dengan data:
- Nama
- Email
- Password

Sistem harus memvalidasi data dan memastikan email belum digunakan sebelum akun disimpan.

#### SRS-02 — Login
Sistem harus memungkinkan pengguna masuk menggunakan email dan password yang telah terdaftar. Jika kredensial valid, sistem membuat session dan mengarahkan pengguna ke dashboard.

#### SRS-03 — Session
Sistem harus:
- Membuat session setelah login berhasil.
- Menyimpan identitas pengguna yang sedang login.
- Melindungi halaman yang membutuhkan autentikasi.
- Mempertahankan status login selama session masih berlaku.
- Mengakhiri session ketika pengguna logout.

#### SRS-04 — Dashboard
Dashboard harus menampilkan:
- Nama pengguna.
- Saldo.
- Total pemasukan.
- Total pengeluaran.
- Transaksi terbaru.

Perhitungan saldo:

**Saldo = Total Pemasukan - Total Pengeluaran**

Periode perhitungan dapat menggunakan seluruh transaksi pengguna.

#### SRS-05 — Menambah Transaksi
Sistem harus memungkinkan pengguna menambahkan transaksi dengan minimal:
- Jenis transaksi (pemasukan/pengeluaran)
- Nominal
- Keterangan
- Tanggal transaksi

Transaksi harus otomatis terhubung dengan user yang sedang login.

#### SRS-06 — Melihat Transaksi
Sistem harus memungkinkan pengguna melihat riwayat transaksi yang dimilikinya, meliputi:
- Tanggal
- Jenis transaksi
- Nominal
- Keterangan

Pengguna hanya dapat melihat transaksi miliknya sendiri.

#### SRS-07 — Mengubah Transaksi
Sistem harus memungkinkan pengguna mengubah transaksi miliknya. Sistem harus memastikan transaksi tersebut memang dimiliki oleh user yang sedang login.

#### SRS-08 — Menghapus Transaksi
Sistem harus memungkinkan pengguna menghapus transaksi miliknya. Penghapusan dapat disertai konfirmasi untuk mencegah kesalahan.

#### SRS-09 — Filter Transaksi
Sistem harus menyediakan filter transaksi berdasarkan jenis:
- Semua transaksi
- Pemasukan
- Pengeluaran

Hasil filter hanya menampilkan transaksi milik pengguna yang sedang login.

#### SRS-10 — Cookies
Sistem harus menggunakan cookies untuk menyimpan minimal satu preferensi pengguna.

Contoh preferensi:
- Filter transaksi terakhir.
- Preferensi tema tampilan.
- Jumlah transaksi per halaman.

#### SRS-11 — Autorisasi
Sistem harus membatasi akses data berdasarkan user yang sedang login.

Ketentuan:
- Setiap transaksi memiliki `user_id`.
- User hanya dapat melihat transaksi miliknya.
- User hanya dapat menambah transaksi untuk dirinya sendiri.
- User hanya dapat mengubah transaksi miliknya.
- User hanya dapat menghapus transaksi miliknya.
- User tidak dapat mengakses transaksi user lain melalui perubahan ID pada URL atau request.

#### SRS-12 — Logout
Sistem harus menyediakan fitur logout yang:
1. Mengakhiri session pengguna.
2. Mengarahkan pengguna ke halaman login.
3. Mencegah akses ke halaman yang membutuhkan autentikasi sampai pengguna login kembali.

<br>

### 5. KEBUTUHAN DATA

#### 5.1 User

| Field | Tipe | Keterangan |
|---|---|---|
| id | Integer | Primary key |
| name | String | Nama pengguna |
| email | String | Email unik |
| password | String | Password yang disimpan secara aman |
| created_at | Timestamp | Waktu pembuatan |
| updated_at | Timestamp | Waktu perubahan |

#### 5.2 Transaction

| Field | Tipe | Keterangan |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | Foreign key ke users |
| type | String/Enum | `income` atau `expense` |
| amount | Decimal | Nominal transaksi |
| description | String/Text | Keterangan transaksi |
| transaction_date | Date | Tanggal transaksi |
| created_at | Timestamp | Waktu pembuatan |
| updated_at | Timestamp | Waktu perubahan |

<br>

### 6. RELASI DATA

Satu user dapat memiliki banyak transaksi, sedangkan satu transaksi hanya dimiliki oleh satu user.

```text
User (1) -------- (N) Transaction
```

<br>

### 7. ATURAN BISNIS 
#### *(baru kerjain kalau semisal SRS sama database nya udah aman)

| ID | Aturan |
|---|---|
| BR-01 | Email pengguna harus unik. |
| BR-02 | Password harus disimpan dalam bentuk yang aman/hashed. |
| BR-03 | Pengguna harus login untuk mengakses dashboard dan transaksi. |
| BR-04 | Setiap transaksi harus memiliki `user_id`. |
| BR-05 | Jenis transaksi hanya pemasukan atau pengeluaran. |
| BR-06 | Nominal transaksi harus bernilai positif. |
| BR-07 | Saldo = total pemasukan - total pengeluaran. |
| BR-08 | User hanya dapat mengakses transaksi miliknya sendiri. |
| BR-09 | Logout harus mengakhiri session pengguna. |
| BR-10 | Sistem harus menggunakan cookies untuk menyimpan minimal satu preferensi. |

<br>
