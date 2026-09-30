import { PrismaClient } from '@prisma/client'; // Import Prisma Client yang di-generate dari schema.prisma

// 1. Deklarasi tipe untuk global object agar TypeScript tahu ada properti "prisma"
//    globalThis = objek global (seperti window di browser, global di Node.js)
//    "as unknown as {...}" = trik TypeScript untuk casting aman
const globalForPrisma =
  globalThis as unknown as {
    prisma: PrismaClient | undefined; // Bisa berisi PrismaClient, atau undefined kalau belum dibuat
  };

// 2. Buat / ambil instance Prisma Client (Singleton Pattern)
//    - Kalau globalForPrisma.prisma sudah ada → pakai itu
//    - Kalau belum ada → buat baru dengan new PrismaClient()
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// 3. Simpan instance ke global object — TAPI hanya di mode development
//    Di production, tidak perlu disimpan ke global karena:
//    - Next.js di production tidak hot-reload (tidak ada risiko duplikasi koneksi)
//    - Menyimpan di global bisa bikin memory leak di production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}