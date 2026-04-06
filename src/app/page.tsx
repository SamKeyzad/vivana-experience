"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, getSupabase } from "@/lib/supabase";
import { experienceCategories } from "@/data/experiences";
import { serviceCategories } from "@/data/services";
import { museums } from "@/data/museums";

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
  { label: "Religious Sites",  emoji: "⛪" },
  { label: "Outdoor",          emoji: "🌿" },
  { label: "Food & Drink",     emoji: "🍷" },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Tours":           ["tour", "walk", "tram", "viewpoints", "street art", "photography"],
  "Day Trips":       ["sintra", "trip", "day"],
  "Classes":         ["class", "workshop", "painting", "salsa", "kizomba", "craft"],
  "Cooking Classes": ["cooking", "chef", "cook", "pastéis", "nata"],
  "Religious Sites": ["church", "monastery", "cathedral", "religious"],
  "Outdoor":         ["surf", "yoga", "forest", "kayak", "bike", "sunrise", "sunset", "rooftop", "miradouro", "lantern", "picnic", "foraging"],
  "Food & Drink":    ["wine", "seafood", "food", "beer", "tasting", "petiscos", "fado", "board game", "blending"],
};

const SERVICE_PILL_CATEGORIES = [
  { label: "Driver",    emoji: "🚗", description: "Airport runs, day trips & private transport" },
  { label: "Assistant", emoji: "🤝", description: "Local guides, concierge & personal help" },
  { label: "Spa",       emoji: "🧖", description: "Massage, wellness & relaxation" },
  { label: "Hair",      emoji: "✂️",  description: "Cuts, styling & colour" },
  { label: "Nails",     emoji: "💅", description: "Manicure, pedicure & nail art" },
];

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "Driver":    ["airport", "transfer", "driver", "day-trip", "logistics", "transport"],
  "Assistant": ["guide", "concierge", "accommodation", "luggage", "storage", "meal", "planning", "childcare", "babysitting", "business"],
  "Spa":       ["spa", "massage", "wellness"],
  "Hair":      ["hair", "barber", "styling"],
  "Nails":     ["nail", "manicure", "pedicure"],
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [panel, setPanel]           = useState<Panel>(null);
  const [tab, setTab]               = useState<"Experiences" | "Services">("Experiences");
  const [month, setMonth]           = useState(() => dayStart(new Date()));
  const [range, setRange]           = useState<DateRange>({ start: null, end: null });
  const [keyword, setKeyword]       = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string | null>(null);
  const [likedSlugs, setLikedSlugs] = useState<Set<string>>(new Set());

  function toggleLike(e: React.MouseEvent, slug: string) {
    e.preventDefault();
    e.stopPropagation();
    setLikedSlugs(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }
  const [menuOpen, setMenuOpen]     = useState(false);
  const [authMode, setAuthMode]     = useState<AuthMode>(null);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);
  const [user, setUser]             = useState<AppUser | null>(null);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);
  const welcomeFlagRef = useRef<string | null>(null);
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
  const [pwaTab, setPwaTab]               = useState<"ios" | "android">("ios");
  const [nlEmail, setNlEmail]             = useState("");
  const [nlStatus, setNlStatus]           = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail.trim() }),
      });
      if (res.ok) {
        setNlStatus("success"); setNlEmail("");
      } else {
        console.error("Newsletter error:", await res.text());
        setNlStatus("error");
      }
    } catch (err) {
      console.error("Newsletter exception:", err);
      setNlStatus("error");
    }
  }
  const menuRef = useRef<HTMLDivElement>(null);

  // Load session and listen for auth changes
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe
    // (covers page load / refresh), then SIGNED_IN / SIGNED_OUT on changes.
    // This is the single source of truth — no separate getSession() needed.
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); return; }
      const meta = session.user.user_metadata ?? {};
      // Set user immediately from JWT — no DB round-trip required
      setUser({
        firstName: (meta.first_name as string) ?? "",
        lastName:  (meta.last_name  as string) ?? "",
        email:     session.user.email ?? "",
      });
      // Silently try to enrich with profile names (best-effort, won't block UI)
      sb.from("profiles")
        .select("first_name, last_name")
        .eq("id", session.user.id)
        .maybeSingle()
        .then(({ data: p }) => {
          if (p?.first_name || p?.last_name) {
            setUser({
              firstName: p.first_name ?? "",
              lastName:  p.last_name  ?? "",
              email:     session.user.email ?? "",
            });
          }
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Detect welcome=back param from OAuth redirect and store in ref
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const welcome = params.get("welcome");
    if (welcome) {
      welcomeFlagRef.current = welcome;
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Show toast once user state is populated and a welcome flag exists
  useEffect(() => {
    if (user && welcomeFlagRef.current) {
      const flag = welcomeFlagRef.current;
      welcomeFlagRef.current = null;
      const name = user.firstName || user.email.split("@")[0];
      setWelcomeToast(flag === "back" ? `Welcome back, ${name}!` : `Welcome, ${name}!`);
      const t = setTimeout(() => setWelcomeToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [user]);

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
  function handleBecomeHost() {
    if (user) {
      router.push("/dashboard/become-host");
    } else {
      setPostAuthRedirect("/dashboard/become-host");
      setAuthMode("signup");
      setMenuOpen(false);
    }
  }

  function pickDate(day: Date) {
    const d = dayStart(day);
    setRange(prev => {
      if (!prev.start || (prev.start && prev.end)) return { start: d, end: null };
      if (d < prev.start) return { start: d, end: prev.start };
      if (sameDay(d, prev.start)) return { start: d, end: null };
      return { start: prev.start, end: d };
    });
  }

  const [today] = useState(() => dayStart(new Date()));
  const grid  = buildGrid(month);

  return (
    <div>

      {/* ── Welcome toast ───────────────────────────────────────────────────── */}
      {welcomeToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl border border-black/8 text-sm font-semibold text-stone-800 animate-fade-in">
          <span className="text-lg">👋</span>
          {welcomeToast}
        </div>
      )}

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
              <Link href="/access" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">Access</Link>
              <button type="button" onClick={() => { setTab("Experiences"); setMenuOpen(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50">Experiences</button>
              <button type="button" onClick={() => { setTab("Services"); setMenuOpen(false); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-50">Services</button>
              <div className="my-1 border-t border-black/6" />
              <button type="button" onClick={handleBecomeHost} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Become a Host
              </button>
            </nav>
            <div className="border-t border-black/8 p-2 space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-stone-400">Signed in as</p>
                    <p className="text-sm font-semibold text-stone-800 truncate">{user.firstName} {user.lastName}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">My Dashboard</Link>
                  <button type="button" onClick={async () => { await supabase.auth.signOut(); setUser(null); setMenuOpen(false); }} className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">Log out</button>
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
          onClose={() => { setAuthMode(null); setPostAuthRedirect(null); }}
          onSuccess={(u: AppUser, isNew?: boolean) => {
            setUser(u);
            setAuthMode(null);
            const name = u.firstName || u.email.split("@")[0];
            setWelcomeToast(isNew ? `Welcome, ${name}!` : `Welcome back, ${name}!`);
            setTimeout(() => setWelcomeToast(null), 4000);
            if (postAuthRedirect) {
              router.push(postAuthRedirect);
              setPostAuthRedirect(null);
            }
          }}
          onSwitch={(m: AuthMode) => setAuthMode(m)}
          redirectTo={postAuthRedirect ?? undefined}
        />
      )}

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-28 pb-16 text-center text-white overflow-hidden">
        <Image src="/azulejo.jpg" alt="Azulejo tiles" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-amber-800/70 to-stone-900/80" />
        <div className="relative z-10 w-full max-w-3xl mx-auto">
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
                  onClick={() => {
                    setPanel(null);
                    setSearchQuery(keyword);
                    setActiveCategory(null);
                    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                  }}
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
            {tab === "Services"
              ? SERVICE_PILL_CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      const next = activeServiceCategory === cat.label ? null : cat.label;
                      setActiveServiceCategory(next);
                      setSearchQuery("");
                      setKeyword("");
                      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeServiceCategory === cat.label
                        ? "bg-white text-amber-800 shadow-md"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                    {activeServiceCategory === cat.label && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ml-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </button>
                ))
              : CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => {
                      const next = activeCategory === cat.label ? null : cat.label;
                      setActiveCategory(next);
                      setSearchQuery("");
                      setKeyword("");
                      setTab("Experiences");
                      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeCategory === cat.label
                        ? "bg-white text-amber-800 shadow-md"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                    {activeCategory === cat.label && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ml-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </button>
                ))
            }
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
            {(() => {
              const q = searchQuery.toLowerCase();
              const kwds = activeCategory ? (CATEGORY_KEYWORDS[activeCategory] ?? [activeCategory.toLowerCase()]) : [];
              const filtered = experienceCategories.map(cat => ({
                ...cat,
                items: cat.items.filter(item => {
                  const t = item.title.toLowerCase();
                  const matchSearch = !q || t.includes(q);
                  const matchCat = !activeCategory || kwds.some(kw => t.includes(kw));
                  return matchSearch && matchCat;
                }),
              })).filter(cat => cat.items.length > 0);

              if (filtered.length === 0) return (
                <div className="py-20 text-center text-stone-400">
                  <p className="text-lg font-medium">No experiences found</p>
                  <p className="mt-1 text-sm">Try a different search or category</p>
                </div>
              );

              return filtered.map(cat => {
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
                    <div key={tick} className={`mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${anim}`}>
                      {visible.map(item => (
                        <Link key={item.slug} href={`/experiences/${item.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                            <Image src={item.image} alt={item.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                            <button
                              type="button"
                              onClick={e => toggleLike(e, item.slug)}
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition hover:scale-110"
                              aria-label={likedSlugs.has(item.slug) ? "Unlike" : "Like"}
                            >
                              <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${likedSlugs.has(item.slug) ? "fill-red-500 stroke-red-500" : "fill-none stroke-stone-500"}`} strokeWidth={2}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </button>
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
              });
            })()}

            {/* ── Museums of Lisbon ──────────────────────────────────────────── */}
            {!activeCategory && !searchQuery && (() => {
              const { offset, dir, tick } = getSlider("museums");
              const visible = museums.slice(offset, offset + PAGE);
              const anim = tick === 0 ? "" : dir === 1 ? "slide-from-right" : "slide-from-left";
              return (
                <div>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <h2 className="text-xl font-bold text-amber-900">Museums of Lisbon</h2>
                      <p className="mt-1 text-sm text-stone-500">From ancient tiles to contemporary art — {museums.length} museums to explore.</p>
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
                  <div key={tick} className={`mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${anim}`}>
                    {visible.map(museum => (
                      <Link key={museum.slug} href={`/museums/${museum.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                          <Image src={museum.image} alt={museum.name} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                          {museum.temporarilyClosed && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                              Temporarily Closed
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={e => toggleLike(e, museum.slug)}
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition hover:scale-110"
                            aria-label={likedSlugs.has(museum.slug) ? "Unlike" : "Like"}
                          >
                            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${likedSlugs.has(museum.slug) ? "fill-red-500 stroke-red-500" : "fill-none stroke-stone-500"}`} strokeWidth={2}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-stone-800 leading-snug">{museum.name}</h3>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-stone-400">{museum.neighborhood.split("·")[0].trim()}</span>
                            <span className="text-xs font-bold text-amber-700">
                              {museum.price.adult === 0 ? <span className="text-green-600">Free</span> : <>€{museum.price.adult}<span className="font-normal text-stone-400">/adult</span></>}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === "Services" && (
          <div id="services" className="mt-12">

            {/* ── Service cards ───────────────────────────────────────────────── */}
            {(() => {
              const q = searchQuery.toLowerCase();
              const kwds = activeServiceCategory ? (SERVICE_KEYWORDS[activeServiceCategory] ?? []) : [];
              const allServices = serviceCategories.flatMap(cat => cat.subcategories);
              const filtered = allServices.filter(sub => {
                const t = sub.title.toLowerCase();
                const matchSearch = !q || t.includes(q);
                const matchCat = !activeServiceCategory || kwds.some(kw => t.includes(kw));
                return matchSearch && matchCat;
              });

              if (filtered.length === 0) return (
                <div className="py-20 text-center text-stone-400">
                  <p className="text-lg font-medium">No services in this category yet</p>
                  <p className="mt-1 text-sm">More coming soon — check back shortly</p>
                </div>
              );

              const sliderId = activeServiceCategory ?? "all-services";
              const { offset, dir, tick } = getSlider(sliderId);
              const visible = filtered.slice(offset, offset + PAGE);
              const anim = tick === 0 ? "" : dir === 1 ? "slide-from-right" : "slide-from-left";

              return (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h2 className="text-xl font-bold text-amber-900">
                        {activeServiceCategory ?? "All Services"}
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">
                        {activeServiceCategory
                          ? SERVICE_PILL_CATEGORIES.find(c => c.label === activeServiceCategory)?.description
                          : "Practical local services to make your time in Lisbon seamless."}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => slide(sliderId, filtered.length, -1)} disabled={offset === 0} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Previous">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span className="text-xs text-stone-400">{offset + 1}–{Math.min(offset + PAGE, filtered.length)} of {filtered.length}</span>
                      <button type="button" onClick={() => slide(sliderId, filtered.length, 1)} disabled={offset + PAGE >= filtered.length} className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30" aria-label="Next">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                  <div key={tick} className={`mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${anim}`}>
                    {visible.map(sub => (
                      <Link key={sub.slug} href={`/services/${sub.slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white text-left transition hover:shadow-lg hover:-translate-y-0.5">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                          <Image src={sub.image} alt={sub.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw" />
                          <button type="button" onClick={e => toggleLike(e, sub.slug)} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition hover:scale-110" aria-label={likedSlugs.has(sub.slug) ? "Unlike" : "Like"}>
                            <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${likedSlugs.has(sub.slug) ? "fill-red-500 stroke-red-500" : "fill-none stroke-stone-500"}`} strokeWidth={2}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
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
            })()}
          </div>
        )}
      </section>


      {/* ── Access ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h2 className="text-xl font-bold text-amber-900">Access</h2>
            <p className="mt-1 text-sm text-stone-500">Field notes from inside Lisbon — stories about language, belonging, and what it means to really live here.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 grid-cols-2">
          {[
            {
              href: "/access/learning-portuguese",
              image: "/people_cafe.jpg",
              alt: "People at a Lisbon café",
              category: "Language & Belonging",
              readTime: "5 min read",
              title: "Learning Portuguese Changed How I See Lisbon",
              intro: "There's a moment every expat in Lisbon knows. You're sitting in a café, coffee in hand, and the table next to you erupts in laughter.",
            },
            {
              href: "/access/you-came-for-the-weather",
              image: "/lisbon_weather.jpg",
              alt: "Lisbon weather",
              category: "On Staying",
              readTime: "5 min read",
              title: "You Came for the Weather. You Stayed for Something Else.",
              intro: "Everyone has a reason they first come to Lisbon. Usually it's practical. The weather gets you here. Something else keeps you.",
            },
          ].map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white transition hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 480px"
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                  {card.category} · {card.readTime}
                </p>
                <h3 className="mt-1.5 text-xs font-semibold text-stone-800 leading-snug">{card.title}</h3>
                <p className="mt-1.5 text-[11px] text-stone-400 leading-relaxed line-clamp-2">{card.intro}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Become a Host CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">For locals & professionals</p>
          <h2 className="text-3xl font-bold sm:text-4xl leading-tight">
            Share your skills.<br />Earn doing what you love.
          </h2>
          <p className="mt-4 text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
            Whether you&apos;re a chef, a photographer, a tour guide, or a personal trainer — Vivana connects you with guests who want exactly what you offer.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleBecomeHost}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Become a Host
            </button>
            <span className="text-xs text-white/40">Free to join · No monthly fees</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 text-center">
            {[
              { stat: "200+", label: "Active hosts" },
              { stat: "4.9★", label: "Host satisfaction" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-2xl font-bold text-amber-300">{item.stat}</p>
                <p className="mt-1 text-xs text-white/50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Add to Home Screen ──────────────────────────────────────────────── */}
      <section className="border-t border-black/8 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <div className="text-center mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-2">Best Experience</p>
            <h2 className="text-2xl font-bold text-stone-900">Add Vivana to your home screen</h2>
            <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
              Install the app for instant access — no app store needed. Works offline and loads fast.
            </p>
          </div>

          <div className="mx-auto max-w-md">
            {/* Tabs */}
            <div className="flex rounded-xl border border-black/8 bg-stone-100 p-1 mb-6">
              {(["ios", "android"] as const).map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setPwaTab(platform)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    pwaTab === platform
                      ? "bg-white shadow-sm text-stone-900"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {platform === "ios" ? "iPhone / iPad" : "Android"}
                </button>
              ))}
            </div>

            {/* Steps */}
            <div className="rounded-2xl border border-black/8 bg-stone-50 p-6">
              {pwaTab === "ios" ? (
                <ol className="space-y-4">
                  {[
                    { step: "1", text: "Open Safari and visit vivana.com" },
                    { step: "2", text: "Tap the Share icon at the bottom of the screen" },
                    { step: "3", text: `Scroll down and tap \u201cAdd to Home Screen\u201d` },
                    { step: "4", text: "Tap Add — Vivana appears on your home screen" },
                  ].map(item => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {item.step}
                      </span>
                      <p className="text-sm text-stone-600 leading-relaxed">{item.text}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="space-y-4">
                  {[
                    { step: "1", text: "Open Chrome and visit vivana.com" },
                    { step: "2", text: "Tap the three-dot menu in the top-right corner" },
                    { step: "3", text: `Tap \u201cAdd to Home screen\u201d or \u201cInstall app\u201d` },
                    { step: "4", text: "Confirm — Vivana will appear on your home screen" },
                  ].map(item => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {item.step}
                      </span>
                      <p className="text-sm text-stone-600 leading-relaxed">{item.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-16 text-center text-white overflow-hidden">
        <Image src="/azulejo_2.jpg" alt="Azulejo tiles" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900/90 via-amber-900/80 to-stone-900/90" />
        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">Stay in the loop</p>
          <h2 className="text-2xl font-bold leading-snug">Deals &amp; Lisbon stories, straight to your inbox</h2>
          <p className="mt-3 text-sm text-white/65">
            Occasional emails — local picks, insider tips, and early access to new experiences. No spam, ever.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {nlStatus === "success" ? (
              <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-center text-sm font-medium text-amber-800">
                You&apos;re in. Expect only the good stuff.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-400 focus:bg-white/15 focus:ring-2 focus:ring-amber-400/30"
                />
                <button
                  type="submit"
                  disabled={nlStatus === "loading"}
                  className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60 active:scale-95"
                >
                  {nlStatus === "loading" ? "Saving…" : "Subscribe"}
                </button>
              </>
            )}
            {nlStatus === "error" && (
              <p className="w-full text-center text-xs text-red-300 mt-1">Something went wrong — please try again.</p>
            )}
          </form>
        </div>
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
              <li><Link href="/access" className="transition hover:text-white">Access</Link></li>
              <li><Link href="/careers" className="transition hover:text-white">Careers</Link></li>
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

        <div suppressHydrationWarning className="border-t border-stone-800 px-6 py-5 text-center text-xs text-stone-600">
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
  redirectTo,
}: {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: (user: AppUser, isNew?: boolean) => void;
  onSwitch: (mode: AuthMode) => void;
  redirectTo?: string;
}) {
  const [step, setStep]                   = useState(1);
  const [email, setEmail]                 = useState("");
  const [role, setRole]                   = useState<"client" | "provider">("client");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [error, setError]                 = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [oauthLoading, setOauthLoading]   = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleOAuth(provider: "google" | "apple") {
    const sb = getSupabase();
    if (!sb) { setError("Service unavailable. Please try again."); return; }
    setOauthLoading(true);
    setError("");
    try {
      const callbackUrl = `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`;
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      });
      if (error) { setError(error.message); setOauthLoading(false); }
      // On success the page navigates away — no cleanup needed
    } catch {
      setError("Could not connect. Please try again.");
      setOauthLoading(false);
    }
  }

  // ── Social buttons shared UI ──────────────────────────────────────────────
  const SocialButtons = () => (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={oauthLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/12 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-60"
      >
        {/* Google logo */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {oauthLoading ? "Redirecting…" : "Continue with Google"}
      </button>
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 border-t border-black/8" />
        <span className="text-xs text-stone-400">or</span>
        <div className="flex-1 border-t border-black/8" />
      </div>
    </div>
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = getSupabase();
      if (!sb) { setError("Service unavailable."); setLoading(false); return; }
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      const { data: profile } = await sb
        .from("profiles").select("first_name, last_name").eq("id", data.user.id).single();
      setLoading(false);
      onSuccess({
        firstName: profile?.first_name ?? data.user.user_metadata?.first_name ?? "",
        lastName:  profile?.last_name  ?? data.user.user_metadata?.last_name  ?? "",
        email:     data.user.email ?? "",
      }, false); // false = returning user → "Welcome back"
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleSignupStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setStep(2);
  }

  async function handleSignupStep3(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    if (!firstName.trim()) { setError("First name is required."); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }

    try {
      const sb = getSupabase();
      if (!sb) { setError("Service unavailable."); setLoading(false); return; }
      const { data, error: signUpError } = await sb.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, role } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      // Create profile row immediately (session may be null until email confirmed, but user.id is available)
      if (data.user) {
        await sb.from("profiles").upsert({
          id:         data.user.id,
          first_name: firstName,
          last_name:  lastName,
          role,
        }, { onConflict: "id" });
      }

      setLoading(false);
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-black/15 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";
  const btnPrimary = "w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">
            {mode === "login" ? "Log in" : step === 4 ? "You're in! 🎉" : `Create account — Step ${step} of 3`}
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
            <SocialButtons />
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
            <SocialButtons />
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

        {/* ── Sign up step 2 — Role ── */}
        {mode === "signup" && step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">How will you use Vivana?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`rounded-2xl border-2 p-4 text-left transition ${role === "client" ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
              >
                <div className="mb-2 text-2xl">🗺️</div>
                <p className={`text-sm font-semibold ${role === "client" ? "text-amber-800" : "text-stone-700"}`}>Guest</p>
                <p className="mt-0.5 text-xs text-stone-400">Discover and book experiences</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("provider")}
                className={`rounded-2xl border-2 p-4 text-left transition ${role === "provider" ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
              >
                <div className="mb-2 text-2xl">🏷️</div>
                <p className={`text-sm font-semibold ${role === "provider" ? "text-amber-800" : "text-stone-700"}`}>Provider</p>
                <p className="mt-0.5 text-xs text-stone-400">List and sell your services</p>
              </button>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-full border border-black/15 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">← Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700">Continue →</button>
            </div>
          </div>
        )}

        {/* ── Sign up step 3 — Details ── */}
        {mode === "signup" && step === 3 && (
          <form onSubmit={handleSignupStep3} className="space-y-4">
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
              <button type="button" onClick={() => setStep(2)} disabled={loading} className="flex-1 rounded-full border border-black/15 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">← Back</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60">{loading ? "Creating…" : "Create account"}</button>
            </div>
          </form>
        )}

        {/* ── Sign up step 4 — Success ── */}
        {mode === "signup" && step === 4 && (
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

