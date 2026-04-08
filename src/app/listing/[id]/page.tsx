"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  price_type: string | null;
  category: string | null;
  city: string | null;
  image: string | null;
  booking_count: number;
  duration: number | null;
  max_guests: number | null;
  rating: number | null;
  provider_id: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
    bio: string | null;
  } | null;
};

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !id) return;

    async function load() {
      // Fetch listing first — provider_id references auth.users, not profiles,
      // so we can't use an implicit PostgREST join for the host info.
      const { data: row } = await sb!.from("listings")
        .select("id, title, description, price, price_type, category, city, image, booking_count, duration, max_guests, rating, provider_id")
        .eq("id", id)
        .maybeSingle();

      if (!row) { setLoading(false); return; }

      // Fetch host profile separately using provider_id
      let profiles = null;
      if (row.provider_id) {
        const { data: p } = await sb!.from("profiles")
          .select("first_name, last_name, avatar, bio")
          .eq("id", row.provider_id)
          .maybeSingle();
        profiles = p;
      }

      setListing({ ...row, profiles } as ListingDetail);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <svg className="h-8 w-8 animate-spin text-stone-300" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 text-center px-6">
        <p className="text-lg font-semibold text-stone-700">Listing not found</p>
        <Link href="/" className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">Back to home</Link>
      </div>
    );
  }

  const host = listing.profiles;
  const hostName = [host?.first_name, host?.last_name].filter(Boolean).join(" ") || "Local Host";
  const priceLabel = listing.price_type === "per_group" ? "per group" : "per guest";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Back */}
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
        {/* Image */}
        <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-stone-100">
          {listing.image
            ? <Image src={listing.image} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            : <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-amber-50 to-amber-100">🌟</div>
          }
        </div>

        {/* Title + price */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{listing.title}</h1>
            {listing.city && <p className="mt-1 text-sm text-stone-500">📍 {listing.city}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-amber-700">€{listing.price}</p>
            <p className="text-xs text-stone-400">{priceLabel}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4">
          {listing.duration != null && (
            <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-center">
              <p className="text-xs text-stone-400">Duration</p>
              <p className="mt-0.5 text-sm font-semibold text-stone-800">{listing.duration}h</p>
            </div>
          )}
          {listing.max_guests != null && (
            <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-center">
              <p className="text-xs text-stone-400">Max guests</p>
              <p className="mt-0.5 text-sm font-semibold text-stone-800">{listing.max_guests}</p>
            </div>
          )}
          {listing.booking_count > 0 && (
            <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-center">
              <p className="text-xs text-stone-400">Bookings</p>
              <p className="mt-0.5 text-sm font-semibold text-stone-800">{listing.booking_count}</p>
            </div>
          )}
          {listing.rating != null && listing.rating > 0 && (
            <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-center">
              <p className="text-xs text-stone-400">Rating</p>
              <p className="mt-0.5 text-sm font-semibold text-stone-800">⭐ {listing.rating.toFixed(1)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="rounded-3xl border border-black/8 bg-white p-6">
            <h2 className="text-base font-bold text-stone-900 mb-3">About this listing</h2>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Host */}
        {host && (
          <div className="rounded-3xl border border-black/8 bg-white p-6 flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-amber-100 overflow-hidden">
              {host.avatar
                ? <Image src={host.avatar} alt={hostName} width={48} height={48} className="object-cover" />
                : <div className="h-full w-full flex items-center justify-center text-xl font-bold text-amber-700">{hostName[0]}</div>
              }
            </div>
            <div>
              <p className="text-xs text-stone-400">Hosted by</p>
              <p className="text-sm font-semibold text-stone-800">{hostName}</p>
              {host.bio && <p className="mt-1 text-xs text-stone-500 leading-relaxed">{host.bio}</p>}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="w-full rounded-full bg-amber-600 py-4 text-sm font-semibold text-white transition hover:bg-amber-700">
          Request to Book
        </button>
      </div>
    </div>
  );
}
