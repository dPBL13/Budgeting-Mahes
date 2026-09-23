import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-4xl text-center">

          <div className="mb-6 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Personal Expense Tracker
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Kelola Keuanganmu
            <span className="block text-blue-600">
              dengan Lebih Mudah
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Catat pemasukan dan pengeluaran, pantau saldo,
            serta kelola keuangan pribadi kamu dalam satu tempat.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Buat Akun
            </Link>
          </div>

          <div className="mt-16 grid gap-5 text-left md:grid-cols-3">

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 text-2xl">
                💰
              </div>

              <h2 className="font-semibold text-gray-900">
                Pantau Saldo
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Ketahui kondisi keuanganmu berdasarkan
                pemasukan dan pengeluaran.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 text-2xl">
                📝
              </div>

              <h2 className="font-semibold text-gray-900">
                Catat Transaksi
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Tambahkan, ubah, dan hapus transaksi
                keuangan dengan mudah.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 text-2xl">
                📊
              </div>

              <h2 className="font-semibold text-gray-900">
                Riwayat Keuangan
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Lihat riwayat transaksi dan filter
                berdasarkan jenis transaksi.
              </p>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}
