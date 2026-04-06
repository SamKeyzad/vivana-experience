import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "@/data/access";
import NewsletterForm from "./NewsletterForm";

export const metadata: Metadata = {
  title: "Access — Vivana Lisbon",
  description: "Field notes from inside Lisbon — stories about language, belonging, and what it really means to live here.",
};

export default function AccessIndexPage() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 border-b border-black/8 bg-white/90 px-5 py-3 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </Link>
        <span className="text-sm font-semibold text-stone-800">Access</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-16 text-center text-white overflow-hidden">
        <Image
          src="/azulejo.jpg"
          alt="Azulejo tiles"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/70 to-stone-900/80" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">Access · Lisbon</p>
          <h1 className="text-3xl font-bold sm:text-4xl leading-tight">Field notes from inside Lisbon</h1>
          <p className="mt-3 text-sm text-white/65 max-w-lg mx-auto">
            Stories about language, belonging, and what it means to really live here — not just visit.
          </p>
        </div>
      </section>

      {/* ── Articles grid ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 pt-12 pb-16">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {articles.map(article => (
            <Link
              key={article.slug}
              href={`/access/${article.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                  {article.category} · {article.readTime}
                </p>
                <h2 className="mt-2 text-sm font-semibold text-stone-800 leading-snug">
                  {article.title}
                </h2>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed flex-1">
                  {article.intro}
                </p>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-700">
                  Read
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Add to Home Screen ──────────────────────────────────────────────── */}
      <section className="border-t border-black/8 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <div className="text-center mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">Best Experience</p>
            <h2 className="text-2xl font-bold text-stone-900">Add Vivana to your home screen</h2>
            <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
              Install the app for instant access — no app store needed. It works offline, loads fast, and lives right on your home screen.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">

            {/* iOS */}
            <div className="rounded-2xl border border-black/8 bg-stone-50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-white text-lg">

                </div>
                <p className="text-sm font-bold text-stone-800">iPhone / iPad</p>
              </div>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "Open Safari and visit vivana.com" },
                  { step: "2", text: "Tap the Share icon at the bottom of the screen" },
                  { step: "3", text: `Scroll down and tap \u201cAdd to Home Screen\u201d` },
                  { step: "4", text: "Tap Add — done!" },
                ].map(item => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                      {item.step}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Android */}
            <div className="rounded-2xl border border-black/8 bg-stone-50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white text-lg">
                  ▲
                </div>
                <p className="text-sm font-bold text-stone-800">Android</p>
              </div>
              <ol className="space-y-3">
                {[
                  { step: "1", text: "Open Chrome and visit vivana.com" },
                  { step: "2", text: "Tap the three-dot menu in the top-right corner" },
                  { step: "3", text: `Tap \u201cAdd to Home screen\u201d or \u201cInstall app\u201d` },
                  { step: "4", text: "Confirm — Vivana will appear on your home screen" },
                ].map(item => (
                  <li key={item.step} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                      {item.step}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>

          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-16 text-center text-white overflow-hidden">
        <Image
          src="/azulejo_2.jpg"
          alt="Azulejo tiles"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/90 via-amber-900/80 to-stone-900/90" />
        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">Stay in the loop</p>
          <h2 className="text-2xl font-bold leading-snug">Deals & Lisbon stories, straight to your inbox</h2>
          <p className="mt-3 text-sm text-white/65">
            Occasional emails — local picks, insider tips, and early access to new experiences. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-300">
        <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-bold tracking-wide text-white">VIVANA</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              Discover the real Lisbon through local eyes — authentic moments crafted by people who love this city.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition hover:text-white">Home</Link></li>
              <li><Link href="/#explore" className="transition hover:text-white">Experiences</Link></li>
              <li><Link href="/#explore" className="transition hover:text-white">Services</Link></li>
              <li><Link href="/access" className="transition hover:text-white">Access</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Experiences</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><span className="text-stone-500">Popular in Lisbon</span></li>
              <li><span className="text-stone-500">Unique Activities</span></li>
              <li><span className="text-stone-500">Gathering &amp; Socialising</span></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition hover:text-white">Log in</Link></li>
              <li><Link href="/" className="transition hover:text-white">Sign up</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 px-6 py-5 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} Vivana. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
