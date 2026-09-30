import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import { getCurrentUser } from '../../lib/session';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [
    incomeResult,
    expenseResult,
    recentTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'income',
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'expense',
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          transactionDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        transactionDate: true,
      },
    }),
  ]);

  const totalIncome = Number(incomeResult._sum.amount ?? 0);
  const totalExpense = Number(expenseResult._sum.amount ?? 0);
  const balance = totalIncome - totalExpense;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        <header className="mb-8">
          <p className="text-sm text-gray-500">
            Selamat datang kembali
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Halo, {user.name} 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Berikut ringkasan kondisi keuanganmu.
          </p>
        </header>

        <section
          aria-label="Ringkasan keuangan"
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >

          <div className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
            <p className="text-sm text-blue-100">
              Saldo Saat Ini
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {formatRupiah(balance)}
            </h2>

            <p className="mt-3 text-sm text-blue-100">
              Total pemasukan dikurangi total pengeluaran.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Pemasukan
            </p>

            <h2 className="mt-3 text-2xl font-bold text-green-600">
              {formatRupiah(totalIncome)}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Pengeluaran
            </p>

            <h2 className="mt-3 text-2xl font-bold text-red-600">
              {formatRupiah(totalExpense)}
            </h2>
          </div>

        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaksi Terbaru
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Lima transaksi terbaru dari akunmu.
            </p>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center">

              <p className="font-medium text-gray-700">
                Belum ada transaksi.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Data transaksi akan muncul di sini setelah
                fitur transaksi diimplementasikan.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[640px] text-left text-sm">

                <thead className="border-b border-gray-200 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Tanggal
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Jenis
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Keterangan
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Nominal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentTransactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-100 last:border-0"
                      >

                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(
                            transaction.transactionDate,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={
                              transaction.type ===
                              'income'
                                ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                                : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'
                            }
                          >
                            {transaction.type ===
                            'income'
                              ? 'Pemasukan'
                              : 'Pengeluaran'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-900">
                          {transaction.description}
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            transaction.type ===
                            'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type ===
                          'income'
                            ? '+'
                            : '-'}{' '}
                          {formatRupiah(
                            Number(
                              transaction.amount,
                            ),
                          )}
                        </td>

                      </tr>
                    ),
                  )}
                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}