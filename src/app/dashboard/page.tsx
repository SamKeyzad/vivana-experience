"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Overview = {
  firstName: string;
  role: "client" | "provider";
  bookingCount: number;
  listingCount: number;
  likedCount: number;
};

export default function DashboardHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data: authData }) => {
      const session = authData?.session;
      if (!session) { setLoading(false); return; }

      const uid = session.user.id;
      const meta = session.user.user_metadata ?? {};

      // Fire all queries in parallel
      const [profileRes, bookingsRes, listingsRes] = await Promise.all([
        sb.from("profiles").select("first_name, role").eq("id", uid).single(),
        sb.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "upcoming"),
        sb.from("listings").select("id", { count: "exact", head: true }).eq("provider_id", uid),
      ]);

      setData({
        firstName:    profileRes.data?.first_name ?? meta.first_name ?? session.user.email?.split("@")[0] ?? "",
        role:         profileRes.data?.role === "provider" ? "provider" : "client",
        bookingCount: bookingsRes.count ?? 0,
        listingCount: listingsRes.count ?? 0,
        likedCount:   0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-100" />)}
      </div>
    );
  }

  const name = data?.firstName ?? "";
  const isProvider = data?.role === "provider";

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {name ? `Hey, ${name} 👋` : "Welcome to your dashboard"}
        </h1>
        <p className="mt-1 text-sm text-stone-500">Here's a quick look at what's going on.</p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/bookings"
          className="group flex flex-col gap-1 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <span className="text-2xl font-bold text-stone-900">{data?.bookingCount ?? 0}</span>
          <span className="text-xs font-medium text-stone-500">Upcoming bookings</span>
          <span className="mt-1 text-[11px] font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition">View →</span>
        </Link>

        {isProvider && (
          <Link
            href="/dashboard/listings"
            className="group flex flex-col gap-1 rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <span className="text-2xl font-bold text-amber-800">{data?.listingCount ?? 0}</span>
            <span className="text-xs font-medium text-amber-700">Active listings</span>
            <span className="mt-1 text-[11px] font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition">Manage →</span>
          </Link>
        )}

        <Link
          href="/dashboard/messages"
          className="group flex flex-col gap-1 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <span className="text-2xl font-bold text-stone-900">—</span>
          <span className="text-xs font-medium text-stone-500">Messages</span>
          <span className="mt-1 text-[11px] font-semibold text-amber-700 opacity-0 group-hover:opacity-100 transition">Open →</span>
        </Link>
      </div>

      {/* ── Listings section (hosts) ────────────────────────────── */}
      {isProvider && (
        <div className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900">My Listings</h2>
              <p className="text-xs text-stone-400 mt-0.5">Experiences and services you&apos;re offering</p>
            </div>
            <Link
              href="/dashboard/listings"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
            >
              View all →
            </Link>
          </div>
          <ListingsPreview />
        </div>
      )}

      {/* ── Quick links ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900">Quick links</h2>
        </div>
        <div className="divide-y divide-stone-100">
          <Link href="/dashboard/bookings" className="flex items-center justify-between px-5 py-3.5 text-sm text-stone-700 hover:bg-stone-50 transition">
            <span>My Bookings</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
          </Link>
          <Link href="/dashboard/profile" className="flex items-center justify-between px-5 py-3.5 text-sm text-stone-700 hover:bg-stone-50 transition">
            <span>Edit Profile</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
          </Link>
          <Link href="/dashboard/account" className="flex items-center justify-between px-5 py-3.5 text-sm text-stone-700 hover:bg-stone-50 transition">
            <span>Personal Information</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-300" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
          </Link>
          {!isProvider && (
            <Link href="/dashboard/become-host" className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition">
              <span>Become a Host</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          )}
          {isProvider && (
            <Link href="/dashboard/become-host" className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition">
              <span>+ Add new listing</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Listings preview (last 3) ─────────────────────────────────────────────────
function ListingsPreview() {
  const [listings, setListings] = useState<{ id: string; title: string; status: string; price: number; booking_count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("listings")
        .select("id, title, status, price, booking_count")
        .eq("provider_id", data.session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setListings(rows ?? []);
      setLoading(false);
    });
  }, []);

  const STATUS_DOT: Record<string, string> = {
    active: "bg-green-400",
    draft:  "bg-stone-300",
    paused: "bg-amber-400",
  };

  if (loading) return (
    <div className="p-5 space-y-3">
      {[1, 2].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-stone-100" />)}
    </div>
  );

  if (listings.length === 0) return (
    <div className="py-10 text-center">
      <p className="text-sm text-stone-500">No listings yet.</p>
      <Link href="/dashboard/become-host" className="mt-3 inline-block rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700">
        Create your first listing
      </Link>
    </div>
  );

  return (
    <div className="divide-y divide-stone-100">
      {listings.map(l => (
        <div key={l.id} className="flex items-center gap-3 px-5 py-3.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[l.status] ?? "bg-stone-300"}`} />
          <span className="flex-1 truncate text-sm font-medium text-stone-800">{l.title}</span>
          <span className="text-xs text-stone-400">{l.booking_count ?? 0} bookings</span>
          <span className="text-xs font-semibold text-stone-700">€{l.price}</span>
        </div>
      ))}
      <div className="px-5 py-3">
        <Link href="/dashboard/listings" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
          Manage all listings →
        </Link>
      </div>
    </div>
  );
}
