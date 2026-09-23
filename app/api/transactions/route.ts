import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TransactionCategory, TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<string>(["income", "expense"]);
const VALID_CATEGORIES = new Set<string>([
  "salary", "freelance", "investment", "gift",
  "food", "transport", "housing", "health",
  "entertainment", "education", "shopping", "other",
]);

// ── GET /api/transactions ─────────────────────────────────────────────────────
// Query params:
//   month   YYYY-MM  (optional) — filter by month
//   type    income|expense  (optional)
//   search  string  (optional) — case-insensitive title search
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");   // e.g. "2025-06"
  const type = searchParams.get("type");     // "income" | "expense"
  const search = searchParams.get("search"); // free text

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        ...(month && {
          date: { startsWith: month },
        }),
        ...(type && VALID_TYPES.has(type) && {
          type,
        }),
        ...(search && {
          title: { contains: search, mode: "insensitive" },
        }),
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error("[GET /api/transactions]", err);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi." },
      { status: 500 }
    );
  }
}

// ── POST /api/transactions ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { title, amount, type, category, date, note } = body as Record<
    string,
    unknown
  >;

  // Validate
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Nominal harus berupa angka positif." },
      { status: 400 }
    );
  }
  if (!type || !VALID_TYPES.has(type as string)) {
    return NextResponse.json(
      { error: "Tipe transaksi tidak valid." },
      { status: 400 }
    );
  }
  if (!category || !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json(
      { error: "Kategori tidak valid." },
      { status: 400 }
    );
  }
  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Tanggal harus dalam format YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        title: (title as string).trim(),
        amount: amount as number,
        type: type as TransactionType,
        category: category as TransactionCategory,
        date: date as string,
        note: typeof note === "string" && note.trim() ? note.trim() : null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("[POST /api/transactions]", err);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi." },
      { status: 500 }
    );
  }
}
