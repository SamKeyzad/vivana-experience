"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: "charge" | "refund";
  status: "paid" | "pending" | "refunded";
};

const STATUS_STYLES = {
  paid:     "bg-green-50 text-green-700 border border-green-200",
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  refunded: "bg-stone-50 text-stone-500 border border-stone-200",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("transactions")
        .select("id, description, date, amount, type, status")
        .eq("user_id", data.session.user.id)
        .order("date", { ascending: false });
      setTransactions(rows ?? []);
      setLoading(false);
    });
  }, []);

  const totalSpent = transactions.filter(t => t.type === "charge" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalRefunded = transactions.filter(t => t.type === "refund").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Transactions</h1>
        <p className="mt-1 text-sm text-stone-500">Your payment history and receipts.</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white border border-stone-100 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">€{totalSpent.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-100 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Refunds</p>
          <p className="mt-1 text-2xl font-bold text-green-600">€{totalRefunded.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-100 p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Bookings Paid</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{transactions.filter(t => t.status === "paid").length}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-100" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">💳</div>
          <p className="font-semibold text-stone-700">No transactions yet</p>
          <p className="mt-1 text-sm text-stone-400">Your payment history will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
          {transactions.map((tx, i) => (
            <div key={tx.id} className={`flex items-center justify-between px-5 py-4 ${i < transactions.length - 1 ? "border-b border-stone-50" : ""}`}>
              <div>
                <p className="text-sm font-semibold text-stone-800">{tx.description}</p>
                <p className="text-xs text-stone-400">{new Date(tx.date).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.type === "refund" ? "text-green-600" : "text-stone-800"}`}>
                  {tx.type === "refund" ? "+" : "-"}€{tx.amount.toFixed(2)}
                </p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[tx.status]}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
