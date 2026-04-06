"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const sb = getSupabase();
      if (!sb) { setStatus("success"); setEmail(""); return; }
      const { error } = await sb.from("newsletter_subscribers").insert({ email: email.trim() });
      if (error && error.code !== "23505") {
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      {status === "success" ? (
        <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-center text-sm font-medium text-amber-800">
          You&apos;re in. Expect only the good stuff.
        </div>
      ) : (
        <>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-400 focus:bg-white/15 focus:ring-2 focus:ring-amber-400/30"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60 active:scale-95"
          >
            {status === "loading" ? "Saving…" : "Subscribe"}
          </button>
        </>
      )}
      {status === "error" && (
        <p className="w-full text-center text-xs text-red-300 mt-1">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
