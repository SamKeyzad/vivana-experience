"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-invocation — exchangeCodeForSession
    // consumes the PKCE code verifier from localStorage and must only run once.
    if (ran.current) return;
    ran.current = true;

    const sb = getSupabase();
    if (!sb) { router.replace("/"); return; }

    // OAuth providers (Google, etc.) redirect here with ?error= when something goes wrong
    // (e.g. the user denied access, or the redirect URL is not allowlisted in Supabase).
    const errorParam = params.get("error");
    if (errorParam) {
      const desc = params.get("error_description") ?? errorParam;
      setError(desc.replace(/_/g, " "));
      return;
    }

    const code = params.get("code");
    if (!code) {
      // No code and no error — unusual, just go home.
      router.replace("/");
      return;
    }

    async function finish() {
      const { data, error: exchError } = await sb!.auth.exchangeCodeForSession(code!);
      if (exchError || !data.session) {
        setError(exchError?.message ?? "Sign-in failed. Please try again.");
        return;
      }

      const user = data.session.user;
      const next = params.get("next");

      try {
        // Check whether this Google/OAuth user already has a profile row.
        const { data: existingProfile } = await sb!
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        const isNewUser = !existingProfile;

        // Upsert so OAuth users always have a profile row.
        const meta = user.user_metadata ?? {};
        const fullName: string = (meta.full_name ?? meta.name ?? "") as string;
        const parts = fullName.trim().split(" ");
        const firstName = (meta.first_name ?? parts[0] ?? "") as string;
        const lastName  = (meta.last_name  ?? parts.slice(1).join(" ") ?? "") as string;

        await sb!.from("profiles").upsert(
          { id: user.id, first_name: firstName, last_name: lastName },
          { onConflict: "id", ignoreDuplicates: true },
        );

        if (isNewUser) {
          router.replace("/dashboard/account?onboarding=1");
        } else {
          router.replace(next ?? "/?welcome=back");
        }
      } catch {
        // Profile operations are non-critical — still redirect the user home.
        router.replace(next ?? "/?welcome=back");
      }
    }

    finish();
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
            Make sure your site URL is added to the allowed redirect URLs in your Supabase dashboard
            under <span className="font-medium">Authentication → URL Configuration</span>.
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

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
