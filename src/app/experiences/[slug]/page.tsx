import { experiences } from "@/data/experiences";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = experiences.find((e) => e.slug === slug);
  if (!exp) return {};
  return {
    title: `${exp.title} — Vivana Lisbon`,
    description: exp.shortDescription,
  };
}

// ── Calendar helpers ──────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function UnavailableCalendar() {
  const now = new Date();
  const months = [
    { year: now.getFullYear(), month: now.getMonth() },
    {
      year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
      month: (now.getMonth() + 1) % 12,
    },
  ];
  return (
    <div className="space-y-6">
      {months.map(({ year, month }) => (
        <div key={`${year}-${month}`}>
          <p className="mb-3 text-center text-sm font-semibold text-stone-700">
            {MONTHS[month]} {year}
          </p>
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-1">
            {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {buildGrid(year, month).map((day, i) => (
              <div
                key={i}
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                  day
                    ? "bg-red-50 text-red-300 line-through"
                    : ""
                }`}
              >
                {day ?? ""}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-red-500 font-medium">
        No spots available for the next 2 months
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = experiences.find((e) => e.slug === slug);
  if (!exp) notFound();

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
        <span className="truncate text-sm font-semibold text-stone-800">{exp.title}</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-[400px]">
        <Image
          src={exp.image}
          alt={exp.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
          <p className="text-2xl mb-1">{exp.emoji}</p>
          <h1 className="text-2xl font-bold leading-snug sm:text-4xl">{exp.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">{exp.shortDescription}</p>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl gap-10 px-5 py-10 lg:grid lg:grid-cols-3">

        {/* Left column */}
        <div className="space-y-10 lg:col-span-2">

          {/* About */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">About this experience</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-600">
              {exp.fullDescription.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </section>

          {/* What's included */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">What&apos;s included</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {exp.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="mt-0.5 shrink-0 text-amber-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Details */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">Details</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Duration", value: exp.duration },
                { label: "Group size", value: exp.groupSize },
                { label: "Languages", value: exp.languages.join(", ") },
                { label: "Meeting point", value: exp.meetingPoint },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-black/8 bg-white p-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{label}</dt>
                  <dd className="mt-1 text-sm text-stone-800">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Right column — booking card */}
        <aside className="mt-10 lg:mt-0">
          <div className="sticky top-20 space-y-5 rounded-3xl border border-black/8 bg-white p-6 shadow-sm">

            {/* Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900">€{exp.price}</span>
              <span className="text-sm text-stone-400">per guest</span>
            </div>

            <div className="border-t border-black/6" />

            {/* Availability calendar */}
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Availability
              </p>
              <UnavailableCalendar />
            </div>

            <div className="border-t border-black/6" />

            {/* Book button (disabled) */}
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-stone-200 py-3 text-sm font-semibold text-stone-400"
            >
              No spots available
            </button>

            {/* Payment info */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">Payment</p>
              <p className="mt-1 text-sm text-amber-900">
                Paid in person at the event. We accept <strong>cash</strong> and <strong>card</strong>.
              </p>
            </div>

          </div>
        </aside>
      </div>

    </div>
  );
}
