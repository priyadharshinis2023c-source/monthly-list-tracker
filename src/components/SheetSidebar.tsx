"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { Sheet } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SheetSidebarProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelectSheet: (id: string) => void;
  onNewSheet: () => void;
  onEditSheet: (sheet: Sheet) => void;
  onDeleteSheet: (id: string, name: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  blue: "bg-blue-500",
};

export function SheetSidebar({
  sheets,
  activeSheetId,
  onSelectSheet,
  onNewSheet,
  onEditSheet,
  onDeleteSheet,
}: SheetSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredSheets = sheets.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.month && s.month.includes(searchTerm))
  );

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-slate-900/60 border-r border-slate-800 flex flex-col h-full">
      {/* Top action header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-white text-sm">Sheets Directory</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {sheets.length}
            </span>
          </div>
          <button
            onClick={onNewSheet}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sheet</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sheets or months..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sheets List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSheets.length === 0 ? (
          <div className="text-center py-8 px-4">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              {searchTerm ? "No sheets match your search." : "No sheets created yet."}
            </p>
            {!searchTerm && (
              <button
                onClick={onNewSheet}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                + Create your first sheet
              </button>
            )}
          </div>
        ) : (
          filteredSheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            const net = sheet.netBalance ?? 0;
            const isMenuOpen = menuOpenId === sheet.id;

            return (
              <div
                key={sheet.id}
                onClick={() => onSelectSheet(sheet.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? "bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                    : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        COLOR_MAP[sheet.color] || "bg-indigo-500"
                      }`}
                    />
                    <div className="truncate">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          isActive ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {sheet.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {sheet.month && (
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {sheet.month}
                          </span>
                        )}
                        <span>•</span>
                        <span>{sheet._count?.transactions ?? 0} items</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions menu trigger */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : sheet.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-7 z-20 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onEditSheet(sheet);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Sheet</span>
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            onDeleteSheet(sheet.id, sheet.name);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance bar in card */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Balance:</span>
                  <span
                    className={`font-semibold ${
                      net >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatCurrency(net, sheet.currency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
