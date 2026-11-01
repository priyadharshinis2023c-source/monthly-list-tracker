"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { SheetSidebar } from "@/components/SheetSidebar";
import { SheetView } from "@/components/SheetView";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SheetModal } from "@/components/SheetModal";
import { TransactionModal } from "@/components/TransactionModal";
import { Sheet, Transaction, TransactionType } from "@/lib/types";
import { Loader2, Plus, Sparkles, FileSpreadsheet } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"sheets" | "analytics">("sheets");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // 1. Fetch all sheets
  const fetchSheets = useCallback(async (preserveActiveId?: string) => {
    try {
      const res = await fetch("/api/sheets");
      if (!res.ok) throw new Error("Failed to load sheets");
      const data: Sheet[] = await res.json();
      setSheets(data);

      if (data.length > 0) {
        // If preserveActiveId is specified and exists, keep it; else default to first
        const targetId =
          preserveActiveId && data.some((s) => s.id === preserveActiveId)
            ? preserveActiveId
            : data[0].id;
        setActiveSheetId((prev) => (prev && data.some((s) => s.id === prev) ? prev : targetId));
      } else {
        setActiveSheetId(null);
        setActiveSheet(null);
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch active sheet with its transactions
  const fetchSheetDetails = useCallback(async (sheetId: string) => {
    try {
      const res = await fetch(`/api/sheets/${sheetId}`);
      if (!res.ok) throw new Error("Failed to load sheet details");
      const data = await res.json();
      setActiveSheet(data);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  // When activeSheetId changes, load details
  useEffect(() => {
    if (activeSheetId) {
      fetchSheetDetails(activeSheetId);
    }
  }, [activeSheetId, fetchSheetDetails]);

  // Handle Save Sheet (Create or Edit)
  const handleSaveSheet = async (sheetData: {
    name: string;
    month?: string;
    description?: string;
    currency: string;
    color: string;
  }) => {
    if (editingSheet) {
      // Edit
      const res = await fetch(`/api/sheets/${editingSheet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetData),
      });
      if (!res.ok) throw new Error("Failed to update sheet");
      await fetchSheets(editingSheet.id);
      await fetchSheetDetails(editingSheet.id);
    } else {
      // Create new
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetData),
      });
      if (!res.ok) throw new Error("Failed to create sheet");
      const newSheet = await res.json();
      await fetchSheets(newSheet.id);
      setActiveSheetId(newSheet.id);
    }
  };

  // Handle Delete Sheet
  const handleDeleteSheet = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all its records?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/sheets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sheet");
      await fetchSheets();
    } catch (err) {
      console.error(err);
      alert("Failed to delete sheet");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save Transaction (Create or Edit)
  const handleSaveTransaction = async (txData: {
    sheetId: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
  }) => {
    if (editingTx) {
      const res = await fetch(`/api/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      if (!res.ok) throw new Error("Failed to update transaction");
    } else {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
    }

    if (activeSheetId) {
      await fetchSheetDetails(activeSheetId);
      await fetchSheets(activeSheetId);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction entry?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      if (activeSheetId) {
        await fetchSheetDetails(activeSheetId);
        await fetchSheets(activeSheetId);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  };

  // Handle Seed Demo Data
  const handleSeedData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed data");
      await fetchSheets();
    } catch (err) {
      console.error(err);
      alert("Failed to load sample demo data");
    } finally {
      setLoading(false);
    }
  };

  // Global calculations across all sheets
  let totalIncomeAll = 0;
  let totalExpenseAll = 0;
  for (const s of sheets) {
    totalIncomeAll += s.totalIncome || 0;
    totalExpenseAll += s.totalExpense || 0;
  }
  const totalNetAll = totalIncomeAll - totalExpenseAll;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSheet={() => {
          setEditingSheet(null);
          setIsSheetModalOpen(true);
        }}
        onSeedData={handleSeedData}
        totalIncomeAll={totalIncomeAll}
        totalExpenseAll={totalExpenseAll}
        totalNetAll={totalNetAll}
        currency={activeSheet?.currency || "$"}
        hasSheets={sheets.length > 0}
      />

      {/* Main Body */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-sm">Loading your financial sheets...</p>
        </div>
      ) : sheets.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            No Sheets Created Yet
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Create monthly sheets to record received income (+) and sent expenses (-).
            You can create as many sheets as you need and review monthly balance charts!
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingSheet(null);
                setIsSheetModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Sheet</span>
            </button>
            <button
              onClick={handleSeedData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dashboard with Sidebar and Views */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar */}
          <SheetSidebar
            sheets={sheets}
            activeSheetId={activeSheetId}
            onSelectSheet={(id) => setActiveSheetId(id)}
            onNewSheet={() => {
              setEditingSheet(null);
              setIsSheetModalOpen(true);
            }}
            onEditSheet={(sheet) => {
              setEditingSheet(sheet);
              setIsSheetModalOpen(true);
            }}
            onDeleteSheet={handleDeleteSheet}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
            {activeTab === "sheets" ? (
              activeSheet ? (
                <SheetView
                  sheet={activeSheet}
                  transactions={transactions}
                  onAddTransaction={handleSaveTransaction}
                  onEditTransaction={(tx) => {
                    setEditingTx(tx);
                    setIsTxModalOpen(true);
                  }}
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditSheet={() => {
                    setEditingSheet(activeSheet);
                    setIsSheetModalOpen(true);
                  }}
                  onDeleteSheet={() =>
                    handleDeleteSheet(activeSheet.id, activeSheet.name)
                  }
                  onOpenModal={() => {
                    setEditingTx(null);
                    setIsTxModalOpen(true);
                  }}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  Select a sheet from the directory
                </div>
              )
            ) : (
              <AnalyticsDashboard
                sheets={sheets}
                activeSheetTransactions={transactions}
                activeSheetName={activeSheet?.name || "Active Sheet"}
                currency={activeSheet?.currency || "$"}
              />
            )}
          </main>
        </div>
      )}

      {/* Sheet Modal */}
      <SheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onSave={handleSaveSheet}
        editSheet={editingSheet}
      />

      {/* Transaction Modal */}
      {activeSheet && (
        <TransactionModal
          isOpen={isTxModalOpen}
          sheetId={activeSheet.id}
          currency={activeSheet.currency}
          onClose={() => setIsTxModalOpen(false)}
          onSave={handleSaveTransaction}
          editTransaction={editingTx}
        />
      )}
    </div>
  );
}
