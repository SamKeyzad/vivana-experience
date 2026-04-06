"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");
    const sb = getSupabase();

    if (!sb) { router.replace("/"); return; }

    if (code) {
      sb.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setError("Sign-in failed. Please try again.");
          } else {
            router.replace(params.get("next") ?? "/");
          }
        });
    } else {
      // No code param — might be implicit flow or already handled
      router.replace("/");
    }
  }, [params, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-center">
        <div>
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={() => router.replace("/")}
            className="mt-4 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3 text-stone-400">
        <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
