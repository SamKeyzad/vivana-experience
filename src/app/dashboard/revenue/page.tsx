"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Payout = {
  id: string;
  amount: number;
  status: "paid" | "pending" | "processing";
  date: string;
  bookingCount: number;
};

const STATUS_STYLES = {
  paid:       "bg-green-50 text-green-700 border border-green-200",
  pending:    "bg-amber-50 text-amber-700 border border-amber-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
};

export default function RevenuePage() {
  const [payouts, setPayouts]   = useState<Payout[]>([]);
  const [stats, setStats]       = useState({ total: 0, thisMonth: 0, pending: 0, bookings: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("payouts")
        .select("id, amount, status, date, booking_count")
        .eq("provider_id", data.session.user.id)
        .order("date", { ascending: false });

      const ps: Payout[] = (rows ?? []).map((r: Record<string, unknown>) => ({
        id:           String(r.id),
        amount:       Number(r.amount ?? 0),
        status:       (r.status as Payout["status"]) ?? "pending",
        date:         String(r.date ?? ""),
        bookingCount: Number(r.booking_count ?? 0),
      }));
      setPayouts(ps);

      const now = new Date();
      const total     = ps.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
      const thisMonth = ps.filter(p => {
        const d = new Date(p.date);
        return p.status === "paid" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((s, p) => s + p.amount, 0);
      const pending   = ps.filter(p => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount, 0);
      const bookings  = ps.reduce((s, p) => s + p.bookingCount, 0);
      setStats({ total, thisMonth, pending, bookings });
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Revenue</h1>
        <p className="mt-1 text-sm text-stone-500">Track your earnings and payout history.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total earned",   value: `€${stats.total.toFixed(2)}`,    color: "text-stone-900"  },
          { label: "This month",     value: `€${stats.thisMonth.toFixed(2)}`, color: "text-amber-700"  },
          { label: "Pending payout", value: `€${stats.pending.toFixed(2)}`,  color: "text-amber-600"  },
          { label: "Total bookings", value: stats.bookings.toString(),        color: "text-stone-900"  },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{stat.label}</p>
            <p className={`mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bank account notice */}
      <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800">Set up payouts</p>
        <p className="mt-0.5 text-xs text-amber-600">Connect a bank account to receive your earnings. Payouts are processed monthly.</p>
        <button className="mt-3 rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700">
          Connect bank account
        </button>
      </div>

      {/* Payout history */}
      <h2 className="mb-3 text-sm font-semibold text-stone-700">Payout history</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-100" />)}
        </div>
      ) : payouts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
          <p className="text-2xl mb-2">💰</p>
          <p className="font-semibold text-stone-600">No payouts yet</p>
          <p className="mt-1 text-sm text-stone-400">Your first payout will appear here after your first booking.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
          {payouts.map((payout, i) => (
            <div key={payout.id} className={`flex items-center justify-between px-5 py-4 ${i < payouts.length - 1 ? "border-b border-stone-50" : ""}`}>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {new Date(payout.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
                <p className="text-xs text-stone-400">{payout.bookingCount} booking{payout.bookingCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-stone-800">€{payout.amount.toFixed(2)}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[payout.status]}`}>
                  {payout.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
