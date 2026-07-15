import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import { Transaction, Category, PaymentMethod } from "../types";
import { ArrowLeft, CheckCircle, ShieldAlert, AlertCircle } from "lucide-react";

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"];

const EditTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");

  // Fetch predefined categories and current transaction record
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch categories
        const catsRes = await api.get<Category[]>("/categories");
        setCategories(catsRes.data);

        // 2. Fetch current transaction details
        const transRes = await api.get<Transaction>(`/transactions/${id}`);
        const t = transRes.data;
        
        setName(t.name);
        setAmount(t.amount.toString());
        setType(t.type);
        setCategoryId(t.category.id.toString());
        setTransactionDate(t.transactionDate);
        setDescription(t.description || "");
        setPaymentMethod(t.paymentMethod);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Filter categories shown to the user dynamically based on selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Fallback category select if type switches and current category is no longer valid
  useEffect(() => {
    if (availableCategories.length > 0) {
      const selectedCat = availableCategories.find(c => c.id.toString() === categoryId);
      if (!selectedCat) {
        setCategoryId(availableCategories[0].id.toString());
      }
    }
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      setError("Please select a predefined category");
      return;
    }
    if (!transactionDate) {
      setError("Transaction date is required");
      return;
    }

    try {
      setSaveLoading(true);
      await api.put(`/transactions/${id}`, {
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
      setError(err.response?.data?.message || "Failed to save transaction updates");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 text-sm">Fetching transaction details from ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6" id="edit-transaction-container">
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
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Edit Transaction Record #{id}</h1>
        <p className="text-sm text-slate-500">
          Modify the transaction details below.
        </p>
      </div>

      {error && !name && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {name && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Validation Error:</span> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="edit-transaction-form">
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
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-semibold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  id="edit-amount"
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
                  id="edit-date"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="edit-name"
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
                  id="edit-category"
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
                  id="edit-payment-method"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-medium text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                id="edit-description"
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
                disabled={saveLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
                id="submit-edit-transaction"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditTransaction;
