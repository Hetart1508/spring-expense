import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo credentials for convenience
  const fillDemoCredentials = () => {
    setUsername("hetarth");
    setPassword("Password@123");
    setLocalError(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left panel */}
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

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Track expenses with a clean, secure dashboard.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Sign in to manage transactions, review spending patterns, and keep your financial records organized.
          </p>

          <div className="space-y-4 font-mono text-sm border-t border-slate-800 pt-8 text-slate-300">
            <p className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Fast transaction entry and filtering</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Dashboard summaries and charts</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Private account access</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Sign In</h2>
            <p className="text-slate-500 text-sm">
              Use your account credentials to continue.
            </p>
          </div>

          {localError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-3" id="login-error-alert">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Authentication Error:</span> {localError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-medium transition-all"
                placeholder="Enter username (e.g. hetarth)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="login-username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-mono transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/10"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500" id="to-register-link">
              Create an account now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
