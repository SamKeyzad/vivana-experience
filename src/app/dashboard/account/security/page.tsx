"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function SecurityPage() {
  const [email, setEmail]               = useState("");
  const [emailMsg, setEmailMsg]         = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw]       = useState("");
  const [newPw, setNewPw]               = useState("");
  const [confirmPw, setConfirmPw]       = useState("");
  const [pwMsg, setPwMsg]               = useState("");
  const [pwLoading, setPwLoading]       = useState(false);
  const [showPw, setShowPw]             = useState(false);

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg("");
    if (!email.includes("@")) { setEmailMsg("Please enter a valid email."); return; }
    const sb = getSupabase();
    if (!sb) return;
    setEmailLoading(true);
    const { error } = await sb.auth.updateUser({ email });
    setEmailLoading(false);
    setEmailMsg(error ? error.message : "Check your new email for a confirmation link.");
    setEmail("");
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (newPw.length < 6) { setPwMsg("Password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match."); return; }
    const sb = getSupabase();
    if (!sb) return;
    setPwLoading(true);
    const { error } = await sb.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwMsg(error.message); return; }
    setPwMsg("Password updated successfully.");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  }

  const inputClass = "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Login &amp; Security</h1>
        <p className="mt-1 text-sm text-stone-500">Manage your email, password, and account security.</p>
      </div>

      {/* Change email */}
      <div className="mb-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-stone-800">Email address</h2>
        <p className="mb-4 text-xs text-stone-400">You will receive a confirmation email to verify the new address.</p>
        <form onSubmit={handleEmailChange} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter new email address"
            required
            className={inputClass}
          />
          {emailMsg && (
            <p className={`rounded-xl px-4 py-2.5 text-xs font-medium ${emailMsg.includes("Check") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {emailMsg}
            </p>
          )}
          <button type="submit" disabled={emailLoading} className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            {emailLoading ? "Sending…" : "Update email"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="mb-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-stone-800">Change password</h2>
        <p className="mb-4 text-xs text-stone-400">Use a strong password that you don&apos;t use elsewhere.</p>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="New password (min. 6 characters)"
              required
              className={inputClass}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPw ? "text" : "password"}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            required
            className={inputClass}
          />
          {pwMsg && (
            <p className={`rounded-xl px-4 py-2.5 text-xs font-medium ${pwMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {pwMsg}
            </p>
          )}
          <button type="submit" disabled={pwLoading} className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            {pwLoading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mb-4 text-xs text-stone-400">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
              // Trigger account deletion flow
            }
          }}
          className="rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}
