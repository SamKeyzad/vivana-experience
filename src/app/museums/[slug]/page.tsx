import { museums } from "@/data/museums";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export function generateStaticParams() {
  return museums.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const museum = museums.find((m) => m.slug === slug);
  if (!museum) return {};
  return {
    title: `${museum.name} — Vivana Lisbon`,
    description: museum.shortDescription,
  };
}

export default async function MuseumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const museum = museums.find((m) => m.slug === slug);
  if (!museum) notFound();

  const isFree = museum.price.adult === 0;

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
        <span className="text-sm font-semibold text-stone-800 truncate">{museum.name}</span>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-[420px]">
        <Image
          src={museum.image}
          alt={museum.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-1">
            {museum.emoji}  {museum.neighborhood}
          </p>
          <h1 className="text-2xl font-bold leading-snug sm:text-4xl">{museum.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">{museum.shortDescription}</p>
        </div>
      </div>

      {/* ── Temporarily closed banner ───────────────────────────────────────── */}
      {museum.temporarilyClosed && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-4">
          <div className="mx-auto max-w-5xl flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-red-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-red-700">Temporarily Closed</p>
              {museum.closureNote && <p className="mt-0.5 text-sm text-red-600">{museum.closureNote}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl gap-10 px-5 py-10 lg:grid lg:grid-cols-3">

        {/* Left column */}
        <div className="space-y-10 lg:col-span-2">

          {/* About */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">About</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-600">
              {museum.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">Highlights</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {museum.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="mt-0.5 shrink-0 text-amber-600">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Gallery */}
          <section>
            <h2 className="text-lg font-bold text-stone-900">Gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {museum.gallery.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200"
                >
                  <Image
                    src={src}
                    alt={`${museum.name} — photo ${i + 1}`}
                    fill
                    className="object-cover transition hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — info card */}
        <aside className="mt-10 lg:mt-0">
          <div className="sticky top-20 space-y-5 rounded-3xl border border-black/8 bg-white p-6 shadow-sm">

            {/* Price */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Admission
              </p>
              <div className="mt-2.5 space-y-1.5">
                {museum.slug === "maat" ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Portugal residents</span>
                      <span className="font-bold text-stone-900">€11</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Outside Portugal</span>
                      <span className="font-bold text-stone-900">€15</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">65+, unemployed, students 12+</span>
                      <span className="font-semibold text-stone-900">€11</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Children</span>
                      <span className="font-semibold text-stone-900">{museum.price.child}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Adult</span>
                      <span className="font-bold text-stone-900">
                        {isFree ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `€${museum.price.adult.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {!isFree && museum.price.reduced > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Reduced</span>
                        <span className="font-semibold text-stone-900">€{museum.price.reduced.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Children</span>
                      <span className="font-semibold text-stone-900">{museum.price.child}</span>
                    </div>
                  </>
                )}
              </div>
              {museum.price.note && (
                <p className="mt-2 text-xs leading-relaxed text-stone-400">{museum.price.note}</p>
              )}
            </div>

            {/* Free days */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                Free Entry
              </p>
              <p className="mt-1 text-sm text-amber-900">{museum.freeDays}</p>
            </div>

            <div className="border-t border-black/6" />

            {/* Hours */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Opening Hours
              </p>
              <p className="mt-2 text-sm text-stone-700">{museum.openingHours}</p>
              <p className="mt-1 text-xs text-stone-400">Closed: {museum.closedOn}</p>
            </div>

            {/* Address */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Address
              </p>
              <p className="mt-2 text-sm text-stone-700">{museum.address}</p>
            </div>

            <div className="border-t border-black/6" />

            {/* Book / website */}
            {museum.temporarilyClosed && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Temporarily Closed</p>
                <p className="mt-1 text-xs text-red-500">Visits are not available at this time.</p>
              </div>
            )}
            <a
              href={museum.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                museum.temporarilyClosed
                  ? "bg-stone-200 text-stone-500 cursor-default pointer-events-none"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              Official Website &amp; Tickets →
            </a>
          </div>
        </aside>
      </div>

    </div>
  );
}
