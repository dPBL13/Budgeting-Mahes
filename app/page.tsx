import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen font-sans relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400 opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-400 opacity-10 blur-3xl" />
      </div>

      <main className="relative flex flex-col items-center gap-8 text-center px-6 py-16 max-w-sm w-full">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl shadow-2xl">
            💰
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Budgeting</span>
            <span className="text-slate-800"> App</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Catat pemasukan &amp; pengeluaran harian dengan mudah dan cepat. 🚀
          </p>
        </div>

        {/* Stats teaser */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 text-white text-left shadow-lg">
            <p className="text-xs font-semibold opacity-80 mb-1">Pemasukan</p>
            <p className="text-lg font-bold">💚 Tercatat</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 p-4 text-white text-left shadow-lg">
            <p className="text-xs font-semibold opacity-80 mb-1">Pengeluaran</p>
            <p className="text-lg font-bold">🔴 Terpantau</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/transactions"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            📋 Lihat Transaksi
          </Link>
          <Link
            href="/transactions/create"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            ✨ Tambah Transaksi
          </Link>
        </div>

        <p className="text-xs text-slate-400">Semua data tersimpan lokal di browser kamu</p>
      </main>
    </div>
  );
}
