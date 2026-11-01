"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Percent,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  currency?: string;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  netBalance,
  transactionCount,
  currency = "$",
}: SummaryCardsProps) {
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Net Balance (Total Amount) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Total Balance
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              netBalance >= 0
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              netBalance >= 0 ? "text-indigo-300" : "text-rose-400"
            }`}
          >
            {formatCurrency(netBalance, currency)}
          </h3>
        </div>
        <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-400">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              netBalance >= 0 ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          <span>{netBalance >= 0 ? "Surplus / In Profit" : "Deficit / Negative"}</span>
        </div>
      </div>

      {/* 2. Total Received (Money Got) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Received (+)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-emerald-400">
            +{formatCurrency(totalIncome, currency)}
          </h3>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>All income & money incoming</span>
        </div>
      </div>

      {/* 3. Total Sent (Money Spent) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Sent (-)
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-rose-400">
            -{formatCurrency(totalExpense, currency)}
          </h3>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <span>All outgoing payments & expenses</span>
        </div>
      </div>

      {/* 4. Transactions & Savings Rate */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Savings & Activity
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-amber-400">
            {savingsRate}%
          </div>
          <div className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1 font-mono">
            <Receipt className="w-3 h-3 text-slate-400" />
            <span>{transactionCount} entries</span>
          </div>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
