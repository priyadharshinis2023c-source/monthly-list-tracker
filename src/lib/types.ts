export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  sheetId: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  category: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Sheet {
  id: string;
  name: string;
  month?: string | null;
  description?: string | null;
  currency: string;
  color: string;
  transactions?: Transaction[];
  createdAt: string | Date;
  updatedAt: string | Date;
  // Computed aggregations
  _count?: {
    transactions: number;
  };
  totalIncome?: number;
  totalExpense?: number;
  netBalance?: number;
}

export interface MonthlyChartData {
  sheetId: string;
  name: string;
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  type: TransactionType;
  percentage: number;
}
