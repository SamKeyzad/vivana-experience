"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type ViewMode = "guest" | "host";

type DashUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "client" | "provider";
};

type NavItem = { href: string; label: string; icon: React.ReactNode };

// ── SVG Icons ────────────────────────────────────────────────────────────────
const I = {
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  card:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  heart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  chat:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  grid:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  globe:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>,
  id:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h3"/></svg>,
  lock:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  shield:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const CLIENT_NAV: NavItem[] = [
  { href: "/dashboard/bookings",     label: "Bookings",          icon: I.calendar },
  { href: "/dashboard/transactions", label: "Transactions",      icon: I.card     },
  { href: "/dashboard/liked",        label: "Liked Activities",  icon: I.heart    },
  { href: "/dashboard/messages",     label: "Messages",          icon: I.chat     },
];

const PROVIDER_NAV: NavItem[] = [
  { href: "/dashboard/listings",     label: "My Listings",       icon: I.grid     },
  { href: "/dashboard/bookings",     label: "Bookings",          icon: I.calendar },
  { href: "/dashboard/revenue",      label: "Revenue",           icon: I.chart    },
  { href: "/dashboard/messages",     label: "Messages",          icon: I.chat     },
];

const COMMON_NAV: NavItem[] = [
  { href: "/dashboard/profile",      label: "Profile",           icon: I.user     },
  { href: "/dashboard/language",     label: "Language",          icon: I.globe    },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/dashboard/account",          label: "Personal Information", icon: I.id     },
  { href: "/dashboard/account/security", label: "Login & Security",     icon: I.lock   },
  { href: "/dashboard/account/privacy",  label: "Privacy",              icon: I.shield },
];

// ── NavLink ───────────────────────────────────────────────────────────────────
function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-amber-50 text-amber-800"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
      }`}
    >
      <span className={active ? "text-amber-700" : "text-stone-400"}>{item.icon}</span>
      {item.label}
    </Link>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, onSignOut, pathname, onClose, viewMode, setViewMode }: {
  user: DashUser | null;
  onSignOut: () => void;
  pathname: string;
  onClose?: () => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
}) {
  const isProvider = user?.role === "provider";
  const mainNav = viewMode === "host" ? PROVIDER_NAV : CLIENT_NAV;

  return (
    <div className="flex h-full flex-col">
      {/* Logo + user */}
      <div className="px-4 py-5 border-b border-stone-100">
        <Link href="/" className="text-xl font-bold tracking-wide text-amber-800" onClick={onClose}>
          VIVANA
        </Link>
        {user && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
              {(user.firstName.charAt(0) || user.email.charAt(0)).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-800 leading-none">{user.firstName} {user.lastName}</p>
              <p className="mt-0.5 text-[10px] text-stone-400">{viewMode === "host" ? "Hosting" : "Travelling"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Guest / Host mode switcher */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex rounded-xl bg-stone-100 p-0.5">
          <button
            type="button"
            onClick={() => {
              setViewMode("guest");
              localStorage.setItem("dashViewMode", "guest");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              viewMode === "guest"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Guest
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("host");
              localStorage.setItem("dashViewMode", "host");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              viewMode === "host"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Host
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {viewMode === "host" && !isProvider ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-xs font-semibold text-amber-800">Not hosting yet</p>
            <p className="mt-1 text-[11px] text-amber-700/80 leading-relaxed">Share your skills or experiences with visitors in Lisbon.</p>
            <Link
              href="/dashboard/become-host"
              onClick={onClose}
              className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Become a Host
            </Link>
          </div>
        ) : (
          mainNav.map(item => (
            <NavLink key={item.href} item={item} pathname={pathname} onClick={onClose} />
          ))
        )}

        <div className="my-3 border-t border-stone-100" />

        {COMMON_NAV.map(item => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onClose} />
        ))}

        <div className="my-3 border-t border-stone-100" />

        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Account Settings</p>
        {ACCOUNT_NAV.map(item => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onClose} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-stone-100 px-3 py-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <span className="text-red-400">{I.logout}</span>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<DashUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("guest");

  // Restore persisted view mode
  useEffect(() => {
    const saved = localStorage.getItem("dashViewMode");
    if (saved === "host" || saved === "guest") setViewMode(saved);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      const session = data?.session;
      if (!session) { router.replace("/"); return; }

      const { data: profile } = await sb
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", session.user.id)
        .single();

      const role = profile?.role === "provider" ? "provider" : "client";
      setUser({
        id: session.user.id,
        firstName: profile?.first_name ?? "",
        lastName:  profile?.last_name  ?? "",
        email:     session.user.email  ?? "",
        role,
      });
      // Default providers to host view
      if (role === "provider") {
        const saved = localStorage.getItem("dashViewMode");
        if (!saved) setViewMode("host");
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-stone-200 bg-white">
        <Sidebar user={user} onSignOut={handleSignOut} pathname={pathname} viewMode={viewMode} setViewMode={setViewMode} />
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <div className="absolute right-3 top-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                {I.close}
              </button>
            </div>
            <Sidebar user={user} onSignOut={handleSignOut} pathname={pathname} onClose={() => setSidebarOpen(false)} viewMode={viewMode} setViewMode={setViewMode} />
          </aside>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-4 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100"
          >
            {I.menu}
          </button>
          <Link href="/" className="text-lg font-bold tracking-wide text-amber-800">VIVANA</Link>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
