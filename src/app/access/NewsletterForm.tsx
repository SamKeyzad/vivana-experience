"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire to backend — for now just show success
    setStatus("success");
    setEmail("");
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
            className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="submit"
            className="rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-95"
          >
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}
