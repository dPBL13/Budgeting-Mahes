"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTransactionById, deleteTransaction } from "@/lib/transactionStore";
import { formatCurrency, formatDate } from "@/components/TransactionList";
import { CATEGORY_LABELS } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";

const CATEGORY_ICONS: Record<string, string> = {
  salary: "💼",
  freelance: "🖥️",
  investment: "📈",
  gift: "🎁",
  food: "🍽️",
  transport: "🚗",
  housing: "🏠",
  health: "❤️",
  entertainment: "🎬",
  education: "📚",
  shopping: "🛍️",
  other: "📌",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  salary:        "from-indigo-500 to-blue-600",
  freelance:     "from-violet-500 to-purple-600",
  investment:    "from-emerald-400 to-teal-500",
  gift:          "from-pink-400 to-rose-500",
  food:          "from-orange-400 to-amber-500",
  transport:     "from-cyan-400 to-blue-500",
  housing:       "from-blue-400 to-indigo-500",
  health:        "from-rose-400 to-pink-500",
  entertainment: "from-purple-400 to-violet-600",
  education:     "from-teal-400 to-emerald-500",
  shopping:      "from-fuchsia-400 to-purple-500",
  other:         "from-slate-400 to-slate-500",
};

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [tx, setTx] = useState<Transaction | null | undefined>(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getTransactionById(id).then(setTx).catch(() => setTx(null));
  }, [id]);

  async function handleDelete() {
    if (!tx) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(tx.id);
      router.push("/transactions");
    } catch (e) {
      setIsDeleting(false);
      alert(e instanceof Error ? e.message : "Gagal menghapus transaksi.");
    }
  }

  // Loading state
  if (tx === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (tx === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "var(--background)" }}>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl">
          🔍
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Transaksi tidak ditemukan
        </h2>
        <p className="text-sm text-slate-400">
          Transaksi ini mungkin sudah dihapus.
        </p>
        <Link
          href="/transactions"
          className="mt-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
        >
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  const isIncome = tx.type === "income";
  const gradient = CATEGORY_GRADIENTS[tx.category] ?? "from-slate-400 to-slate-500";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Kembali ke daftar transaksi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
            <h1 className="text-base font-bold text-white">Detail Transaksi</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/transactions/${tx.id}/edit`}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Edit transaksi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-rose-500 hover:bg-opacity-80 transition-colors"
              aria-label="Hapus transaksi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Hero amount card */}
        <div
          className={`relative rounded-3xl p-6 flex flex-col items-center gap-3 bg-gradient-to-br ${gradient} shadow-xl text-white overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-white absolute -top-10 -right-10" />
            <div className="w-24 h-24 rounded-full bg-white absolute -bottom-6 -left-6" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-3xl shadow-lg">
            {CATEGORY_ICONS[tx.category] ?? "📌"}
          </div>
          <span className="text-4xl font-black tracking-tight drop-shadow">
            {isIncome ? "+" : "-"}
            {formatCurrency(tx.amount)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/25 backdrop-blur">
              {isIncome ? "💚 Pemasukan" : "🔴 Pengeluaran"}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/25 backdrop-blur">
              {CATEGORY_LABELS[tx.category]}
            </span>
          </div>
        </div>

        {/* Detail rows */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-50 bg-gradient-to-r from-indigo-50 to-purple-50">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Informasi Transaksi</p>
          </div>
          <DetailRow label="Judul" value={tx.title} emoji="📝" />
          <DetailRow label="Kategori" value={CATEGORY_LABELS[tx.category]} emoji="🏷️" />
          <DetailRow label="Tanggal" value={formatDate(tx.date)} emoji="📅" />
          {tx.note && <DetailRow label="Catatan" value={tx.note} emoji="💬" />}
          <DetailRow
            label="Dicatat pada"
            emoji="🕐"
            value={new Date(tx.createdAt).toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/transactions/${tx.id}/edit`}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            ✏️ Edit Transaksi
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
          >
            🗑️ Hapus
          </button>
        </div>
      </main>

      {/* Delete confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Hapus transaksi?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">{tx.title}</span>{" "}
                  akan dihapus permanen dan tidak bisa dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border-2 border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-sm font-semibold text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-200 disabled:opacity-60"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 flex-shrink-0 w-32">
        {emoji && <span className="text-sm">{emoji}</span>}
        <span className="text-sm text-slate-400 font-medium">{label}</span>
      </div>
      <span className="text-sm text-slate-800 font-semibold text-right flex-1">
        {value}
      </span>
    </div>
  );
}
