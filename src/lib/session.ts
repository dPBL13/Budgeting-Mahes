import { createHmac } from 'crypto'; // Fungsi Node.js untuk membuat HMAC signature
import { cookies } from 'next/headers'; // API Next.js untuk baca/tulis cookie di server
import { prisma } from './prisma'; // Instance Prisma untuk akses database

// 1. Nama cookie untuk menyimpan session
const SESSION_COOKIE =
  'budgeting_mahes_session';

// 2. Durasi session dalam detik (2 jam = 60 * 60 * 2)
const SESSION_DURATION =
  60 * 60 * 2;

// 3. Ambil SESSION_SECRET dari environment variable
//    Secret ini dipakai untuk sign/verify cookie agar tidak bisa dipalsukan
function getSecret() {
  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      'SESSION_SECRET belum tersedia.'
    );
  }

  return secret;
}

// 4. Buat HMAC SHA-256 signature dari sebuah string
//    - Algoritma: sha256
//    - Key: SESSION_SECRET
//    - Output: base64url (aman dipakai di URL/cookie)
//    Tujuan: pastikan cookie tidak bisa diubah orang lain
function sign(value: string) {
  return createHmac(
    'sha256',
    getSecret()
  )
    .update(value)
    .digest('base64url');
}

// 5. Buat isi cookie session
//    Format: <payload_encoded>.<signature>
//    Payload berisi userId + exp (waktu kadaluarsa)
function createSessionValue(
  userId: number
) {
  const payload = {
    userId,
    exp:
      Math.floor(Date.now() / 1000) +
      SESSION_DURATION, // exp dalam satuan detik Unix timestamp
  };

  // Encode payload JSON ke base64url agar aman dipakai di cookie
  const encoded =
    Buffer.from(
      JSON.stringify(payload)
    ).toString('base64url');

  // Gabung payload + signature
  return `${encoded}.${sign(encoded)}`;
}

// 6. Buat session & simpan ke cookie
//    Dipanggil setelah login / register berhasil
export async function createSession(
  userId: number
) {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    createSessionValue(userId),
    {
      httpOnly: true, // Tidak bisa diakses JavaScript di browser (anti XSS)
      secure:
        process.env.NODE_ENV ===
        'production', // Hanya lewat HTTPS di production
      sameSite: 'lax', // Cegah CSRF, tapi tetap izinkan navigasi normal
      path: '/', // Berlaku untuk semua route
      maxAge: SESSION_DURATION, // Cookie kadaluarsa sesuai durasi
    }
  );
}

// 7. Ambil user yang sedang login dari cookie session
//    Return: object user (id, name, email) atau null jika tidak login
export async function getCurrentUser() {
  const cookieStore =
    await cookies();

  const value =
    cookieStore.get(
      SESSION_COOKIE
    )?.value;

  // 8. Kalau tidak ada cookie → belum login
  if (!value) {
    return null;
  }

  // 9. Pisahkan payload & signature
  const [
    encoded,
    signature,
  ] = value.split('.');

  if (!encoded || !signature) {
    return null;
  }

  // 10. Verifikasi signature — pastikan cookie tidak dimodifikasi
  if (
    sign(encoded) !==
    signature
  ) {
    return null;
  }

  try {
    // 11. Decode payload dari base64url jadi objek
    const payload = JSON.parse(
      Buffer.from(
        encoded,
        'base64url'
      ).toString()
    );

    // 12. Cek kadaluarsa (exp dibandingkan dengan waktu sekarang)
    if (
      payload.exp <
      Math.floor(
        Date.now() / 1000
      )
    ) {
      return null;
    }

    // 13. Ambil data user dari database
    //     Hanya field id, name, email (JANGAN kirim password!)
    return prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  } catch {
    // 14. Kalau payload rusak / JSON invalid → anggap tidak login
    return null;
  }
}