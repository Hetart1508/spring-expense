import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, ShieldAlert, CheckCircle, Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError("Username and password are required.");
      return;
    }

    if (username.length < 3) {
      setLocalError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(username, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setLocalError(err.message || "Failed to register. Username might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:w-1/2 bg-slate-900 text-white flex flex-col justify-center p-8 md:p-16 border-r border-slate-800">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
              <Wallet className="h-8 w-8" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded">
              Java-Expense Project
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Create an account and start tracking.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Register with a unique username to manage your own transactions and view personal dashboard insights.
          </p>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-sm">
            <h4 className="font-semibold text-slate-200 mb-2 font-mono text-xs uppercase tracking-wider text-indigo-400">
              Account Features
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Private transaction history.</li>
              <li>Personal dashboard summaries.</li>
              <li>Simple profile and password management.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel - Registration Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Create Account</h2>
            <p className="text-slate-500 text-sm">
              Register a unique username to start managing transactions.
            </p>
          </div>

          {localError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3" id="register-error-alert">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Validation Error:</span> {localError}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-start gap-3" id="register-success-alert">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Success!</span> Account created. Redirecting to login...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-medium transition-all"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={success}
                id="register-username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-mono transition-all"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={success}
                  id="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={success}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-mono transition-all"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={success}
                  id="register-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  disabled={success}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/10"
              id="register-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Register and Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500" id="to-login-link">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
