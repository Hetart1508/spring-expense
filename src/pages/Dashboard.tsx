import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { DashboardSummary } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Receipt,
  Plus,
  ChevronRight,
  RefreshCw,
  Award,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from "recharts";

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const isCompleteDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
  const canApplyDateFilter = isCompleteDate(startDate) && isCompleteDate(endDate);

  const fetchDashboardData = async (filters = { startDate: appliedStartDate, endDate: appliedEndDate }) => {
    try {
      setLoading(true);
      setError(null);
      let url = "/dashboard/summary";
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await api.get<DashboardSummary>(url);
      setSummary(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData({ startDate: "", endDate: "" });
  }, []);

  const applyDateFilter = () => {
    if (!canApplyDateFilter) {
      setError("Please choose a complete start date and end date.");
      return;
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    fetchDashboardData({ startDate, endDate });
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    fetchDashboardData({ startDate: "", endDate: "" });
  };

  // Helper to format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <div className="space-y-8" id="dashboard-container">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Overview of your financial performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/transactions/add"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-indigo-600/10 cursor-pointer"
            id="add-transaction-btn-dash"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
          <button
            onClick={() => fetchDashboardData()}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh statistics"
            id="refresh-dash-btn"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <span>Filter Summary Dates:</span>
        </div>
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">From:</span>
            <input
              type="date"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              id="dash-start-date"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">To:</span>
            <input
              type="date"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              id="dash-end-date"
            />
          </div>
          <button
            onClick={applyDateFilter}
            disabled={!canApplyDateFilter || loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
            id="dash-apply-dates"
          >
            Apply
          </button>
          {(startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              id="dash-clear-dates"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {loading && !summary ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 text-sm">Refreshing charts...</p>
          </div>
        </div>
      ) : summary ? (
        <>
          {/* KPI Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Net Balance */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between" id="kpi-balance">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Available Balance</span>
                <p className={`text-2xl font-black ${summary.balance >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                  {formatINR(summary.balance)}
                </p>
                <div className="text-xs text-slate-500 font-mono">Income minus expenses</div>
              </div>
              <div className={`p-3 rounded-xl ${summary.balance >= 0 ? "bg-slate-100 text-slate-800" : "bg-rose-50 text-rose-600"}`}>
                <Scale className="h-6 w-6" />
              </div>
            </div>

            {/* Total Income */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between" id="kpi-income">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Income</span>
                <p className="text-2xl font-black text-emerald-600">
                  {formatINR(summary.totalIncome)}
                </p>
                <div className="text-xs text-slate-500 font-medium">{summary.incomeTransactionCount} deposits</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            {/* Total Expense */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between" id="kpi-expense">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Expense</span>
                <p className="text-2xl font-black text-rose-600">
                  {formatINR(summary.totalExpense)}
                </p>
                <div className="text-xs text-slate-500 font-medium">{summary.expenseTransactionCount} charges</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>

            {/* Total Count */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between" id="kpi-total-transactions">
              <div className="space-y-1">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Transactions Count</span>
                <p className="text-2xl font-black text-indigo-600">
                  {summary.totalTransactionCount}
                </p>
                <div className="text-xs text-slate-500 font-medium">In the selected range</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Peak Categories Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Peak Income Category</span>
                <h3 className="font-bold text-slate-800 text-lg leading-snug">{summary.highestIncomeCategory.categoryName}</h3>
                <p className="text-xs text-emerald-600 font-bold">{formatINR(summary.highestIncomeCategory.amount)} Total</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Peak Expense Category</span>
                <h3 className="font-bold text-slate-800 text-lg leading-snug">{summary.highestExpenseCategory.categoryName}</h3>
                <p className="text-xs text-rose-600 font-bold">{formatINR(summary.highestExpenseCategory.amount)} Total</p>
              </div>
            </div>
          </div>

          {/* Graphs & Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend AreaChart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 tracking-tight text-base">Monthly Budget Trend</h3>
                <p className="text-xs text-slate-500">Income vs expense trends by month</p>
              </div>
              <div className="h-80 w-full min-h-[320px]">
                {summary.monthlySummary.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No historic monthly transactions in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.monthlySummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip formatter={(value: any) => formatINR(value)} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" name="Income" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2.5} />
                      <Area type="monotone" name="Expense" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Expenses BarChart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 tracking-tight text-base">Category Expenses Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of spending by category</p>
              </div>
              <div className="h-80 w-full min-h-[320px]">
                {summary.categoryWiseExpenses.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No expenses reported in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.categoryWiseExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis type="category" dataKey="categoryName" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                      <Tooltip formatter={(value: any) => formatINR(value)} />
                      <Bar dataKey="amount" name="Total Expense" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-none">Recent Transaction Ledger</h3>
                <p className="text-xs text-slate-500 mt-1">The five latest account transactions</p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                id="view-all-transactions-link"
              >
                <span>View Full Ledger</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {summary.recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recent transactions found. Click "Add Transaction" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 tracking-wider">
                      <th className="px-6 py-3.5">Name / Description</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Method</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {summary.recentTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          {t.description && <span className="text-xs text-slate-400 line-clamp-1">{t.description}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              t.category.type === "INCOME"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {t.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{t.transactionDate}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">{t.paymentMethod.replace("_", " ")}</td>
                        <td className={`px-6 py-4 text-right font-bold font-mono ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                          {t.type === "INCOME" ? "+" : "-"}{formatINR(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
          Unable to generate summary data.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
