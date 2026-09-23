"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransactionForm from "@/components/TransactionForm";
import { addTransaction } from "@/lib/transactionStore";
import type { CreateTransactionInput } from "@/types/transaction";

export default function CreateTransactionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(data: CreateTransactionInput) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await addTransaction(data);
      setSuccessMessage(`Transaksi "${data.title}" berhasil disimpan!`);
      setTimeout(() => {
        router.push("/transactions");
      }, 1200);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Gagal menyimpan transaksi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
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
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Tambah Transaksi
            </h1>
            <p className="text-xs text-indigo-200">Isi data transaksi baru</p>
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

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <TransactionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <p className="mt-4 text-xs text-center text-slate-400">
          Field bertanda <span className="text-rose-400 font-bold">*</span> wajib diisi.
        </p>
      </main>
    </div>
  );
}
