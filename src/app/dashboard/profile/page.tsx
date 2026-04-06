"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Profile = {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  languages: string[];
  avatar?: string;
  joinedAt: string;
  reviewCount: number;
  rating: number;
};

const LANG_OPTIONS = ["English", "Portuguese", "Spanish", "French", "German", "Italian", "Arabic", "Chinese"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    firstName: "", lastName: "", bio: "", location: "", languages: [],
    joinedAt: "", reviewCount: 0, rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      setUserId(data.session.user.id);
      const { data: p } = await sb
        .from("profiles")
        .select("first_name, last_name, bio, location, languages, avatar, created_at, review_count, rating")
        .eq("id", data.session.user.id)
        .single();
      if (p) {
        setProfile({
          firstName:   p.first_name   ?? "",
          lastName:    p.last_name    ?? "",
          bio:         p.bio          ?? "",
          location:    p.location     ?? "",
          languages:   p.languages    ?? [],
          avatar:      p.avatar,
          joinedAt:    p.created_at   ?? "",
          reviewCount: p.review_count ?? 0,
          rating:      p.rating       ?? 0,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !userId) return;
    setSaving(true);
    setSaveError("");
    const { error } = await sb.from("profiles").update({
      bio:       profile.bio,
      location:  profile.location,
      languages: profile.languages,
    }).eq("id", userId);
    setSaving(false);
    if (error) {
      console.error("Profile save error:", error.code, error.message);
      setSaveError("Failed to save. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function toggleLang(lang: string) {
    setProfile(p => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter(l => l !== lang)
        : [...p.languages, lang],
    }));
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Public Profile</h1>
        <p className="mt-1 text-sm text-stone-500">This information is visible to other users and hosts.</p>
      </div>

      {/* Avatar + name banner */}
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl font-bold text-amber-700">
            {profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-stone-800 text-white shadow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>
        </div>
        <div>
          <p className="text-lg font-bold text-stone-900">{profile.firstName} {profile.lastName}</p>
          {profile.joinedAt && (
            <p className="text-sm text-stone-400">Member since {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          )}
          {profile.reviewCount > 0 && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-amber-500">★</span>
              <span className="text-sm font-semibold text-stone-700">{profile.rating.toFixed(1)}</span>
              <span className="text-sm text-stone-400">({profile.reviewCount} reviews)</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Bio */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-stone-700">About me</label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell others a bit about yourself — your interests, where you're from, what you love about Lisbon…"
            className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <p className="mt-1.5 text-right text-xs text-stone-400">{profile.bio.length}/400</p>
        </div>

        {/* Location */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Location</label>
          <input
            type="text"
            value={profile.location}
            onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g. Lisbon, Portugal"
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        {/* Languages */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-sm font-semibold text-stone-700">Languages I speak</label>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  profile.languages.includes(lang)
                    ? "bg-amber-600 text-white"
                    : "border border-stone-200 text-stone-600 hover:border-amber-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {saveError && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{saveError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
