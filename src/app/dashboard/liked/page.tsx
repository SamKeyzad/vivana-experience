"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type LikedItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  image?: string;
  type: "experience" | "service";
};

export default function LikedPage() {
  const [items, setItems] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("liked_activities")
        .select("id, title, slug, category, price, image, type")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });
      setItems(rows ?? []);
      setLoading(false);
    });
  }, []);

  async function unlike(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    await sb.from("liked_activities").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Liked Activities</h1>
        <p className="mt-1 text-sm text-stone-500">Experiences and services you&apos;ve saved.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-52 animate-pulse rounded-2xl bg-stone-100" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">❤️</div>
          <p className="font-semibold text-stone-700">No saved activities yet</p>
          <p className="mt-1 text-sm text-stone-400">Tap the heart on any experience or service to save it here.</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
            Browse activities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
              {/* Image */}
              <div className="h-36 overflow-hidden bg-stone-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">🗺️</div>
                )}
              </div>
              {/* Unlike button */}
              <button
                onClick={() => unlike(item.id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white"
                title="Remove from liked"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              {/* Info */}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{item.category}</p>
                <p className="mt-0.5 font-semibold text-stone-800 leading-snug">{item.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-stone-700">€{item.price}</p>
                  <Link
                    href={`/${item.type}s/${item.slug}`}
                    className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
