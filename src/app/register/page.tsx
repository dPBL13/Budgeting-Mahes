'use client'; // 1. Ubah jadi Client Component agar bisa pakai hook

import { useActionState } from 'react'; // (Gunakan 'react-dom' jika versi Next/React Anda agak lama: import { useFormState } from 'react-dom')
import { registerUser } from './action';

export default function RegisterPage() {
  // 2. Tangkap state error dari action
  const [state, formAction, isPending] = useActionState(registerUser, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Buat Akun Baru</h2>
        
        {/* 3. Tampilkan pesan error jika ada */}
        {state?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 font-medium disabled:bg-blue-400"
          >
            {isPending ? 'Mendaftar...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login di sini
          </a>
        </p>
      </div>
    </div>
  );
}