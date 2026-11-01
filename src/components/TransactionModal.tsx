"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { Transaction, TransactionType } from "@/lib/types";
import { getTodayDateString, CATEGORIES } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  sheetId: string;
  currency?: string;
  onClose: () => void;
  onSave: (transactionData: {
    sheetId: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
  }) => Promise<void>;
  editTransaction?: Transaction | null;
}

export function TransactionModal({
  isOpen,
  sheetId,
  currency = "$",
  onClose,
  onSave,
  editTransaction,
}: TransactionModalProps) {
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [type, setType] = useState<TransactionType>("INCOME");
  const [category, setCategory] = useState("Salary / Income");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editTransaction) {
      setDate(editTransaction.date);
      setDescription(editTransaction.description);
      setAmountStr(String(editTransaction.amount));
      setType(editTransaction.type);
      setCategory(editTransaction.category || "General");
    } else {
      setDate(getTodayDateString());
      setDescription("");
      setAmountStr("");
      setType("INCOME");
      setCategory("Salary / Income");
    }
    setError("");
  }, [editTransaction, isOpen]);

  // Handle amount change - auto-detect +/- sign typed by user
  const handleAmountChange = (val: string) => {
    setAmountStr(val);
    const trimmed = val.trim();
    if (trimmed.startsWith("-")) {
      setType("EXPENSE");
    } else if (trimmed.startsWith("+")) {
      setType("INCOME");
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    // Switch default category if needed
    if (newType === "INCOME" && (category === "General" || category === "Housing & Rent" || category === "Food & Groceries")) {
      setCategory("Salary / Income");
    } else if (newType === "EXPENSE" && category === "Salary / Income") {
      setCategory("Food & Groceries");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const cleanAmountStr = amountStr.replace(/[^\d.-]/g, "");
    const parsedAmount = Math.abs(parseFloat(cleanAmountStr));

    if (isNaN(parsedAmount) || parsedAmount === 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    // Determine final type if user typed minus
    let finalType = type;
    if (cleanAmountStr.startsWith("-")) {
      finalType = "EXPENSE";
    }

    try {
      setLoading(true);
      setError("");
      await onSave({
        sheetId,
        date: date || getTodayDateString(),
        description: description.trim(),
        amount: parsedAmount,
        type: finalType,
        category: category || "General",
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                type === "INCOME"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {type === "INCOME" ? (
                <ArrowDownLeft className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">
                {editTransaction ? "Edit Transaction" : "New Transaction Entry"}
              </h2>
              <p className="text-xs text-slate-400">
                Record received income or sent expense
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Type Toggle: Received (+) vs Sent (-) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  type === "INCOME"
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Received (+ Income)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  type === "EXPENSE"
                    ? "bg-rose-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Sent (- Expense)</span>
              </button>
            </div>
          </div>

          {/* Amount Input with +/- support */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount ({currency}) <span className="text-slate-400 font-normal">(type + or -)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-semibold">
                {type === "INCOME" ? "+" : "-"} {currency}
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. 500 or -120.50"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-base font-mono font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Tip: Typing a minus sign (e.g. <span className="font-mono text-rose-400">-50</span>) automatically switches to Sent.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Salary bonus, Supermarket, Apartment rent, Freelance"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.filter((c) => c.type === type).map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="General">General / Uncategorized</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-xl shadow-md transition-all disabled:opacity-50 ${
                type === "INCOME"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
              }`}
            >
              {loading ? "Saving..." : editTransaction ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
