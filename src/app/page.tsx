"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase, getSupabase } from "@/lib/supabase";
import { museums } from "@/data/museums";
import { experienceCategories } from "@/data/experiences";
import { serviceCategories } from "@/data/services";

// ── Date helpers ─────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function dayStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}
function buildGrid(ref: Date): Date[] {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const cells: Date[] = [];
  for (let i = first.getDay(); i > 0; i--)
    cells.push(new Date(ref.getFullYear(), ref.getMonth(), 1 - i));
  const total = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  for (let i = 0; i < total; i++)
    cells.push(new Date(ref.getFullYear(), ref.getMonth(), i + 1));
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    cells.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return cells;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Panel    = "when" | null;
type DateRange = { start: Date | null; end: Date | null };
type AuthMode = "login" | "signup" | null;
type AppUser  = { firstName: string; lastName: string; email: string };

const CATEGORIES = [
  { label: "Tours",            emoji: "🗺️" },
  { label: "Day Trips",        emoji: "🚌" },
  { label: "Classes",          emoji: "🎓" },
  { label: "Cooking Classes",  emoji: "🧑‍🍳" },
  { label: "Museums",          emoji: "🏛️" },
  { label: "Religious Sites",  emoji: "⛪" },
  { label: "Outdoor",          emoji: "🌿" },
  { label: "Food & Drink",     emoji: "🍷" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [panel, setPanel]           = useState<Panel>(null);
  const [tab, setTab]               = useState<"Experiences" | "Services">("Experiences");
  const [month, setMonth]           = useState(() => dayStart(new Date()));
  const [range, setRange]           = useState<DateRange>({ start: null, end: null });
  const [keyword, setKeyword]       = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [user, setUser]         = useState<AppUser | null>(null);
  const PAGE = 5;
  type SliderState = { offset: number; dir: 1 | -1; tick: number };
  const [sliders, setSliders] = useState<Record<string, SliderState>>({});
  const getSlider = (id: string): SliderState => sliders[id] ?? { offset: 0, dir: 1, tick: 0 };
  const slide = (id: string, total: number, dir: 1 | -1) =>
    setSliders(prev => {
      const cur = prev[id] ?? { offset: 0, dir: 1, tick: 0 };
      return { ...prev, [id]: { offset: Math.min(total - PAGE, Math.max(0, cur.offset + dir)), dir, tick: cur.tick + 1 } };
    });
  const barRef  = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load session and listen for auth changes
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    sb.auth.getSession().then(async ({ data }) => {
      const session = data?.session;
      if (!session) return;
      const { data: profile } = await sb
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single();
      setUser({
        firstName: profile?.first_name ?? "",
        lastName:  profile?.last_name  ?? "",
        email:     session.user.email  ?? "",
      });
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { setUser(null); return; }
      const { data: profile } = await sb
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .single();
      setUser({
        firstName: profile?.first_name ?? "",
        lastName:  profile?.last_name  ?? "",
        email:     session.user.email  ?? "",
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reset panel when tab switches
  useEffect(() => { setPanel(null); }, [tab]);

  // Close search panels on outside click / Escape
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanel(null); };
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!barRef.current?.contains(t) && !t.closest("[data-panel]")) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onOut);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("click", onOut); };
  }, [panel]);

  // Close burger menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    const onOut = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onOut);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("click", onOut); };
  }, [menuOpen]);

  // ── Labels ──────────────────────────────────────────────────────────────────
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateLabel =
    range.start && range.end ? `${fmt(range.start)} – ${fmt(range.end)}`
    : range.start ? fmt(range.start)
    : "Add dates";

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function pickDate(day: Date) {
    const d = dayStart(day);
    setRange(prev => {
      if (!prev.start || (prev.start && prev.end)) return { start: d, end: null };
      if (d < prev.start) return { start: d, end: prev.start };
      if (sameDay(d, prev.start)) return { start: d, end: null };
      return { start: prev.start, end: d };
    });
  }

  const today = dayStart(new Date());
  const grid  = buildGrid(month);

  return (
    <div>

      {/* ── Burger menu (fixed) ─────────────────────────────────────────────── */}
      <div
        ref={menuRef}
        className="fixed top-5 right-5 z-50"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md border border-black/10 text-stone-800 transition hover:bg-stone-50"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl">
            <nav className="p-2">
              <a href="#explore" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">Explore</a>
              <button type="button" onClick={() => { setTab("Experiences"); setMenuOpen(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50">Experiences</button>
              <button type="button" onClick={() => { setTab("Services"); setMenuOpen(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50">Services</button>
            </nav>
            <div className="border-t border-black/8 p-2 space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-stone-400">Signed in as</p>
                    <p className="text-sm font-semibold text-stone-800 truncate">{user.firstName} {user.lastName}</p>
                  </div>
                  <button type="button" onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">Log out</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setAuthMode("login"); setMenuOpen(false); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-amber-700 transition hover:bg-amber-50">Log in</button>
                  <button type="button" onClick={() => { setAuthMode("signup"); setMenuOpen(false); }} className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-amber-700">Sign up</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Auth modal ──────────────────────────────────────────────────────── */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={(u: AppUser) => { setUser(u); setAuthMode(null); }}
          onSwitch={(m: AuthMode) => setAuthMode(m)}
        />
      )}

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 px-6 pt-28 pb-16 text-center text-white">
        <div className="w-full max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">Lisbon · Portugal</p>
          <h1 className="text-4xl font-bold sm:text-5xl leading-tight">
            Discover the Real Lisbon
          </h1>
          <p className="mt-3 text-sm text-white/65 max-w-lg mx-auto">
            Book authentic local experiences — from Fado nights to surf sessions, all curated by people who love this city.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
            <span>500+ experiences</span><span>·</span>
            <span>200+ local hosts</span><span>·</span>
            <span>10k+ happy guests</span>
          </div>

          {/* ── Search bar ───────────────────────────────────────────────── */}
          <div ref={barRef} className="mt-8 flex justify-center">
            <div className="flex w-full max-w-2xl items-stretch rounded-full bg-white shadow-2xl">

              {/* When */}
              <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setPanel(p => p === "when" ? null : "when")}
                  className={`flex h-full flex-col items-start justify-center rounded-l-full px-6 py-4 text-left transition ${
                    panel === "when" ? "bg-black/5" : "hover:bg-black/[0.04]"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-black/45">When</span>
                  <span className="mt-0.5 text-sm font-medium text-black whitespace-nowrap">{dateLabel}</span>
                </button>

                {panel === "when" && (
                  <div data-panel className="absolute left-0 top-full z-50 mt-3 w-80 rounded-3xl border border-black/10 bg-white p-5 shadow-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <button type="button" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-full p-1.5 transition hover:bg-black/8">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span className="text-sm font-semibold text-black">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
                      <button type="button" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-full p-1.5 transition hover:bg-black/8">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                    <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-black/35">
                      {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {grid.map(day => {
                        const inMonth = day.getMonth() === month.getMonth();
                        const isStart = sameDay(day, range.start);
                        const isEnd   = sameDay(day, range.end);
                        const inRange = range.start && range.end && day > range.start && day < range.end;
                        const isToday = sameDay(day, today);
                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => pickDate(day)}
                            className={[
                              "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition",
                              !inMonth ? "text-black/20" : "text-black",
                              isStart || isEnd ? "!bg-amber-600 !text-white" : "",
                              inRange ? "bg-amber-100" : "",
                              isToday && !isStart && !isEnd ? "ring-1 ring-black/40" : "",
                              inMonth && !isStart && !isEnd ? "hover:bg-black/5" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPanel(null)}
                      className="mt-4 w-full rounded-full bg-amber-600 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-3.5 w-px bg-black/12" />

              {/* Keyword search */}
              <div className="flex flex-1 items-center px-5" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Search experiences, places…"
                  className="w-full bg-transparent text-sm text-black placeholder-black/35 outline-none"
                />
                {keyword && (
                  <button type="button" onClick={() => setKeyword("")} className="ml-2 text-black/30 hover:text-black/60">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>

              {/* Search button */}
              <div className="flex items-center p-2">
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  aria-label="Search"
                  className="flex items-center justify-center rounded-full bg-amber-600 p-4 transition hover:bg-amber-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-white">
                    <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* ── Category pills ───────────────────────────────────────────────── */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(c => c === cat.label ? null : cat.label)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat.label
                    ? "bg-white text-amber-800 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tabs section ────────────────────────────────────────────────────── */}
      <section id="explore" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex gap-1 rounded-full border border-black/10 bg-stone-100 p-1 w-fit mx-auto">
          {(["Experiences", "Services"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-8 py-2.5 text-sm font-semibold transition ${
                tab === t ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:text-black"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Experiences" && (
          <div id="experiences" className="mt-12 space-y-14">
            {experienceCategories.map(cat => {
              const { offset, dir, tick } = getSlider(cat.id);
              const visible = cat.items.slice(offset, offset + PAGE);
              const anim = tick === 0 ? "" : dir === 1 ? "slide-from-right" : "slide-from-left";
              return (
                <div key={cat.id}>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <h2 className="text-xl font-bold text-amber-900">{cat.label}</h2>
                      <p className="mt-1 text-sm text-stone-500">{cat.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                      <button type="button" onClick={() => slide(cat.id, cat.items.length, -1)} disabled={offset === 0} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Previous">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span className="text-xs text-stone-400">{offset + 1}–{Math.min(offset + PAGE, cat.items.length)} of {cat.items.length}</span>
                      <button type="button" onClick={() => slide(cat.id, cat.items.length, 1)} disabled={offset + PAGE >= cat.items.length} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Next">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                  <div key={tick} className={`mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-hidden ${anim}`}>
                    {visible.map(item => (
                      <Link key={item.slug} href={`/experiences/${item.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                          <Image src={item.image} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-stone-800 leading-snug">{item.title}</h3>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-stone-400">{item.bookings} booked</span>
                            <span className="text-xs font-bold text-amber-700">€{item.price}<span className="font-normal text-stone-400">/guest</span></span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Services" && (
          <div id="services" className="mt-12 space-y-14">
            {serviceCategories.map(cat => {
              const { offset, dir, tick } = getSlider(cat.id);
              const visible = cat.subcategories.slice(offset, offset + PAGE);
              const anim = tick === 0 ? "" : dir === 1 ? "slide-from-right" : "slide-from-left";
              return (
                <div key={cat.id}>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <h2 className="text-xl font-bold text-amber-900">{cat.label}</h2>
                      <p className="mt-1 text-sm text-stone-500">{cat.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                      <button type="button" onClick={() => slide(cat.id, cat.subcategories.length, -1)} disabled={offset === 0} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Previous">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span className="text-xs text-stone-400">{offset + 1}–{Math.min(offset + PAGE, cat.subcategories.length)} of {cat.subcategories.length}</span>
                      <button type="button" onClick={() => slide(cat.id, cat.subcategories.length, 1)} disabled={offset + PAGE >= cat.subcategories.length} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Next">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                  <div key={tick} className={`mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-hidden ${anim}`}>
                    {visible.map(sub => (
                      <Link key={sub.slug} href={`/services/${sub.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                          <Image src={sub.image} alt={sub.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-stone-800 leading-snug">{sub.title}</h3>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-stone-400">{sub.bookings} booked</span>
                            <span className="text-xs font-bold text-amber-700">€{sub.price}<span className="font-normal text-stone-400">/guest</span></span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Museums section ─────────────────────────────────────────────────── */}
      <section id="museums" className="mx-auto max-w-6xl px-6 pb-16">
        {(() => {
          const { offset, dir, tick } = getSlider("museums");
          const visible = museums.slice(offset, offset + PAGE);
          const anim = tick === 0 ? "" : dir === 1 ? "slide-from-right" : "slide-from-left";
          return (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-amber-900">Museums of Lisbon</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    From ancient tiles to contemporary art — {museums.length} museums to explore.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-1">
                  <button type="button" onClick={() => slide("museums", museums.length, -1)} disabled={offset === 0} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Previous">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-xs text-stone-400">{offset + 1}–{Math.min(offset + PAGE, museums.length)} of {museums.length}</span>
                  <button type="button" onClick={() => slide("museums", museums.length, 1)} disabled={offset + PAGE >= museums.length} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Next">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
              <div key={tick} className={`grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-hidden ${anim}`}>
                {visible.map((museum) => (
                  <Link key={museum.slug} href={`/museums/${museum.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                      <Image src={museum.image} alt={museum.name} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-stone-800 leading-snug">{museum.name}</h3>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400">{museum.neighborhood.split("·")[0].trim()}</span>
                        <span className="text-xs font-bold text-amber-700">
                          {museum.price.adult === 0
                            ? <span className="text-green-600">Free</span>
                            : <>€{museum.price.adult}<span className="font-normal text-stone-400">/adult</span></>}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          );
        })()}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-300">
        <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold tracking-wide text-white">VIVANA</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              Discover the real Lisbon through local eyes — authentic moments crafted by people who love this city.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#explore" className="transition hover:text-white">Home</a></li>
              <li><button type="button" onClick={() => { setTab("Experiences"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="transition hover:text-white">Experiences</button></li>
              <li><button type="button" onClick={() => { setTab("Services"); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="transition hover:text-white">Services</button></li>
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Experiences</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><span className="text-stone-500">Popular in Lisbon</span></li>
              <li><span className="text-stone-500">Unique Activities</span></li>
              <li><span className="text-stone-500">Gathering & Socialising</span></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><button type="button" onClick={() => setAuthMode("login")} className="transition hover:text-white">Log in</button></li>
              <li><button type="button" onClick={() => setAuthMode("signup")} className="transition hover:text-white">Sign up</button></li>
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

// ── AuthModal ─────────────────────────────────────────────────────────────────
function AuthModal({
  mode,
  onClose,
  onSuccess,
  onSwitch,
}: {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  onSwitch: (mode: AuthMode) => void;
}) {
  const [step, setStep]                   = useState(1);
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [error, setError]                 = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    const { data: profile } = await supabase
      .from("profiles").select("first_name, last_name").eq("id", data.user.id).single();
    onSuccess({ firstName: profile?.first_name ?? "", lastName: profile?.last_name ?? "", email: data.user.email ?? "" });
  }

  function handleSignupStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setStep(2);
  }

  async function handleSignupStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    if (!firstName.trim()) { setError("First name is required."); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    setLoading(false);
    setStep(3);
  }

  const inputClass = "w-full rounded-xl border border-black/15 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
  const btnPrimary = "w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">
            {mode === "login" ? "Log in" : step === 3 ? "You're in! 🎉" : `Create account — Step ${step} of 2`}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Login ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} autoFocus />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Logging in…" : "Log in"}</button>
            <p className="text-center text-xs text-stone-400">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => onSwitch("signup")} className="font-semibold text-amber-600 hover:underline">Sign up</button>
            </p>
          </form>
        )}

        {/* ── Sign up step 1 — Email ── */}
        {mode === "signup" && step === 1 && (
          <form onSubmit={handleSignupStep1} className="space-y-4">
            <p className="text-sm text-stone-500">Start with your email address.</p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} autoFocus />
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" className={btnPrimary}>Continue →</button>
            <p className="text-center text-xs text-stone-400">
              Already have an account?{" "}
              <button type="button" onClick={() => onSwitch("login")} className="font-semibold text-amber-600 hover:underline">Log in</button>
            </p>
          </form>
        )}

        {/* ── Sign up step 2 — Details ── */}
        {mode === "signup" && step === 2 && (
          <form onSubmit={handleSignupStep2} className="space-y-4">
            <p className="text-sm text-stone-500">Almost there — tell us a bit about yourself.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">First name</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ana" className={inputClass} autoFocus />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-500">Last name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Silva" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className={inputClass} />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Confirm password</label>
              <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className={inputClass} />
            </div>
            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} disabled={loading} className="flex-1 rounded-full border border-black/15 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">← Back</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60">{loading ? "Creating…" : "Create account"}</button>
            </div>
          </form>
        )}

        {/* ── Sign up step 3 — Success ── */}
        {mode === "signup" && step === 3 && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">✉️</div>
            <div>
              <p className="text-sm font-semibold text-stone-800">Check your email, {firstName}!</p>
              <p className="mt-1 text-xs text-stone-400">We sent a confirmation link to <span className="font-medium text-stone-600">{email}</span>. Click it to activate your account.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={btnPrimary}
            >
              Got it
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

