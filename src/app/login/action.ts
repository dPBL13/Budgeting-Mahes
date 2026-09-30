'use server'; // 1. Tandai file ini sebagai Server Action (hanya jalan di server, aman untuk akses DB & session)

import bcrypt from 'bcryptjs'; // Library untuk verifikasi hash password
import { redirect } from 'next/navigation'; // Helper Next.js untuk redirect antar halaman
import { prisma } from '../../lib/prisma'; // Instance Prisma untuk akses database
import { createSession } from '../../lib/session'; // Fungsi untuk membuat session cookie

// 2. Tipe state yang dikembalikan action: berisi error opsional, atau null
type LoginState = {
  error?: string;
} | null;

export async function loginUser(
  _prevState: LoginState, // 3. State sebelumnya dari useActionState (tidak dipakai, prefix _)
  formData: FormData // 4. Data form yang dikirim dari client
): Promise<LoginState> {
  // 5. Ambil & bersihkan input dari formData
  const email = String(
    formData.get('email') ?? ''
  )
    .trim()
    .toLowerCase(); // Email: lowercase agar cocok dengan yang tersimpan di DB

  const password = String(
    formData.get('password') ?? ''
  ); // Password: ambil apa adanya (JANGAN di-trim, spasi bisa jadi bagian password)

  // 6. Validasi: semua kolom wajib diisi
  if (!email || !password) {
    return {
      error:
        'Email dan password wajib diisi.',
    };
  }

  // 7. Cari user berdasarkan email di database
  const user =
    await prisma.user.findUnique({
      where: { email },
    });

  // 8. Kalau user tidak ditemukan → return pesan error generik
  //    Pesan "Email atau password salah" SENGAJA tidak spesifik (anti user enumeration)
  if (!user) {
    return {
      error:
        'Email atau password salah.',
    };
  }

  // 9. Bandingkan password input dengan hash yang tersimpan
  //    bcrypt.compare() akan hash ulang password input & cocokkan dengan hash di DB
  const validPassword =
    await bcrypt.compare(
      password,
      user.password
    );

  // 10. Kalau password salah → return pesan error SAMA seperti user tidak ditemukan
  if (!validPassword) {
    return {
      error:
        'Email atau password salah.',
    };
  }

  // 11. Password benar → buat session cookie untuk user
  //     Cookie berisi userId + signature HMAC (lihat src/lib/session.ts)
  await createSession(user.id);

  // 12. Redirect ke dashboard setelah login berhasil
  redirect('/dashboard');
}