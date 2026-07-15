import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { Category, PaymentMethod } from "../types";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => {
    // Default to today's date (YYYY-MM-DD)
    return new Date().toISOString().substring(0, 10);
  });
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Filter categories shown to the user dynamically based on selected transaction type
  const availableCategories = categories.filter((c) => c.type === type);

  // Automatically select the first available category when type changes
  useEffect(() => {
    if (availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id.toString());
    } else {
      setCategoryId("");
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Validations
    if (!name.trim()) {
      setError("Transaction name is required");
      return;
    }
    const amtFloat = parseFloat(amount);
    if (isNaN(amtFloat) || amtFloat <= 0) {
      setError("Amount must be a numeric value greater than zero");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!transactionDate) {
      setError("Transaction date is required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/transactions", {
        name,
        amount: amtFloat,
        type,
        categoryId: parseInt(categoryId),
        transactionDate,
        description,
        paymentMethod,
      });

      // Redirect back to Ledger
      navigate("/transactions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save transaction record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6" id="add-transaction-container">
      {/* Back Button */}
      <Link
        to="/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Transaction Ledger</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Add New Transaction</h1>
        <p className="text-sm text-slate-500">
          Create a new transaction entry.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Validation Error:</span> {error}
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5" id="add-transaction-form">
          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  type === "EXPENSE"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setType("EXPENSE")}
                id="type-expense-tab"
              >
                EXPENSE (-)
              </button>
              <button
                type="button"
                className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  type === "INCOME"
                    ? "bg-white text-emerald-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setType("INCOME")}
                id="type-income-tab"
              >
                INCOME (+)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-semibold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                id="add-amount"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-mono"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                id="add-date"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction Name</label>
            <input
              type="text"
              placeholder="e.g. Whole Foods Groceries"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="add-name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                id="add-category"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                id="add-payment-method"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Add additional context or items list..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="add-description"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Link
              to="/transactions"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
              id="submit-new-transaction"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
