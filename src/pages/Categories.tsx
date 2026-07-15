import React, { useState, useEffect } from "react";
import api from "../api";
import { Category } from "../types";
import { Tags, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get<Category[]>("/categories");
        setCategories(res.data);
      } catch (err: any) {
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-6" id="categories-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
          <Tags className="h-8 w-8 text-indigo-600" />
          <span>Categories</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review the available income and expense categories.
        </p>
      </div>

      {/* Course Note Banner */}
  

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* INCOME COLUMN */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Income Categories</h2>
                <p className="text-xs text-slate-400">Categories for incoming money</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {incomeCategories.map((c) => (
                <div
                  key={c.id}
                  className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-xs font-bold font-mono tracking-wide flex justify-between items-center"
                  id={`cat-income-badge-${c.id}`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-200 px-1 py-0.2 rounded"></span>
                </div>
              ))}
            </div>
          </div>

          {/* EXPENSE COLUMN */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Expense Categories</h2>
                <p className="text-xs text-slate-400">Categories for spending</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {expenseCategories.map((c) => (
                <div
                  key={c.id}
                  className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-xs font-bold font-mono tracking-wide flex justify-between items-center"
                  id={`cat-expense-badge-${c.id}`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-200 px-1 py-0.2 rounded"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
