"use client";

import Link from "next/link";
import type { Transaction } from "@/types/transaction";
import { CATEGORY_LABELS } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Per-category icon & color palette
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

const CATEGORY_COLORS: Record<string, string> = {
  salary:        "bg-indigo-100 text-indigo-600",
  freelance:     "bg-violet-100 text-violet-600",
  investment:    "bg-emerald-100 text-emerald-600",
  gift:          "bg-pink-100 text-pink-600",
  food:          "bg-orange-100 text-orange-600",
  transport:     "bg-cyan-100 text-cyan-600",
  housing:       "bg-blue-100 text-blue-600",
  health:        "bg-rose-100 text-rose-600",
  entertainment: "bg-purple-100 text-purple-600",
  education:     "bg-teal-100 text-teal-600",
  shopping:      "bg-fuchsia-100 text-fuchsia-600",
  other:         "bg-slate-100 text-slate-500",
};

export default function TransactionList({
  transactions,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl mb-4 shadow-inner">
          📭
        </div>
        <h3 className="text-base font-bold text-slate-700 mb-1">
          Belum ada transaksi
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Mulai catat pemasukan atau pengeluaran pertamamu.
        </p>
        <Link
          href="/transactions/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:-translate-y-0.5"
        >
          ✨ Tambah Transaksi
        </Link>
      </div>
    );
  }

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>(
    (acc, tx) => {
      const key = tx.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex flex-col gap-5">
      {sortedDates.map((date) => {
        const dayTransactions = grouped[date];
        const dayTotal = dayTransactions.reduce((sum, tx) => {
          return tx.type === "income" ? sum + tx.amount : sum - tx.amount;
        }, 0);

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {formatDate(date)}
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  dayTotal >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {dayTotal >= 0 ? "+" : ""}
                {formatCurrency(dayTotal)}
              </span>
            </div>

            {/* Transaction items */}
            <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm divide-y divide-slate-50">
              {dayTransactions.map((tx) => {
                const iconColor = CATEGORY_COLORS[tx.category] ?? "bg-slate-100 text-slate-500";
                const icon = CATEGORY_ICONS[tx.category] ?? "📌";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-indigo-50/40 transition-colors group"
                  >
                    {/* Category icon */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base flex-shrink-0 ${iconColor}`}
                      aria-label={CATEGORY_LABELS[tx.category]}
                    >
                      {icon}
                    </div>

                    {/* Info */}
                    <Link
                      href={`/transactions/${tx.id}`}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {tx.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {CATEGORY_LABELS[tx.category]}
                        {tx.note && (
                          <span className="text-slate-300"> · {tx.note}</span>
                        )}
                      </p>
                    </Link>

                    {/* Amount */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "masuk" : "keluar"}
                      </span>
                    </div>

                    {/* Delete button */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="opacity-0 group-hover:opacity-100 ml-1 w-7 h-7 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        aria-label="Hapus transaksi"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
