"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "./action";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginUser,
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Login
        </h2>

        {/* Pesan error */}
        {state?.error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="nama@email.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isPending ? "Login..." : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            Register di sini
          </Link>
        </p>

      </div>
    </div>
  );
}