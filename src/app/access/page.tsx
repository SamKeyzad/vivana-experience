import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "@/data/access";

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

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 pt-10 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">Access</p>
        <h1 className="text-2xl font-bold text-stone-900">Field notes from inside Lisbon</h1>
        <p className="mt-2 text-sm text-stone-500 max-w-lg">
          Stories about language, belonging, and what it means to really live here — not just visit.
        </p>
      </div>

      {/* ── Articles grid ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-5 pb-16">
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
              <li><span className="text-stone-500">Gathering & Socialising</span></li>
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
