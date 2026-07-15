import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { User, ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Name Update Form
  const [name, setName] = useState(user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);

    if (!name.trim()) {
      setNameMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    try {
      setNameLoading(true);
      await api.put("/profile", { name });
      setNameMessage({ type: "success", text: "Profile display name updated successfully!" });
      await refreshUser();
    } catch (err: any) {
      setNameMessage({ type: "error", text: err.response?.data?.message || "Failed to update name." });
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (!currentPassword || !newPassword) {
      setPassMessage({ type: "error", text: "All password fields are required." });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setPassLoading(true);
      await api.put("/profile/password", { currentPassword, newPassword });
      setPassMessage({ type: "success", text: "Password changed successfully! Keep it safe." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPassMessage({ type: "error", text: err.response?.data?.message || "Incorrect current password." });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="profile-container">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
          <User className="h-8 w-8 text-indigo-600" />
          <span>My Account Settings</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your profile details and password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-2xl uppercase mb-4 shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{user?.name}</h3>
            <span className="text-xs font-mono font-semibold tracking-wider bg-slate-700 text-slate-100 px-2.5 py-0.5 rounded-full mt-1.5 uppercase">
              {user?.role}
            </span>

            <div className="w-full border-t border-slate-100 mt-6 pt-4 text-left space-y-3 font-mono text-xs text-slate-500">
             
            </div>
          </div>
        </div>

        {/* Right Columns: Forms list */}
        <div className="space-y-8 lg:col-span-2">
          {/* Update display Name */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">General Information</h2>
              <p className="text-slate-400 text-xs mt-0.5">Update the name shown across your account.</p>
            </div>

            {nameMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2.5 ${
                  nameMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border border-rose-100 text-rose-700"
                }`}
                id="name-update-alert"
              >
                {nameMessage.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{nameMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4" id="name-update-form">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Display Username</label>
                <input
                  type="text"
                  className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="profile-name-input"
                />
              </div>

              <button
                type="submit"
                disabled={nameLoading}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-600/10"
                id="profile-name-submit"
              >
                {nameLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span>Apply Identity Changes</span>
              </button>
            </form>
          </div>

          {/* Change Password form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">Update Account Password</h2>
              <p className="text-slate-400 text-xs mt-0.5">Choose a new password for your account.</p>
            </div>

            {passMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2.5 ${
                  passMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border border-rose-100 text-rose-700"
                }`}
                id="pass-update-alert"
              >
                {passMessage.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4" id="pass-update-form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-mono"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    id="profile-curr-pass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    id="profile-new-pass"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white font-mono"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    id="profile-confirm-new"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-600/10"
                id="profile-pass-submit"
              >
                {passLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span>Apply Password Changes</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
