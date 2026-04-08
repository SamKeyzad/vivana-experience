"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  max_guests: number;
  duration: number;
  status: "active" | "draft" | "paused";
  booking_count: number;
  rating: number;
  image?: string;
};

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border border-green-200",
  draft:  "bg-stone-50 text-stone-500 border border-stone-200",
  paused: "bg-amber-50 text-amber-700 border border-amber-200",
};

const inputClass = "w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";

export default function ListingsPage() {
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editData, setEditData]   = useState<Partial<Listing>>({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      const { data: rows } = await sb
        .from("listings")
        .select("id, title, description, category, price, max_guests, duration, status, booking_count, rating, image")
        .eq("provider_id", data.session.user.id)
        .order("created_at", { ascending: false });
      setListings((rows ?? []) as Listing[]);
      setLoading(false);
    });
  }, []);

  function startEdit(listing: Listing) {
    setEditId(listing.id);
    setEditData({
      title:      listing.title,
      description: listing.description,
      price:      listing.price,
      max_guests: listing.max_guests,
      duration:   listing.duration,
      status:     listing.status,
    });
  }

  async function saveEdit(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from("listings").update({
      title:       editData.title,
      description: editData.description,
      price:       editData.price,
      max_guests:  editData.max_guests,
      duration:    editData.duration,
      status:      editData.status,
    }).eq("id", id);
    setSaving(false);
    if (!error) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...editData } as Listing : l));
      setEditId(null);
    }
  }

  async function handleDelete(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    setDeletingId(id);
    setConfirmId(null);
    const { error } = await sb.from("listings").delete().eq("id", id);
    if (!error) setListings(prev => prev.filter(l => l.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
          <p className="mt-1 text-sm text-stone-500">Manage your services and experiences.</p>
        </div>
        <Link
          href="/dashboard/become-host"
          className="shrink-0 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          + New listing
        </Link>
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
          <Link href="/dashboard/become-host" className="mt-4 inline-block rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
            Create a listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
              {/* ── Summary row ── */}
              <div className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {listing.image
                    ? <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-2xl">🗺️</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{listing.title}</p>
                  <p className="text-xs text-stone-400 capitalize">{listing.category?.replace(/_/g, " ")}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
                    <span>{listing.booking_count} bookings</span>
                    {listing.rating > 0 && <span>★ {listing.rating.toFixed(1)}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[listing.status]}`}>
                    {listing.status}
                  </span>
                  <p className="text-sm font-bold text-stone-700">€{listing.price}</p>
                </div>
                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => editId === listing.id ? setEditId(null) : startEdit(listing)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                      editId === listing.id
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-stone-200 text-stone-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                    aria-label="Edit listing"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  {/* Delete */}
                  {confirmId === listing.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setConfirmId(null)} className="rounded-full border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-50">Cancel</button>
                      <button onClick={() => handleDelete(listing.id)} disabled={deletingId === listing.id} className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                        {deletingId === listing.id ? "…" : "Delete"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(listing.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove listing"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* ── Inline edit form ── */}
              {editId === listing.id && (
                <div className="border-t border-stone-100 bg-stone-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-500">Title</label>
                      <input type="text" value={editData.title ?? ""} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-500">Status</label>
                      <select value={editData.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value as Listing["status"] }))} className={inputClass}>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-500">Price (€)</label>
                      <input type="number" min={0} value={editData.price ?? ""} onChange={e => setEditData(d => ({ ...d, price: parseFloat(e.target.value) || 0 }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-500">Max guests</label>
                      <input type="number" min={1} value={editData.max_guests ?? ""} onChange={e => setEditData(d => ({ ...d, max_guests: parseInt(e.target.value) || 1 }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-500">Duration (hours)</label>
                      <input type="number" min={0.5} step={0.5} value={editData.duration ?? ""} onChange={e => setEditData(d => ({ ...d, duration: parseFloat(e.target.value) || 1 }))} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-500">Description</label>
                    <textarea rows={3} value={editData.description ?? ""} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} className={`${inputClass} resize-none`} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setEditId(null)} className="rounded-full border border-stone-200 px-5 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">
                      Cancel
                    </button>
                    <button type="button" onClick={() => saveEdit(listing.id)} disabled={saving} className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
