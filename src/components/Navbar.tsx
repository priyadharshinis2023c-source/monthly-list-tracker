"use client";

import React from "react";
import {
  Layers,
  BarChart3,
  Plus,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface NavbarProps {
  activeTab: "sheets" | "analytics";
  setActiveTab: (tab: "sheets" | "analytics") => void;
  onNewSheet: () => void;
  onSeedData: () => void;
  totalIncomeAll: number;
  totalExpenseAll: number;
  totalNetAll: number;
  currency?: string;
  hasSheets: boolean;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onNewSheet,
  onSeedData,
  totalIncomeAll,
  totalExpenseAll,
  totalNetAll,
  currency = "$",
  hasSheets,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  Monthly<span className="text-indigo-400">List</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multi-sheet bookkeeping & monthly money charts
              </p>
            </div>
          </div>

          {/* Center Tabs: Sheets vs Analytics */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("sheets")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "sheets"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Spreadsheets</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Monthly Charts</span>
            </button>
          </div>

          {/* Right Action buttons & Global Overview */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hasSheets && (
              <button
                onClick={onSeedData}
                title="Load sample monthly sheets with demo data"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo Data</span>
              </button>
            )}

            <button
              onClick={onNewSheet}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Sheet</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Global summary stats banner */}
        {hasSheets && (
          <div className="py-2 border-t border-slate-800/60 hidden md:flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              <span>All Sheets Combined:</span>
            </div>
            <div className="flex items-center gap-6 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Total Got:</span>
                <strong className="font-semibold">{formatCurrency(totalIncomeAll, currency)}</strong>
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Total Spent:</span>
                <strong className="font-semibold">{formatCurrency(totalExpenseAll, currency)}</strong>
              </span>
              <span
                className={`flex items-center gap-1 font-semibold ${
                  totalNetAll >= 0 ? "text-indigo-400" : "text-rose-400"
                }`}
              >
                <span>Net Total:</span>
                <strong>{formatCurrency(totalNetAll, currency)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
