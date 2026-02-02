"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const pickString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setIsSubmitting(true);

      if (mode === "signin") {
        const email = pickString(formData.get("email")).toLowerCase();
        const password = pickString(formData.get("password"));

        if (!email || !password) {
          setError("Please enter your email and password.");
          return;
        }

        if (typeof window === "undefined") {
          setError("Authentication is unavailable in this environment.");
          return;
        }

        const storedRaw = window.localStorage.getItem("vivanaUser");

        if (!storedRaw) {
          setError("No account found. Please sign up first.");
          return;
        }

        const storedUser = JSON.parse(storedRaw) as Record<string, unknown> & {
          email?: string;
          password?: string;
        };

        if (
          typeof storedUser.email !== "string" ||
          storedUser.email.toLowerCase() !== email ||
          typeof storedUser.password !== "string" ||
          storedUser.password !== password
        ) {
          setError("Invalid email or password.");
          return;
        }

        window.localStorage.setItem(
          "vivanaUser",
          JSON.stringify({ ...storedUser, isAuthenticated: true })
        );

        const redirectTo = window.sessionStorage.getItem("vivana:redirect") || "/";
        window.sessionStorage.removeItem("vivana:redirect");

        form.reset();
        router.push(redirectTo);
        return;
      }

      const email = pickString(formData.get("email")).toLowerCase();
      const password = pickString(formData.get("password"));
      const confirmPassword = pickString(formData.get("confirmPassword"));

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (typeof window === "undefined") {
        setError("Sign up is unavailable in this environment.");
        return;
      }

      const userProfile = {
        email,
        password,
        avatar: null,
        createdAt: new Date().toISOString(),
        isAuthenticated: true,
      };

      window.localStorage.setItem("vivanaUser", JSON.stringify(userProfile));

      form.reset();
      const redirectTo = window.sessionStorage.getItem("vivana:redirect") || "/";
      window.sessionStorage.removeItem("vivana:redirect");

      router.push(redirectTo);
    } catch (submitError) {
      console.error(submitError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-amber-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-amber-600 text-white p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-wide">Welcome to Vivana</h1>
              <p className="mt-4 text-sm text-amber-100">
                Join our community to explore authentic Portuguese experiences curated by locals.
              </p>
            </div>
            <div className="mt-10 space-y-2 text-sm text-amber-100/80">
              <p className="font-semibold uppercase tracking-wide">Why sign up?</p>
              <ul className="space-y-1">
                <li>• Hand-picked experiences tailored to you.</li>
                <li>• Connect with local hosts and travelers.</li>
                <li>• Save your favorite adventures for later.</li>
              </ul>
            </div>
          </div>

          <div className="p-10">
            <div className="mb-8 flex space-x-2">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  mode === "signin"
                    ? "bg-amber-600 text-white"
                    : "border border-black text-amber-600"
                }`}
                onClick={() => setMode("signin")}
              >
                Log in
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  mode === "signup"
                    ? "bg-amber-600 text-white"
                    : "border border-black text-amber-600"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>

            {mode === "signin" ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <p className="rounded-lg border border-black bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-stone-700">
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-black px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-stone-700">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 w-full rounded-lg border border-black px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-semibold text-amber-600 hover:underline"
                    onClick={() => alert("Password recovery flow coming soon.")}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Please wait..." : "Log in"}
                </button>

                <p className="text-xs text-stone-500 text-center">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="text-amber-600 font-semibold"
                    onClick={() => setMode("signup")}
                  >
                    Create one
                  </button>
                </p>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <p className="rounded-lg border border-black bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-stone-700">
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-black px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    className="mt-1 w-full rounded-lg border border-black px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-700">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                    className="mt-1 w-full rounded-lg border border-black px-4 py-2 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
                    placeholder="Repeat your password"
                  />
                </div>

                <p className="text-xs text-stone-500">
                  You can add your profile details later from your account page.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Please wait..." : "Create account"}
                </button>

                <p className="text-xs text-stone-500 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-amber-600 font-semibold"
                    onClick={() => setMode("signin")}
                  >
                    Log in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
