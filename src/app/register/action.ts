'use server';

import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// Tambahkan prevState (atau '_' jika tidak digunakan) sebagai parameter pertama
export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Semua kolom wajib diisi!' };
  }

  try {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email sudah terdaftar!' };
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan user baru ke database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error: any) {
    return { error: error.message };
  }

  // Jika berhasil, arahkan ke halaman login
  redirect('/login');
}