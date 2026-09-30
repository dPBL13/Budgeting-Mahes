'use client'; // 1. Ubah jadi Client Component karena pakai hook useActionState

import Link from 'next/link'; // Pakai next/link untuk client-side navigation (tanpa reload)
import { useActionState } from 'react'; // Hook React 19 untuk handle form + server action
import { loginUser } from './action'; // Import Server Action login dari file action.ts

export default function LoginPage() {
  // 2. Tangkap state error, formAction, dan status pending dari action
  //    - state     : hasil return dari loginUser ({ error } atau null)
  //    - formAction: fungsi untuk dipasang di <form action={...}>
  //    - isPending : true saat action sedang diproses
  const [state, formAction, isPending] = useActionState(
    loginUser,
    null,
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md">

          {/* Header */}
          {/* 3. Bagian atas: sapaan + judul aplikasi */}
          <div className="mb-8 text-center">
            <p className="text-sm text-gray-500">
              Selamat datang kembali
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Budgeting Mahes
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Masuk untuk melihat kondisi keuanganmu.
            </p>
          </div>

          {/* Login Card */}
          {/* 4. Card utama berisi form login */}
          <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Login
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Masukkan email dan password akunmu.
              </p>
            </div>

            {/* 5. Tampilkan pesan error jika login gagal (dari state.error) */}
            {state?.error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {state.error}
                </p>
              </div>
            )}

            {/* 6. Form login — action={formAction} terhubung ke Server Action loginUser */}
            <form action={formAction} className="space-y-5">

              {/* Email */}
              {/* 7. Input email: htmlFor + id untuk aksesibilitas, type="email" untuk validasi browser */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              {/* 8. Input password: type="password" menyembunyikan input, autoComplete bantu browser */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Button */}
              {/* 9. Tombol submit otomatis disabled saat isPending untuk mencegah double-submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Memproses...' : 'Login'}
              </button>

            </form>

            {/* Register Link */}
            {/* 10. Link ke halaman register pakai <Link> untuk navigasi SPA */}
            <div className="mt-6 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}