"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Layers, DollarSign, Palette } from "lucide-react";
import { Sheet } from "@/lib/types";
import { getCurrentMonthString } from "@/lib/utils";

interface SheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetData: {
    name: string;
    month?: string;
    description?: string;
    currency: string;
    color: string;
  }) => Promise<void>;
  editSheet?: Sheet | null;
}

const COLOR_OPTIONS = [
  { id: "indigo", bg: "bg-indigo-500", ring: "ring-indigo-400" },
  { id: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-400" },
  { id: "purple", bg: "bg-purple-500", ring: "ring-purple-400" },
  { id: "amber", bg: "bg-amber-500", ring: "ring-amber-400" },
  { id: "rose", bg: "bg-rose-500", ring: "ring-rose-400" },
  { id: "cyan", bg: "bg-cyan-500", ring: "ring-cyan-400" },
  { id: "blue", bg: "bg-blue-500", ring: "ring-blue-400" },
];

const CURRENCIES = [
  { symbol: "$", label: "USD / Standard ($)" },
  { symbol: "₹", label: "INR (₹)" },
  { symbol: "€", label: "EUR (€)" },
  { symbol: "£", label: "GBP (£)" },
  { symbol: "¥", label: "JPY / CNY (¥)" },
  { symbol: "C$", label: "CAD (C$)" },
  { symbol: "A$", label: "AUD (A$)" },
];

export function SheetModal({
  isOpen,
  onClose,
  onSave,
  editSheet,
}: SheetModalProps) {
  const [name, setName] = useState("");
  const [month, setMonth] = useState(getCurrentMonthString());
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("$");
  const [color, setColor] = useState("indigo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editSheet) {
      setName(editSheet.name);
      setMonth(editSheet.month || getCurrentMonthString());
      setDescription(editSheet.description || "");
      setCurrency(editSheet.currency || "$");
      setColor(editSheet.color || "indigo");
    } else {
      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();
      setName(`${monthName} ${year}`);
      setMonth(getCurrentMonthString());
      setDescription("");
      setCurrency("$");
      setColor("indigo");
    }
    setError("");
  }, [editSheet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for the sheet.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSave({
        name: name.trim(),
        month: month || undefined,
        description: description.trim() || undefined,
        currency,
        color,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save sheet.");
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">
                {editSheet ? "Edit Sheet Settings" : "Create New Sheet"}
              </h2>
              <p className="text-xs text-slate-400">
                Organize transactions by month, project, or category
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

          {/* Sheet Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Sheet Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. November 2026, Office Expenses, Trip to Tokyo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Month / Period Tag */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Month / Period (Used for Monthly Charts)
            </label>
            <div className="relative">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Currency selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Sheet Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    color === c.id ? `ring-2 ring-offset-2 ring-offset-slate-900 ${c.ring} scale-110` : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add optional notes about this sheet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer buttons */}
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
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : editSheet ? "Save Changes" : "Create Sheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
