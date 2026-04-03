"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Booking = {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  image?: string;
  slug?: string;
};

const STATUS_STYLES = {
  upcoming:  "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("bookings")
        .select("id, title, date, status, price, image, slug")
        .eq("user_id", data.session.user.id)
        .order("date", { ascending: false });
      setBookings(rows ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Bookings</h1>
        <p className="mt-1 text-sm text-stone-500">All your activity reservations in one place.</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2 flex-wrap">
        {(["all", "upcoming", "completed", "cancelled"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-amber-600 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">📅</div>
          <p className="font-semibold text-stone-700">No bookings yet</p>
          <p className="mt-1 text-sm text-stone-400">When you book an experience, it will appear here.</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
            Explore activities
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {booking.image ? (
                  <img src={booking.image} alt={booking.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🗺️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">{booking.title}</p>
                <p className="text-sm text-stone-500">{new Date(booking.date).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[booking.status]}`}>
                  {booking.status}
                </span>
                <p className="mt-1 text-sm font-semibold text-stone-700">€{booking.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
