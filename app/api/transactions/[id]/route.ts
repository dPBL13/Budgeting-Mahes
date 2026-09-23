import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TransactionCategory, TransactionType } from "@/types/transaction";

const VALID_TYPES = new Set<string>(["income", "expense"]);
const VALID_CATEGORIES = new Set<string>([
  "salary", "freelance", "investment", "gift",
  "food", "transport", "housing", "health",
  "entertainment", "education", "shopping", "other",
]);

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/transactions/:id ─────────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  try {
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (err) {
    console.error(`[GET /api/transactions/${id}]`, err);
    return NextResponse.json(
      { error: "Gagal mengambil transaksi." },
      { status: 500 }
    );
  }
}

// ── PATCH /api/transactions/:id ───────────────────────────────────────────────
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

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

  // Validate only provided fields
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return NextResponse.json({ error: "Judul tidak valid." }, { status: 400 });
  }
  if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
    return NextResponse.json(
      { error: "Nominal harus berupa angka positif." },
      { status: 400 }
    );
  }
  if (type !== undefined && !VALID_TYPES.has(type as string)) {
    return NextResponse.json(
      { error: "Tipe transaksi tidak valid." },
      { status: 400 }
    );
  }
  if (category !== undefined && !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json({ error: "Kategori tidak valid." }, { status: 400 });
  }
  if (
    date !== undefined &&
    (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
  ) {
    return NextResponse.json(
      { error: "Tanggal harus dalam format YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: (title as string).trim() }),
        ...(amount !== undefined && { amount: amount as number }),
        ...(type !== undefined && { type: type as TransactionType }),
        ...(category !== undefined && { category: category as TransactionCategory }),
        ...(date !== undefined && { date: date as string }),
        ...(note !== undefined && {
          note: typeof note === "string" && note.trim() ? note.trim() : null,
        }),
      },
    });

    return NextResponse.json(transaction);
  } catch (err: unknown) {
    // P2025 = record not found
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }
    console.error(`[PATCH /api/transactions/${id}]`, err);
    return NextResponse.json(
      { error: "Gagal memperbarui transaksi." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/transactions/:id ──────────────────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  try {
    await prisma.transaction.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }
    console.error(`[DELETE /api/transactions/${id}]`, err);
    return NextResponse.json(
      { error: "Gagal menghapus transaksi." },
      { status: 500 }
    );
  }
}
