# Setup PostgreSQL & Panduan Testing

Panduan ini menjelaskan cara menyambungkan aplikasi ke PostgreSQL dan cara menguji semua API endpoint.

---

## 1. Prasyarat

| Tool | Versi minimum |
|------|--------------|
| Node.js | 18+ |
| PostgreSQL | 14+ |
| npm | 9+ |

---

## 2. Setup Database

### Option A — PostgreSQL lokal

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu / Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows — download installer di https://www.postgresql.org/download/windows/
```

Buat database:

```sql
psql -U postgres
CREATE DATABASE budgeting;
\q
```

### Option B — Docker (lebih simpel)

```bash
docker run --name budgeting-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=budgeting \
  -p 5432:5432 \
  -d postgres:16
```

---

## 3. Konfigurasi Environment

```bash
# Copy file contoh
cp .env.example .env.local
```

Edit `.env.local` dan sesuaikan:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/budgeting?schema=public"
```

Format lengkap:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

---

## 4. Migrasi & Generate Client

```bash
# 1. Generate Prisma Client (wajib setelah install)
npx prisma generate

# 2. Buat tabel di database
npx prisma migrate dev --name init

# (opsional) Lihat isi database via Prisma Studio
npx prisma studio
```

Setelah `migrate dev`, tabel `Transaction` akan terbentuk otomatis di PostgreSQL.

---

## 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka http://localhost:3000

---

## 6. Testing API Endpoint

### Tools yang bisa dipakai
- **curl** (command line, contoh di bawah)
- **Postman** — import curl ke Postman langsung
- **Bruno** — alternatif Postman yang open source
- **httpie** — `http GET localhost:3000/api/transactions`

---

### GET semua transaksi

```bash
curl http://localhost:3000/api/transactions
```

Dengan filter bulan:

```bash
curl "http://localhost:3000/api/transactions?month=2025-06"
```

Dengan filter tipe + search:

```bash
curl "http://localhost:3000/api/transactions?type=expense&search=makan"
```

---

### POST buat transaksi baru

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gaji Juli",
    "amount": 9000000,
    "type": "income",
    "category": "salary",
    "date": "2025-07-01"
  }'
```

Response berhasil (`201 Created`):

```json
{
  "id": "cly1a2b3c0000...",
  "title": "Gaji Juli",
  "amount": 9000000,
  "type": "income",
  "category": "salary",
  "date": "2025-07-01",
  "note": null,
  "createdAt": "2025-07-01T10:00:00.000Z"
}
```

---

### GET satu transaksi

```bash
# Ganti <id> dengan id dari response POST di atas
curl http://localhost:3000/api/transactions/<id>
```

---

### PATCH update transaksi

```bash
curl -X PATCH http://localhost:3000/api/transactions/<id> \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9500000,
    "note": "Sudah termasuk bonus"
  }'
```

---

### DELETE hapus transaksi

```bash
curl -X DELETE http://localhost:3000/api/transactions/<id>
# Response: 204 No Content (body kosong)
```

---

### Contoh error response

```bash
# Kirim amount negatif → 400 Bad Request
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","amount":-100,"type":"expense","category":"food","date":"2025-07-01"}'

# Response:
# {"error":"Nominal harus berupa angka positif."}
```

---

## 7. Seed Data (opsional)

Buat file `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  await prisma.transaction.createMany({
    data: [
      { title: "Gaji Bulan Ini", amount: 8500000, type: "income", category: "salary", date: today },
      { title: "Makan siang",    amount: 35000,   type: "expense", category: "food",  date: today },
      { title: "Ojek online",    amount: 18000,   type: "expense", category: "transport", date: yesterday },
      { title: "Freelance UI",   amount: 1200000, type: "income", category: "freelance",  date: yesterday },
    ],
  });

  console.log("Seed selesai ✓");
}

main().finally(() => prisma.$disconnect());
```

Tambah ke `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Jalankan:

```bash
npx prisma db seed
```

---

## 8. Struktur File yang Ditambahkan

```
prisma/
  schema.prisma          ← definisi model Transaction

lib/
  prisma.ts              ← singleton PrismaClient
  transactionStore.ts    ← fetch helpers ke API (ganti localStorage)

app/api/
  transactions/
    route.ts             ← GET list, POST create
    [id]/
      route.ts           ← GET, PATCH, DELETE per-id

.env.example             ← template environment variable
```

---

## 9. Checklist Deployment (Vercel / Railway / Render)

- [ ] Set environment variable `DATABASE_URL` di dashboard deployment
- [ ] Pastikan `postinstall: "prisma generate"` ada di `package.json` ✓
- [ ] Jalankan `prisma migrate deploy` (bukan `migrate dev`) saat production
- [ ] Gunakan connection pooling (PgBouncer / Prisma Accelerate) untuk serverless
