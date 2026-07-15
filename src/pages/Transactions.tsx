import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { PaginatedTransactions, Category, PaymentMethod } from "../types";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldQuestion,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];

const Transactions: React.FC = () => {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Sorting States
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("transactionDate");
  const [sortDirection, setSortDirection] = useState("desc");

  // Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Deletion Modal States
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page to 0 on new search
    }, 450);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories for filter", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch paginated transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      params.append("sortBy", sortBy);
      params.append("sortDirection", sortDirection);

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (type) params.append("type", type);
      if (categoryId) params.append("categoryId", categoryId);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (minAmount) params.append("minAmount", minAmount);
      if (maxAmount) params.append("maxAmount", maxAmount);

      const res = await api.get<PaginatedTransactions>(`/transactions?${params.toString()}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load transaction ledger");
    } finally {
      setLoading(false);
    }
  };

  // Trigger load on state changes
  useEffect(() => {
    fetchTransactions();
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    debouncedSearch,
    type,
    categoryId,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setType("");
    setCategoryId("");
    setPaymentMethod("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("transactionDate");
    setSortDirection("desc");
    setPage(0);
  };

  const triggerDeleteConfirm = (id: number, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleDeleteTransaction = async () => {
    if (deleteId === null) return;
    try {
      setIsDeleting(true);
      await api.delete(`/transactions/${deleteId}`);
      setDeleteId(null);
      setDeleteName("");
      // Reload current page (or go back if deleted the last item on the page)
      if (data && data.content.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchTransactions();
      }
    } catch (err: any) {
      alert("Error deleting transaction: " + (err.response?.data?.message || "Server issue"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
    setPage(0);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <div className="space-y-6" id="ledger-container">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Transaction Ledger</h1>
          <p className="text-slate-500 text-sm">
            Search, filter, sort, and manage your transactions.
          </p>
        </div>
        <div>
          <Link
            to="/transactions/add"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-indigo-600/10 cursor-pointer"
            id="add-transaction-btn-ledger"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Advanced Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Filters</span>
        </div>

        {/* First Row: Search + Category + Type + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Search text</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, description, etc..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="filter-search-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</label>
            <select
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
              id="filter-type-select"
            >
              <option value="">All Types</option>
              <option value="INCOME">INCOME (+)</option>
              <option value="EXPENSE">EXPENSE (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <select
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
              id="filter-category-select"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
            <select
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(0); }}
              id="filter-payment-select"
            >
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Date range + Amount range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date (From)</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              id="filter-start-date"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date (To)</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              id="filter-end-date"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Min Amount (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="Min value"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setPage(0); }}
              id="filter-min-amount"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Amount (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="Max value"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              value={maxAmount}
              onChange={(e) => { setMaxAmount(e.target.value); setPage(0); }}
              id="filter-max-amount"
            />
          </div>
        </div>

        {/* Third Row: Clear Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs font-medium text-slate-400 font-mono">
            Results: <span className="text-slate-600 font-semibold">{data?.totalElements || 0} items</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer"
            id="clear-all-filters-btn"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Ledger Listing */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading && !data ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm">Loading transactions...</p>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-16 text-center space-y-3" id="ledger-empty-state">
            <p className="text-slate-400 font-medium">No transactions matched your filters.</p>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="ledger-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 tracking-wider">
                    <th
                      onClick={() => handleSortToggle("name")}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Name & Description</span>
                        <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="px-6 py-4">Category</th>
                    <th
                      onClick={() => handleSortToggle("transactionDate")}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="px-6 py-4">Method</th>
                    <th
                      onClick={() => handleSortToggle("amount")}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors select-none text-right"
                    >
                      <div className="flex items-center gap-1 justify-end">
                        <span>Amount</span>
                        <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.content.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors" id={`ledger-row-${t.id}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 leading-snug">{t.name}</p>
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
                      <td className={`px-6 py-4 text-right font-bold font-mono text-base ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.type === "INCOME" ? "+" : "-"}{formatINR(t.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/transactions/edit/${t.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                            title="Edit Record"
                            id={`edit-ledger-btn-${t.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => triggerDeleteConfirm(t.id, t.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            title="Delete Record"
                            id={`delete-ledger-btn-${t.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>Show:</span>
                  <select
                    className="px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none"
                    value={size}
                    onChange={(e) => { setSize(parseInt(e.target.value)); setPage(0); }}
                    id="page-size-selector"
                  >
                    <option value={5}>5 items</option>
                    <option value={10}>10 items</option>
                    <option value={20}>20 items</option>
                    <option value={50}>50 items</option>
                  </select>
                </div>
                <span>
                  Page <strong className="text-slate-800">{page + 1}</strong> of <strong className="text-slate-800">{data.totalPages || 1}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={data.first}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  id="prev-page-btn"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={data.last}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  id="next-page-btn"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="delete-modal-overlay">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldQuestion className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Confirm Action</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you absolutely sure you want to permanently delete transaction <strong className="text-slate-800">"{deleteName}"</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setDeleteId(null); setDeleteName(""); }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                id="cancel-delete-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                id="confirm-delete-btn"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
