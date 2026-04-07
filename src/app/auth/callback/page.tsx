"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { router.replace("/"); return; }

    // With implicit flow, Supabase puts tokens in the URL hash.
    // getSession() parses them automatically — no manual code exchange needed.
    sb.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (session) {
        router.replace("/?welcome=back");
      } else {
        // No session — check the hash for an error
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const errDesc = params.get("error_description") ?? params.get("error");
        if (errDesc) {
          setError(errDesc.replace(/_/g, " "));
        } else {
          // Also check query params (some providers use ?error=)
          const qParams = new URLSearchParams(window.location.search);
          const qErr = qParams.get("error_description") ?? qParams.get("error");
          if (qErr) {
            setError(qErr.replace(/_/g, " "));
          } else {
            router.replace("/");
          }
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-center">
        <div className="max-w-sm">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-sm font-semibold text-stone-800">Sign-in failed</p>
          <p className="mt-1 text-xs text-stone-500 capitalize">{error}</p>
          <p className="mt-3 text-xs text-stone-400">
            Make sure your site URL is listed under{" "}
            <span className="font-medium">Authentication → URL Configuration</span>{" "}
            in your Supabase dashboard.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="mt-5 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
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
