"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  address: string;
};

export default function AccountPersonalPage() {
  const [info, setInfo] = useState<PersonalInfo>({
    firstName: "", lastName: "", email: "", phone: "",
    dateOfBirth: "", nationality: "", gender: "", address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [userId, setUserId]   = useState("");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setLoading(false); return; }
      setUserId(data.session.user.id);
      const { data: p } = await sb
        .from("profiles")
        .select("first_name, last_name, phone, date_of_birth, nationality, gender, address")
        .eq("id", data.session.user.id)
        .single();
      setInfo({
        firstName:   p?.first_name    ?? "",
        lastName:    p?.last_name     ?? "",
        email:       data.session.user.email ?? "",
        phone:       p?.phone         ?? "",
        dateOfBirth: p?.date_of_birth ?? "",
        nationality: p?.nationality   ?? "",
        gender:      p?.gender        ?? "",
        address:     p?.address       ?? "",
      });
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !userId) return;
    setSaving(true);
    await sb.from("profiles").update({
      first_name:    info.firstName,
      last_name:     info.lastName,
      phone:         info.phone,
      date_of_birth: info.dateOfBirth || null,
      nationality:   info.nationality,
      gender:        info.gender,
      address:       info.address,
    }).eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
  const labelClass = "mb-1.5 block text-xs font-semibold text-stone-500";

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Personal Information</h1>
        <p className="mt-1 text-sm text-stone-500">Update your personal details. This information is kept private.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Name */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-stone-700">Name</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First name</label>
              <input type="text" value={info.firstName} onChange={e => setInfo(p => ({ ...p, firstName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input type="text" value={info.lastName} onChange={e => setInfo(p => ({ ...p, lastName: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-stone-700">Contact details</p>
          <div>
            <label className={labelClass}>Email address</label>
            <input type="email" value={info.email} disabled className={`${inputClass} cursor-not-allowed bg-stone-50 text-stone-400`} />
            <p className="mt-1 text-xs text-stone-400">Email can be changed in Login &amp; Security settings.</p>
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input type="tel" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="+351 912 345 678" className={inputClass} />
          </div>
        </div>

        {/* Personal details */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-stone-700">Personal details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date of birth</label>
              <input type="date" value={info.dateOfBirth} onChange={e => setInfo(p => ({ ...p, dateOfBirth: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select value={info.gender} onChange={e => setInfo(p => ({ ...p, gender: e.target.value }))} className={inputClass}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Nationality</label>
            <input type="text" value={info.nationality} onChange={e => setInfo(p => ({ ...p, nationality: e.target.value }))} placeholder="e.g. Portuguese" className={inputClass} />
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-stone-700">Address</p>
          <textarea rows={3} value={info.address} onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} placeholder="Street, city, postcode, country" className={`${inputClass} resize-none`} />
        </div>

        <button type="submit" disabled={saving} className="w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
