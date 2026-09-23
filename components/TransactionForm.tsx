"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CreateTransactionInput,
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/types/transaction";

export interface TransactionFormValues {
  title: string;
  amount: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note: string;
}

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => void;
  isLoading?: boolean;
  /** Pre-fill all fields when editing an existing transaction. */
  initialValues?: Partial<TransactionFormValues>;
  /** Label override for the submit button. */
  submitLabel?: string;
}

const today = new Date().toISOString().split("T")[0];

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

export default function TransactionForm({
  onSubmit,
  isLoading = false,
  initialValues,
  submitLabel,
}: TransactionFormProps) {
  const router = useRouter();

  const [type, setType] = useState<TransactionType>(
    initialValues?.type ?? "expense"
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [amount, setAmount] = useState(initialValues?.amount ?? "");
  const [category, setCategory] = useState<TransactionCategory>(
    initialValues?.category ?? "other"
  );
  const [date, setDate] = useState(initialValues?.date ?? today);
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    // Reset category only when it no longer exists in the new type's list
    const nextList =
      newType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!nextList.includes(category)) setCategory("other");
  }

  function validate(): boolean {
    const next: Partial<Record<string, string>> = {};
    if (!title.trim()) next.title = "Judul transaksi wajib diisi.";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      next.amount = "Nominal harus berupa angka positif.";
    if (!date) next.date = "Tanggal wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      note: note.trim() || undefined,
    });
  }

  const defaultSubmitLabel =
    submitLabel ?? (initialValues ? "Simpan Perubahan" : "Simpan Transaksi");

  const isIncome = type === "income";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Transaction type toggle */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Jenis Transaksi
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${
              type === "expense"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200"
                : "bg-slate-50 text-slate-500 border-2 border-slate-200 hover:border-rose-200 hover:text-rose-500"
            }`}
          >
            🔴 Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all ${
              type === "income"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200"
                : "bg-slate-50 text-slate-500 border-2 border-slate-200 hover:border-emerald-200 hover:text-emerald-500"
            }`}
          >
            💚 Pemasukan
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
        >
          Judul Transaksi <span className="text-rose-500 normal-case">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Makan siang, Gaji bulan ini"
          className={`w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${
            errors.title
              ? "border-rose-400 focus:ring-rose-100"
              : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
          }`}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            ⚠️ {errors.title}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
        >
          Nominal (Rp) <span className="text-rose-500 normal-case">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold text-slate-400">
            Rp
          </span>
          <input
            id="amount"
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`w-full rounded-2xl border-2 px-4 py-3 pl-12 text-sm outline-none transition-all focus:ring-4 ${
              errors.amount
                ? "border-rose-400 focus:ring-rose-100"
                : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            ⚠️ {errors.amount}
          </p>
        )}
      </div>

      {/* Category + Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Kategori
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm pointer-events-none">
              {CATEGORY_ICONS[category] ?? "📌"}
            </span>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as TransactionCategory)
              }
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 pl-10 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 appearance-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Tanggal <span className="text-rose-500 normal-case">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${
              errors.date
                ? "border-rose-400 focus:ring-rose-100"
                : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
            }`}
          />
          {errors.date && (
            <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
              ⚠️ {errors.date}
            </p>
          )}
        </div>
      </div>

      {/* Note */}
      <div>
        <label
          htmlFor="note"
          className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
        >
          Catatan{" "}
          <span className="text-slate-400 font-normal normal-case">(opsional)</span>
        </label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambahkan catatan tambahan..."
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm outline-none resize-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-2xl border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 ${
            isIncome
              ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-200"
              : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-rose-200"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Menyimpan...
            </span>
          ) : (
            `✓ ${defaultSubmitLabel}`
          )}
        </button>
      </div>
    </form>
  );
}
