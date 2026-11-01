"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Sheet, Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Award,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

interface AnalyticsDashboardProps {
  sheets: Sheet[];
  activeSheetTransactions: Transaction[];
  activeSheetName: string;
  currency?: string;
}

const CATEGORY_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#f43f5e",
  "#eab308",
  "#06b6d4",
];

export function AnalyticsDashboard({
  sheets,
  activeSheetTransactions,
  activeSheetName,
  currency = "$",
}: AnalyticsDashboardProps) {
  // 1. Prepare monthly comparison data across all sheets
  const monthlyData = useMemo(() => {
    return sheets.map((sheet) => ({
      name: sheet.name,
      month: sheet.month || sheet.name,
      Income: sheet.totalIncome ?? 0,
      Expense: sheet.totalExpense ?? 0,
      Net: sheet.netBalance ?? 0,
    })).reverse(); // chronological if ordered by newest first
  }, [sheets]);

  // 2. Prepare Category breakdown from active sheet or all transactions
  const categoryData = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    activeSheetTransactions.forEach((t) => {
      if (t.type === "EXPENSE") {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(expenseMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeSheetTransactions]);

  // 3. Overall lifetime stats
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let highestIncomeSheet = { name: "N/A", amount: 0 };
    let highestExpenseSheet = { name: "N/A", amount: 0 };

    sheets.forEach((s) => {
      const inc = s.totalIncome || 0;
      const exp = s.totalExpense || 0;
      totalIncome += inc;
      totalExpense += exp;

      if (inc > highestIncomeSheet.amount) {
        highestIncomeSheet = { name: s.name, amount: inc };
      }
      if (exp > highestExpenseSheet.amount) {
        highestExpenseSheet = { name: s.name, amount: exp };
      }
    });

    const net = totalIncome - totalExpense;
    const avgIncome = sheets.length ? totalIncome / sheets.length : 0;
    const avgExpense = sheets.length ? totalExpense / sheets.length : 0;

    return {
      totalIncome,
      totalExpense,
      net,
      highestIncomeSheet,
      highestExpenseSheet,
      avgIncome,
      avgExpense,
    };
  }, [sheets]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-mono">
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>Monthly Money Analytics & Charts</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Compare monthly income vs expenses, track cashflow trends, and analyze spending patterns.
          </p>
        </div>
      </div>

      {/* High-level stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total All-Time Income</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            +{formatCurrency(stats.totalIncome, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all {sheets.length} sheets</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total All-Time Expenses</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            -{formatCurrency(stats.totalExpense, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total outgoing money</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Monthly Income</div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">
            {formatCurrency(stats.avgIncome, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Per active month</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Monthly Expenses</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {formatCurrency(stats.avgExpense, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Per active month</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Comparison Bar Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Monthly Income vs Expenses Comparison</span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing money got (green) vs money spent (rose) across all sheets
              </p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No sheets data to graph yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                  />
                  <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} name="Received (Got)" />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Sent (Spend)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Donut */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Spending by Category</span>
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {activeSheetName} expense breakdown
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-500 text-xs text-center py-8">
                No expenses recorded for this sheet yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value), currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Legend list */}
          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryData.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-100 flex-shrink-0">
                  {formatCurrency(item.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Profit & Savings Trend Line */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Net Monthly Balance Trend</span>
          </h2>
          <p className="text-xs text-slate-400">
            Net savings progression (Income minus Expenses)
          </p>
        </div>

        <div className="h-64 w-full">
          {monthlyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${currency}${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Net"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#6366f1", stroke: "#0f172a", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Net Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
