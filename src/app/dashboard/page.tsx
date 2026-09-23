"use client";

import { useMemo, useState } from "react";

type TransactionType = "income" | "expense";

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: TransactionType;
  date: string;
};

const initialTransactions: Transaction[] = [
  {
    id: 1,
    title: "Uang saku bulanan",
    category: "Uang Saku",
    amount: 2500000,
    type: "income",
    date: "23 Sep 2026",
  },
  {
    id: 2,
    title: "Makan siang",
    category: "Makanan",
    amount: 25000,
    type: "expense",
    date: "23 Sep 2026",
  },
  {
    id: 3,
    title: "Transportasi",
    category: "Transportasi",
    amount: 15000,
    type: "expense",
    date: "22 Sep 2026",
  },
  {
    id: 4,
    title: "Freelance",
    category: "Penghasilan",
    amount: 500000,
    type: "income",
    date: "21 Sep 2026",
  },
  {
    id: 5,
    title: "Beli buku",
    category: "Pendidikan",
    amount: 120000,
    type: "expense",
    date: "20 Sep 2026",
  },
];

export default function DashboardPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [filter, setFilter] = useState<
    "all" | "income" | "expense"
  >("all");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    type: "expense" as TransactionType,
  });

  // =========================
  // CALCULATE SUMMARY
  // =========================

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  // =========================
  // FILTER
  // =========================

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;

    return transaction.type === filter;
  });

  // =========================
  // FORMAT RUPIAH
  // =========================

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // =========================
  // ADD TRANSACTION
  // =========================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.amount) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      type: form.type,
      date: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    setForm({
      title: "",
      category: "",
      amount: "",
      type: "expense",
    });

    setShowModal(false);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (id: number) => {
    const confirmDelete = confirm(
      "Apakah kamu yakin ingin menghapus transaksi ini?"
    );

    if (!confirmDelete) return;

    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Selamat datang kembali
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Halo, Haikal 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Kelola keuanganmu dengan lebih mudah.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Tambah Transaksi
          </button>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* SALDO */}

          <div className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
            <p className="text-sm text-blue-100">
              Saldo Saat Ini
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {formatRupiah(balance)}
            </h2>

            <p className="mt-3 text-sm text-blue-100">
              Total saldo berdasarkan transaksi kamu
            </p>
          </div>

          {/* PEMASUKAN */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total Pemasukan
              </p>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Pemasukan
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-green-600">
              {formatRupiah(totalIncome)}
            </h2>
          </div>

          {/* PENGELUARAN */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total Pengeluaran
              </p>

              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                Pengeluaran
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-red-600">
              {formatRupiah(totalExpense)}
            </h2>
          </div>
        </div>

        {/* ================= TRANSACTION ================= */}

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          {/* HEADER */}

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Transaksi Terbaru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Riwayat transaksi keuanganmu
              </p>
            </div>

            {/* FILTER */}

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Semua
              </button>

              <button
                onClick={() => setFilter("income")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Pemasukan
              </button>

              <button
                onClick={() => setFilter("expense")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="mt-6 overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="px-4 py-3">
                    Transaksi
                  </th>

                  <th className="px-4 py-3">
                    Kategori
                  </th>

                  <th className="px-4 py-3">
                    Tanggal
                  </th>

                  <th className="px-4 py-3">
                    Jenis
                  </th>

                  <th className="px-4 py-3 text-right">
                    Jumlah
                  </th>

                  <th className="px-4 py-3 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {transaction.title}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {transaction.category}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {transaction.date}
                      </td>

                      <td className="px-4 py-4">

                        {transaction.type === "income" ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Pemasukan
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Pengeluaran
                          </span>
                        )}

                      </td>

                      <td
                        className={`px-4 py-4 text-right font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income"
                          ? "+"
                          : "-"}{" "}
                        {formatRupiah(transaction.amount)}
                      </td>

                      <td className="px-4 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            onClick={() =>
                              alert(
                                `Edit transaksi: ${transaction.title}`
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                            onClick={() =>
                              handleDelete(transaction.id)
                            }
                          >
                            Hapus
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>
      </div>

      {/* ================= MODAL TAMBAH TRANSAKSI ================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tambah Transaksi
                </h2>

                <p className="text-sm text-gray-500">
                  Masukkan transaksi keuangan baru
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* JUDUL */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Transaksi
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Contoh: Makan siang"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* KATEGORI */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Kategori
                </label>

                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  placeholder="Contoh: Makanan"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* JUMLAH */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jumlah
                </label>

                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  placeholder="25000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* TIPE */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Jenis Transaksi
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as TransactionType,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="expense">
                    Pengeluaran
                  </option>

                  <option value="income">
                    Pemasukan
                  </option>
                </select>
              </div>

              {/* BUTTON */}

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Simpan
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}