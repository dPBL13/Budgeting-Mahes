/**
 * transactionStore.ts
 *
 * Thin client-side helpers that talk to the API routes backed by PostgreSQL.
 * All functions are async and throw on network/server errors so callers can
 * handle them (or let them bubble up to an error boundary).
 */

import type { Transaction, CreateTransactionInput } from "@/types/transaction";

const BASE = "/api/transactions";

// ── helpers ──────────────────────────────────────────────────────────────────

function toTransaction(raw: Record<string, unknown>): Transaction {
  return {
    id: raw.id as string,
    title: raw.title as string,
    amount: raw.amount as number,
    type: raw.type as Transaction["type"],
    category: raw.category as Transaction["category"],
    date: raw.date as string,
    note: raw.note as string | undefined,
    // Prisma returns a Date object; normalise to ISO string
    createdAt:
      raw.createdAt instanceof Date
        ? raw.createdAt.toISOString()
        : (raw.createdAt as string),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `HTTP ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

// ── public API ───────────────────────────────────────────────────────────────

/** Fetch all transactions, optionally filtered by month / type / search. */
export async function getTransactions(opts?: {
  month?: string;   // "YYYY-MM"
  type?: "income" | "expense";
  search?: string;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (opts?.month)  params.set("month",  opts.month);
  if (opts?.type)   params.set("type",   opts.type);
  if (opts?.search) params.set("search", opts.search);

  const url = params.size ? `${BASE}?${params}` : BASE;
  const res = await fetch(url, { cache: "no-store" });
  const rows = await handleResponse<Record<string, unknown>[]>(res);
  return rows.map(toTransaction);
}

/** Fetch a single transaction by id, or null if 404. */
export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const res = await fetch(`${BASE}/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const row = await handleResponse<Record<string, unknown>>(res);
  return toTransaction(row);
}

/** Create a new transaction; returns the persisted record. */
export async function addTransaction(
  data: CreateTransactionInput
): Promise<Transaction> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row = await handleResponse<Record<string, unknown>>(res);
  return toTransaction(row);
}

/** Update an existing transaction; returns the updated record. */
export async function updateTransaction(
  id: string,
  patch: CreateTransactionInput
): Promise<Transaction> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const row = await handleResponse<Record<string, unknown>>(res);
  return toTransaction(row);
}

/** Delete a transaction by id. */
export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (res.status === 204 || res.ok) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(
    (body as { error?: string }).error ?? `HTTP ${res.status}`
  );
}
