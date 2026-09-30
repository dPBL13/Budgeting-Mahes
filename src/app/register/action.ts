"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(
  prevState: any,
  formData: FormData
) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  console.log("=== REGISTER DIPANGGIL ===");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password ada:", !!password);

  if (!name || !email || !password) {
    return {
      error: "Semua kolom wajib diisi!",
    };
  }

  try {
    // Cek email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log("Existing user:", existingUser);

    if (existingUser) {
      return {
        error: "Email sudah terdaftar!",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Password berhasil di-hash");

    // Simpan user
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    console.log("=== USER BERHASIL DIBUAT ===");
    console.log(user);

  } catch (error) {
    console.error("=== REGISTER ERROR ===");
    console.error(error);

    return {
      error: "Terjadi kesalahan saat membuat akun.",
    };
  }

  redirect("/login");
}