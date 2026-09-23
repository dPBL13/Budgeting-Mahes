export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "gift"
  | "food"
  | "transport"
  | "housing"
  | "health"
  | "entertainment"
  | "education"
  | "shopping"
  | "other";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO datetime string
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note?: string;
}

export const INCOME_CATEGORIES: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment",
  "gift",
  "other",
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: "Gaji",
  freelance: "Freelance",
  investment: "Investasi",
  gift: "Hadiah",
  food: "Makanan & Minuman",
  transport: "Transportasi",
  housing: "Tempat Tinggal",
  health: "Kesehatan",
  entertainment: "Hiburan",
  education: "Pendidikan",
  shopping: "Belanja",
  other: "Lainnya",
};
