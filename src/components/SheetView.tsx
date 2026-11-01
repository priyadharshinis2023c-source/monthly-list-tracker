"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { Sheet, Transaction, TransactionType } from "@/lib/types";
import { formatCurrency, formatDate, getTodayDateString, CATEGORIES } from "@/lib/utils";
import { SummaryCards } from "./SummaryCards";

interface SheetViewProps {
  sheet: Sheet;
  transactions: Transaction[];
  onAddTransaction: (data: {
    sheetId: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
  }) => Promise<void>;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onEditSheet: () => void;
  onDeleteSheet: () => void;
  onOpenModal: () => void;
}

export function SheetView({
  sheet,
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onEditSheet,
  onDeleteSheet,
  onOpenModal,
}: SheetViewProps) {
  // Inline quick entry form state
  const [quickDate, setQuickDate] = useState(getTodayDateString());
  const [quickDesc, setQuickDesc] = useState("");
  const [quickAmount, setQuickAmount] = useState("");
  const [quickType, setQuickType] = useState<TransactionType>("INCOME");
  const [quickCategory, setQuickCategory] = useState("Salary / Income");
  const [inlineLoading, setInlineLoading] = useState(false);

  // Filters & sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [sortField, setSortField] = useState<"date" | "amount" | "description">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Handle quick amount input with +/-
  const handleQuickAmountChange = (val: string) => {
    setQuickAmount(val);
    const trimmed = val.trim();
    if (trimmed.startsWith("-")) {
      setQuickType("EXPENSE");
      if (quickCategory === "Salary / Income") setQuickCategory("Food & Groceries");
    } else if (trimmed.startsWith("+")) {
      setQuickType("INCOME");
      if (quickCategory === "Food & Groceries") setQuickCategory("Salary / Income");
    }
  };

  // Inline submit
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDesc.trim()) return;

    const cleanStr = quickAmount.replace(/[^\d.-]/g, "");
    const parsedAmount = Math.abs(parseFloat(cleanStr));
    if (isNaN(parsedAmount) || parsedAmount === 0) return;

    let finalType = quickType;
    if (cleanStr.startsWith("-")) {
      finalType = "EXPENSE";
    }

    try {
      setInlineLoading(true);
      await onAddTransaction({
        sheetId: sheet.id,
        date: quickDate || getTodayDateString(),
        description: quickDesc.trim(),
        amount: parsedAmount,
        type: finalType,
        category: quickCategory || "General",
      });

      // Clear input fields
      setQuickDesc("");
      setQuickAmount("");
    } finally {
      setInlineLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Date", "Description", "Type", "Category", "Amount", "Signed Amount"];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === "INCOME" ? "Received (+)" : "Sent (-)",
      `"${t.category}"`,
      t.amount,
      t.type === "INCOME" ? `+${t.amount}` : `-${t.amount}`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${sheet.name.replace(/\s+/g, "_")}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort items
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "date") {
      const cmp = a.date.localeCompare(b.date);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortField === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sortField === "description") {
      const cmp = a.description.localeCompare(b.description);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  // Calculate live filtered totals
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === "INCOME") totalIncome += t.amount;
    else totalExpense += t.amount;
  }
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Sheet Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {sheet.name}
            </h1>
            {sheet.month && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {sheet.month}
              </span>
            )}
          </div>
          {sheet.description && (
            <p className="mt-1 text-sm text-slate-400">{sheet.description}</p>
          )}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download Sheet as CSV spreadsheet"
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={onEditSheet}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Sheet</span>
          </button>
          <button
            onClick={onDeleteSheet}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Sheet</span>
          </button>
        </div>
      </div>

      {/* Summary Cards for this Sheet */}
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
        transactionCount={transactions.length}
        currency={sheet.currency}
      />

      {/* Fast Inline Entry Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Entry (+ Received / - Sent)
          </span>
          <button
            type="button"
            onClick={onOpenModal}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            Detailed Entry Modal
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Date */}
          <div className="sm:col-span-2">
            <input
              type="date"
              required
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              placeholder="Description (e.g. Salary, Rent, Coffee, Client pay)"
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Amount with +/- */}
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder={`Amount (+ / -) ${sheet.currency}`}
              value={quickAmount}
              onChange={(e) => handleQuickAmountChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Toggle Pill */}
          <div className="sm:col-span-2 flex items-center bg-slate-950 rounded-xl border border-slate-700 p-0.5">
            <button
              type="button"
              onClick={() => setQuickType("INCOME")}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                quickType === "INCOME"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              + Got
            </button>
            <button
              type="button"
              onClick={() => setQuickType("EXPENSE")}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                quickType === "EXPENSE"
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              - Sent
            </button>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={inlineLoading}
              className={`w-full h-full min-h-[34px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white shadow-md transition-all disabled:opacity-50 ${
                quickType === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{inlineLoading ? "Adding..." : "Add Row"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Spreadsheet Table & Search Filter Header */}
      <div className="glass-card rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex-1 flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("INCOME")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === "INCOME" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                + Received
              </button>
              <button
                onClick={() => setTypeFilter("EXPENSE")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === "EXPENSE" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                - Sent
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {sorted.length} of {transactions.length} rows
          </div>
        </div>

        {/* Transactions Spreadsheet Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th
                  onClick={() => {
                    if (sortField === "date") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else {
                      setSortField("date");
                      setSortOrder("desc");
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === "description") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else {
                      setSortField("description");
                      setSortOrder("asc");
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4">Flow Type</th>
                <th
                  onClick={() => {
                    if (sortField === "amount") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else {
                      setSortField("amount");
                      setSortOrder("desc");
                    }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount ({sheet.currency})</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-400">No transactions found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Use the quick entry bar above to add your first transaction.
                    </p>
                  </td>
                </tr>
              ) : (
                sorted.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-xs">
                      {formatDate(t.date)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {t.description}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {t.category}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {t.type === "INCOME" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Received</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Sent</span>
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        t.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount, sheet.currency)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(t)}
                          title="Edit transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          title="Delete transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer with Column Totals */}
            {sorted.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-900 font-semibold text-xs sm:text-sm">
                  <td colSpan={4} className="py-3 px-4 text-right text-slate-300">
                    Net Balance Total for Filtered Records:
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-extrabold text-base ${
                      netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatCurrency(netBalance, sheet.currency)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
