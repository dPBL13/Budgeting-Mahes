"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginUser(
  prevState: any,
  formData: FormData
) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      error: "Email dan password wajib diisi!",
    };
  }

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return {
        error: "Email atau password salah!",
      };
    }

    // Cek password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return {
        error: "Email atau password salah!",
      };
    }

    console.log("=== LOGIN BERHASIL ===");
    console.log("User ID:", user.id);
    console.log("Nama:", user.name);
    console.log("Email:", user.email);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return {
      error: "Terjadi kesalahan saat login.",
    };
  }

  // Sementara redirect ke dashboard
  redirect("/dashboard");
}