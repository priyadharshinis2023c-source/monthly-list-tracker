import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "$"): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return `${isNegative ? "-" : ""}${currency}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export const CATEGORIES = [
  { name: "Salary / Income", type: "INCOME", color: "bg-emerald-500" },
  { name: "Freelance / Business", type: "INCOME", color: "bg-teal-500" },
  { name: "Investments / Dividends", type: "INCOME", color: "bg-cyan-500" },
  { name: "Gifts / Bonus", type: "INCOME", color: "bg-indigo-500" },
  { name: "Other Income", type: "INCOME", color: "bg-blue-500" },
  { name: "Housing & Rent", type: "EXPENSE", color: "bg-rose-500" },
  { name: "Food & Groceries", type: "EXPENSE", color: "bg-orange-500" },
  { name: "Utilities & Bills", type: "EXPENSE", color: "bg-amber-500" },
  { name: "Transportation & Fuel", type: "EXPENSE", color: "bg-yellow-500" },
  { name: "Shopping & Personal", type: "EXPENSE", color: "bg-pink-500" },
  { name: "Entertainment & Leisure", type: "EXPENSE", color: "bg-purple-500" },
  { name: "Healthcare & Medical", type: "EXPENSE", color: "bg-red-500" },
  { name: "Education & Courses", type: "EXPENSE", color: "bg-sky-500" },
  { name: "Other Expense", type: "EXPENSE", color: "bg-slate-500" },
];
