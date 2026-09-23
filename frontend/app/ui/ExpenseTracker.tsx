'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: string;
  description: string;
  transactionDate: string;
};

type Summary = {
  income: number;
  expense: number;
  balance: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan.");
  }

  return data as T;
}

export default function ExpenseTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");

  const [summary, setSummary] = useState<Summary>({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    transactionDate: today(),
  });

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedFilter = localStorage.getItem("budgetmhs-filter");
    if (
      savedFilter === "all" ||
      savedFilter === "income" ||
      savedFilter === "expense"
    ) {
      setFilter(savedFilter);
    }

    api<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    loadTransactions(filter);
  }, [user, filter]);

  async function loadDashboard() {
    try {
      const data = await api<{
        summary: Summary;
        latestTransactions: Transaction[];
      }>("/dashboard");
      setSummary(data.summary);
    } catch {
      setUser(null);
    }
  }

  async function loadTransactions(currentFilter = filter) {
    try {
      const data = await api<{ transactions: Transaction[] }>(
        `/transactions?type=${currentFilter}`
      );
      setTransactions(data.transactions);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengambil data.");
    }
  }

  function updateFilter(value: "all" | "income" | "expense") {
    setFilter(value);
    localStorage.setItem("budgetmhs-filter", value);
    document.cookie = `budgetmhs_filter=${value}; Path=/; Max-Age=2592000; SameSite=Lax`;
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setAuthError("");

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const body =
        authMode === "login"
          ? authForm
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            };

      const data = await api<{ user: User }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setUser(data.user);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Gagal.");
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    setTransactions([]);
    setSummary({ income: 0, expense: 0, balance: 0 });
  }

  async function saveTransaction(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        description: form.description,
        transactionDate: form.transactionDate,
      };

      if (editingId) {
        await api(`/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Transaksi berhasil diubah.");
      } else {
        await api("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Transaksi berhasil ditambahkan.");
      }

      resetForm();
      await Promise.all([loadDashboard(), loadTransactions()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan.");
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      type: "expense",
      amount: "",
      description: "",
      transactionDate: today(),
    });
  }

  function editTransaction(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      transactionDate: transaction.transactionDate.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTransaction(id: number) {
    if (!window.confirm("Hapus transaksi ini?")) return;

    try {
      await api(`/transactions/${id}`, { method: "DELETE" });
      setMessage("Transaksi berhasil dihapus.");
      await Promise.all([loadDashboard(), loadTransactions()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }

  const balanceLabel = useMemo(
    () => (summary.balance >= 0 ? "Saldo" : "Defisit"),
    [summary.balance]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Memuat BudgetMhs...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              BudgetMhs
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {authMode === "login" ? "Selamat datang kembali" : "Buat akun"}
            </h1>
            <p className="mt-2 text-slate-500">
              Kelola pemasukan dan pengeluaranmu dengan sederhana.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "register" && (
              <input
                required
                placeholder="Nama"
                value={authForm.name}
                onChange={(e) =>
                  setAuthForm({ ...authForm, name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              />
            )}
            <input
              required
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
            <input
              required
              type="password"
              minLength={6}
              placeholder="Password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />

            {authError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </p>
            )}

            <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700">
              {authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          <button
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
            }}
            className="mt-5 w-full text-sm text-indigo-600 hover:underline"
          >
            {authMode === "login"
              ? "Belum punya akun? Register"
              : "Sudah punya akun? Login"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold text-indigo-600">BudgetMhs</p>
            <p className="text-sm text-slate-500">Expense Tracker Mahasiswa</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              Halo, <strong>{user.name}</strong>
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{balanceLabel}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatRupiah(summary.balance)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Pemasukan</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatRupiah(summary.income)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {formatRupiah(summary.expense)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={saveTransaction}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-slate-500 hover:underline"
                >
                  Batal
                </button>
              )}
            </div>

            <div className="space-y-4">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "income" | "expense",
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>

              <input
                required
                min="1"
                type="number"
                placeholder="Nominal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                required
                placeholder="Keterangan"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                required
                type="date"
                value={form.transactionDate}
                onChange={(e) =>
                  setForm({ ...form, transactionDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700">
                {editingId ? "Simpan Perubahan" : "Tambah Transaksi"}
              </button>
            </div>

            {message && (
              <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                {message}
              </p>
            )}
          </form>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Riwayat Transaksi</h2>
                <p className="text-sm text-slate-500">
                  Hanya transaksi milik akun ini yang ditampilkan.
                </p>
              </div>

              <select
                value={filter}
                onChange={(e) =>
                  updateFilter(
                    e.target.value as "all" | "income" | "expense"
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Tanggal</th>
                    <th className="px-3 py-3">Jenis</th>
                    <th className="px-3 py-3">Keterangan</th>
                    <th className="px-3 py-3 text-right">Nominal</th>
                    <th className="px-3 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="px-3 py-4">
                        {new Date(
                          `${transaction.transactionDate.slice(0, 10)}T00:00:00`
                        ).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === "income"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "Pemasukan"
                            : "Pengeluaran"}
                        </span>
                      </td>
                      <td className="px-3 py-4">{transaction.description}</td>
                      <td className="px-3 py-4 text-right font-semibold">
                        {formatRupiah(transaction.amount)}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editTransaction(transaction)}
                            className="rounded-lg border px-3 py-1.5 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-rose-600 hover:bg-rose-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  Belum ada transaksi.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
