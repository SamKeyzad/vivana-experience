"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Listing = {
  id: string;
  title: string;
  category: string;
  price: number;
  status: "active" | "draft" | "paused";
  bookings: number;
  rating: number;
  image?: string;
  slug: string;
};

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border border-green-200",
  draft:  "bg-stone-50 text-stone-500 border border-stone-200",
  paused: "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("listings")
        .select("id, title, category, price, status, booking_count, rating, image, slug")
        .eq("provider_id", data.session.user.id)
        .order("created_at", { ascending: false });

      setListings((rows ?? []).map((r: Record<string, unknown>) => ({
        id:       String(r.id),
        title:    String(r.title ?? ""),
        category: String(r.category ?? ""),
        price:    Number(r.price ?? 0),
        status:   (r.status as Listing["status"]) ?? "draft",
        bookings: Number(r.booking_count ?? 0),
        rating:   Number(r.rating ?? 0),
        image:    r.image ? String(r.image) : undefined,
        slug:     String(r.slug ?? ""),
      })));
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
          <p className="mt-1 text-sm text-stone-500">Manage your services and experiences.</p>
        </div>
        <button className="shrink-0 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
          + New listing
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">🗂️</div>
          <p className="font-semibold text-stone-700">No listings yet</p>
          <p className="mt-1 text-sm text-stone-400">Create your first listing to start receiving bookings.</p>
          <button className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
            Create a listing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {listing.image
                  ? <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center text-2xl">🗺️</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">{listing.title}</p>
                <p className="text-xs text-stone-400">{listing.category}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
                  <span>{listing.bookings} bookings</span>
                  {listing.rating > 0 && <span>★ {listing.rating.toFixed(1)}</span>}
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[listing.status]}`}>
                  {listing.status}
                </span>
                <p className="text-sm font-bold text-stone-700">€{listing.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
