'use server'; // 1. Tandai file ini sebagai Server Action (hanya berjalan di server)

import bcrypt from 'bcryptjs'; // Library untuk hashing password
import { redirect } from 'next/navigation'; // Helper Next.js untuk redirect
import { prisma } from '../../lib/prisma'; // Instance Prisma untuk akses database

// Tipe state yang dikembalikan action: error opsional, atau null
type RegisterState = {
  error?: string;
} | null;

export async function registerUser(
  _prevState: RegisterState, // 2. State sebelumnya dari useActionState (tidak dipakai, prefix _)
  formData: FormData, // 3. Data form yang dikirim dari client
): Promise<RegisterState> {
  // 4. Ambil & bersihkan input dari formData
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase(); // Email di-lowercase agar konsisten saat dicek

  const password = String(formData.get('password') ?? '');

  // 5. Validasi: semua kolom wajib diisi
  if (!name || !email || !password) {
    return {
      error: 'Semua kolom wajib diisi.',
    };
  }

  // 6. Validasi: panjang password minimal 8 karakter
  if (password.length < 8) {
    return {
      error: 'Password minimal 8 karakter.',
    };
  }

  // 7. Validasi: format email harus valid
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      error: 'Format email tidak valid.',
    };
  }

  try {
    // 8. Cek apakah email sudah terdaftar di database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: 'Email sudah terdaftar.',
      };
    }

    // 9. Hash password sebelum disimpan (jangan simpan plain text!)
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // 10. Simpan user baru ke database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch {
    // 11. Tangani error tak terduga (misal koneksi DB gagal)
    return {
      error: 'Terjadi kesalahan saat membuat akun.',
    };
  }

  // 12. Redirect ke halaman login setelah berhasil register
  redirect('/login');
}