"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransactionForm from "@/components/TransactionForm";
import {
  getTransactionById,
  updateTransaction,
} from "@/lib/transactionStore";
import type { CreateTransactionInput, Transaction } from "@/types/transaction";

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [tx, setTx] = useState<Transaction | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getTransactionById(id).then(setTx).catch(() => setTx(null));
  }, [id]);

  async function handleSubmit(data: CreateTransactionInput) {
    if (!tx) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await updateTransaction(tx.id, data);
      setSuccessMessage("Transaksi berhasil diperbarui!");
      setTimeout(() => {
        router.push(`/transactions/${tx.id}`);
      }, 1000);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Gagal memperbarui transaksi.");
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Loading ── */
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

  /* ── Not found ── */
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

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/transactions/${tx.id}`}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Kembali ke detail transaksi"
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
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Edit Transaksi
            </h1>
            <p className="text-xs text-indigo-200 truncate max-w-xs">{tx.title}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Success banner */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-4 py-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              ✓
            </div>
            <p className="text-sm text-emerald-700 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-4 shadow-sm">
            <span className="text-rose-500 text-lg flex-shrink-0">⚠️</span>
            <p className="text-sm text-rose-700 font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Change indicator banner */}
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-4 py-3">
          <span className="text-amber-500 text-base flex-shrink-0">✏️</span>
          <p className="text-xs text-amber-700">
            Mengubah data transaksi.{" "}
            <span className="font-semibold">Waktu pencatatan asli tetap dipertahankan.</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <TransactionForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValues={{
              title: tx.title,
              amount: String(tx.amount),
              type: tx.type,
              category: tx.category,
              date: tx.date,
              note: tx.note ?? "",
            }}
            submitLabel="Simpan Perubahan"
          />
        </div>

        <p className="mt-4 text-xs text-center text-slate-400">
          Field bertanda <span className="text-rose-400 font-bold">*</span> wajib diisi.
        </p>
      </main>
    </div>
  );
}
