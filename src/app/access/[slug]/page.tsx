import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/data/access";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.title} — Vivana Lisbon`,
    description: article.intro,
  };
}

type Segment = string | { em: string };

function renderParagraph(segments: Segment[], index: number) {
  return (
    <p key={index} className="text-sm leading-[1.9] text-stone-600">
      {segments.map((seg, i) =>
        typeof seg === "string" ? (
          seg
        ) : (
          <em key={i}>{seg.em}</em>
        )
      )}
    </p>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const others = articles.filter((a) => a.slug !== slug);

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 border-b border-black/8 bg-white/90 px-5 py-3 backdrop-blur">
        <Link
          href="/access"
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Access
        </Link>
        <span className="truncate text-sm font-semibold text-stone-800">{article.title}</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-[420px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">
            Access · {article.category}
          </p>
          <h1 className="text-2xl font-bold leading-snug sm:text-4xl max-w-xl">
            {article.title}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* ── Article ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-5 py-12">

        {/* Lead */}
        <p className="text-base font-medium leading-relaxed text-stone-700 border-l-2 border-amber-500 pl-5 mb-8">
          {article.intro}
        </p>

        {/* Body */}
        <div className="space-y-5">
          {article.body.map((para, i) => renderParagraph(para, i))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-black/8" />

        {/* More notes */}
        {others.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-stone-900 mb-6">More from Access</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {others.map(other => (
                <Link
                  key={other.slug}
                  href={`/access/${other.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                    <Image
                      src={other.image}
                      alt={other.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                      {other.category}
                    </p>
                    <h3 className="mt-1.5 text-sm font-semibold text-stone-800 leading-snug">
                      {other.title}
                    </h3>
                    <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700">
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
        )}
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
