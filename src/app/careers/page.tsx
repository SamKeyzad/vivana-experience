import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsletterForm from "@/app/access/NewsletterForm";

export const metadata: Metadata = {
  title: "Careers — Vivana Lisbon",
  description: "Find your place at Vivana. We're building the best way to experience Lisbon — join us.",
};

const VALUES = [
  {
    icon: "🌍",
    title: "Work from anywhere",
    body: "We're remote-first. Whether you're in Lisbon, Berlin, or Bali — as long as the work gets done, where you do it is your call.",
  },
  {
    icon: "🤝",
    title: "Real teamwork",
    body: "No ego, no silos. We move fast together, share credit, and support each other when things get hard — which they sometimes do.",
  },
  {
    icon: "🏠",
    title: "Own it like it's yours",
    body: "Every person here has a real stake in what we build. You won't be handed a task list — you'll shape the product, the culture, and the outcome.",
  },
  {
    icon: "🌱",
    title: "Grow with intention",
    body: "We invest in your development. Regular 1:1s, a learning budget, and stretch projects that actually stretch you — not just look good on paper.",
  },
];

const OPEN_ROLES = [
  { title: "Full-Stack Engineer",    team: "Product",   type: "Full-time · Remote" },
  { title: "Experience Curator",     team: "Supply",    type: "Full-time · Lisbon" },
  { title: "Growth Lead",            team: "Marketing", type: "Full-time · Remote" },
  { title: "Community Manager",      team: "Community", type: "Part-time · Lisbon" },
  { title: "Brand & Content Writer", team: "Brand",     type: "Freelance · Remote" },
];

const ARTICLES = [
  {
    href: "/access/what-lisbon-taught-me-about-slowness",
    label: "Culture",
    title: "What Lisbon taught me about slowness",
  },
  {
    href: "/access/the-language-nobody-warns-you-about",
    label: "Language",
    title: "The language nobody warns you about",
  },
  {
    href: "/access/finding-a-fado-that-feels-real",
    label: "Music",
    title: "Finding a fado that feels real",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Top nav ───────────────────────────────────────────────────────────── */}
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
        <span className="text-sm font-semibold text-stone-800">Careers</span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-20 text-center text-white overflow-hidden">
        <Image
          src="/azulejo.jpg"
          alt="Azulejo tiles"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-amber-800/75 to-stone-900/85" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">Careers · Vivana</p>
          <h1 className="text-4xl font-bold sm:text-5xl leading-tight">Find your place</h1>
          <p className="mt-4 text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            We&apos;re building the most authentic way to experience Lisbon. If that sounds like something worth working on, read on.
          </p>
          <a
            href="#open-roles"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400 active:scale-95"
          >
            See open roles
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">How we work</p>
          <h2 className="text-2xl font-bold text-stone-900">What it actually feels like</h2>
          <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
            Not just values on a wall. Things we genuinely try to live by.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map(v => (
            <div key={v.title} className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                {v.icon}
              </div>
              <h3 className="text-sm font-bold text-stone-900">{v.title}</h3>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Open roles ───────────────────────────────────────────────────────── */}
      <section id="open-roles" className="border-t border-black/8 bg-white py-20">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">Opportunities</p>
            <h2 className="text-2xl font-bold text-stone-900">Open roles</h2>
            <p className="mt-2 text-sm text-stone-500">
              Don&apos;t see a perfect fit? Send us a note anyway — we&apos;re always interested in curious people.
            </p>
          </div>

          <div className="space-y-3">
            {OPEN_ROLES.map(role => (
              <a
                key={role.title}
                href={`mailto:careers@vivana.co?subject=Application — ${encodeURIComponent(role.title)}`}
                className="group flex items-center justify-between rounded-2xl border border-black/8 bg-stone-50 px-6 py-5 transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition">{role.title}</p>
                  <p className="mt-0.5 text-xs text-stone-400">{role.team} · {role.type}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition">
                  Apply
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* General application */}
          <div className="mt-8 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-6 py-6 text-center">
            <p className="text-sm font-semibold text-amber-900">Don&apos;t see your role?</p>
            <p className="mt-1 text-xs text-amber-800/70 max-w-sm mx-auto">
              We hire for attitude and curiosity first. Send your CV and tell us how you&apos;d make Vivana better.
            </p>
            <a
              href="mailto:careers@vivana.co?subject=General Application"
              className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-700"
            >
              Send a general application
            </a>
          </div>
        </div>
      </section>

      {/* ── Life at Vivana / articles ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">Context</p>
          <h2 className="text-2xl font-bold text-stone-900">Understand where we come from</h2>
          <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
            Read what inspired us — the city, the people, the feeling we&apos;re trying to recreate.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ARTICLES.map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col gap-3 rounded-2xl border border-black/8 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">{a.label}</p>
              <p className="text-sm font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition">{a.title}</p>
              <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-amber-700">
                Read
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 text-white">
        <Image src="/azulejo.jpg" alt="Azulejo tiles" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/85 via-amber-800/75 to-stone-900/85" />
        <div className="relative z-10 mx-auto max-w-xl px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">Stay in the loop</p>
          <h2 className="text-2xl font-bold">Hear about roles before anyone else</h2>
          <p className="mt-3 text-sm text-white/65 max-w-sm mx-auto">
            Subscribe and we&apos;ll let you know when new positions open up. No spam, just signal.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/8 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <Link href="/" className="text-lg font-bold tracking-wide text-amber-800">VIVANA</Link>
              <p className="mt-1 text-xs text-stone-400">Authentic Lisbon experiences, curated by locals.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
              <Link href="/" className="hover:text-stone-800 transition">Experiences</Link>
              <Link href="/access" className="hover:text-stone-800 transition">Access</Link>
              <Link href="/careers" className="hover:text-stone-800 transition text-amber-700 font-medium">Careers</Link>
              <a href="mailto:careers@vivana.co" className="hover:text-stone-800 transition">careers@vivana.co</a>
            </div>
          </div>
          <p className="mt-8 text-[10px] text-stone-300">© {new Date().getFullYear()} Vivana. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
