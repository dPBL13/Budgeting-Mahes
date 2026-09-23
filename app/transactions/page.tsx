"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import TransactionList, { formatCurrency } from "@/components/TransactionList";
import { getTransactions, deleteTransaction } from "@/lib/transactionStore";
import type { Transaction } from "@/types/transaction";

const PAGE_SIZE = 20;

/** Returns "YYYY-MM" for a given Date */
function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Format "YYYY-MM" → "Juni 2025" */
function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [monthKey, setMonthKey] = useState<string>(toMonthKey(new Date()));
  const [page, setPage] = useState(1);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setAllTransactions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat transaksi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Refresh list when tab becomes visible (user navigated back from create)
  useEffect(() => {
    function handleFocus() {
      loadTransactions();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadTransactions]);

  // Build sorted list of unique months present in data (for the month picker)
  const availableMonths = useMemo(() => {
    const keys = new Set(allTransactions.map((t) => t.date.slice(0, 7)));
    keys.add(toMonthKey(new Date()));
    return Array.from(keys).sort((a, b) => (a > b ? -1 : 1));
  }, [allTransactions]);

  // Make sure selected month stays valid when data changes
  useEffect(() => {
    if (!availableMonths.includes(monthKey)) {
      setMonthKey(availableMonths[0] ?? toMonthKey(new Date()));
    }
  }, [availableMonths, monthKey]);

  // Apply all filters client-side (data already loaded)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTransactions.filter((t) => {
      if (t.date.slice(0, 7) !== monthKey) return false;
      if (filter !== "all" && t.type !== filter) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allTransactions, filter, search, monthKey]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filter, search, monthKey]);

  // Paginate
  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );
  const hasMore = filtered.length > paginated.length;

  // Summary (always over the whole month, ignoring type filter & search)
  const monthTransactions = useMemo(
    () => allTransactions.filter((t) => t.date.slice(0, 7) === monthKey),
    [allTransactions, monthKey]
  );

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setAllTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus transaksi.");
    }
  }

  function handlePrevMonth() {
    const idx = availableMonths.indexOf(monthKey);
    if (idx < availableMonths.length - 1) setMonthKey(availableMonths[idx + 1]);
  }

  function handleNextMonth() {
    const idx = availableMonths.indexOf(monthKey);
    if (idx > 0) setMonthKey(availableMonths[idx - 1]);
  }

  const canPrev = availableMonths.indexOf(monthKey) < availableMonths.length - 1;
  const canNext = availableMonths.indexOf(monthKey) > 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ── Header with gradient ── */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Kembali ke beranda"
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
              <h1 className="text-base font-bold text-white leading-tight">Transaksi</h1>
              <p className="text-xs text-indigo-200">{formatMonthLabel(monthKey)}</p>
            </div>
          </div>
          <Link
            href="/transactions/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-all"
          >
            <span aria-hidden className="text-base leading-none">+</span>
            <span>Tambah</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
            <span className="text-rose-500">⚠️</span>
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              onClick={loadTransactions}
              className="ml-auto text-xs font-semibold text-rose-600 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* ── Month navigator ── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-indigo-100 px-4 py-3 shadow-sm">
          <button
            onClick={handlePrevMonth}
            disabled={!canPrev}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Bulan sebelumnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="text-center">
            <span className="text-sm font-bold text-slate-800">
              {formatMonthLabel(monthKey)}
            </span>
            <p className="text-xs text-slate-400">{monthTransactions.length} transaksi</p>
          </div>
          <button
            onClick={handleNextMonth}
            disabled={!canNext}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Bulan berikutnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 flex flex-col gap-1 shadow-lg card-glow-primary">
            <span className="text-xs text-indigo-200 font-semibold">Saldo</span>
            <span className="text-sm font-bold text-white truncate">
              {isLoading ? "..." : formatCurrency(balance)}
            </span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 flex flex-col gap-1 shadow-lg card-glow-income">
            <span className="text-xs text-emerald-100 font-semibold">Masuk</span>
            <span className="text-sm font-bold text-white truncate">
              {isLoading ? "..." : formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 p-4 flex flex-col gap-1 shadow-lg card-glow-expense">
            <span className="text-xs text-rose-100 font-semibold">Keluar</span>
            <span className="text-sm font-bold text-white truncate">
              {isLoading ? "..." : formatCurrency(totalExpense)}
            </span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border-2 border-indigo-100 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-400 transition-colors"
              aria-label="Hapus pencarian"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? f === "income"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : f === "expense"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-500 border-2 border-slate-100 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              {f === "all" ? "Semua" : f === "income" ? "💚 Masuk" : "🔴 Keluar"}
            </button>
          ))}
          {(search || filter !== "all") && (
            <span className="ml-auto flex items-center text-xs font-medium text-slate-400 bg-white rounded-xl px-3 border border-slate-100">
              {filtered.length} hasil
            </span>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 bg-slate-100 rounded-full w-3/5" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-2/5" />
                </div>
                <div className="h-4 bg-slate-100 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : (
          <TransactionList transactions={paginated} onDelete={handleDelete} />
        )}

        {/* ── Load more ── */}
        {!isLoading && hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full rounded-2xl border-2 border-indigo-100 bg-white py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
          >
            Tampilkan lebih banyak ({filtered.length - paginated.length} lagi) ↓
          </button>
        )}
      </main>
    </div>
  );
}
