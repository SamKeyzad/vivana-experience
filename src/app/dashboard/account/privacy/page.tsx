"use client";
import { useState } from "react";

type Toggle = {
  key: string;
  label: string;
  description: string;
};

const PRIVACY_TOGGLES: Toggle[] = [
  { key: "show_profile",     label: "Show my profile to other users",     description: "Allow other guests and hosts to see your public profile." },
  { key: "show_reviews",     label: "Display reviews I've written",        description: "Your activity reviews will be attributed to your name." },
  { key: "activity_status",  label: "Show activity status",               description: "Let hosts see when you were last active on the platform." },
];

const NOTIFICATION_TOGGLES: Toggle[] = [
  { key: "email_bookings",   label: "Booking confirmations",              description: "Receive email receipts and confirmation for every booking." },
  { key: "email_messages",   label: "New messages",                       description: "Get notified by email when you receive a new message." },
  { key: "email_promos",     label: "Special offers & promotions",        description: "Occasional deals and highlights from Vivana." },
  { key: "email_reminders",  label: "Upcoming activity reminders",        description: "Reminders 24 hours before your scheduled activities." },
];

function ToggleRow({ toggle, checked, onChange }: { toggle: Toggle; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-800">{toggle.label}</p>
        <p className="mt-0.5 text-xs text-stone-400">{toggle.description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? "bg-amber-600" : "bg-stone-200"}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function PrivacyPage() {
  const [privacy, setPrivacy] = useState<Record<string, boolean>>({
    show_profile: true, show_reviews: true, activity_status: false,
  });
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email_bookings: true, email_messages: true, email_promos: false, email_reminders: true,
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // In production: persist to profiles table
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Privacy</h1>
        <p className="mt-1 text-sm text-stone-500">Control your privacy and notification preferences.</p>
      </div>

      {/* Privacy settings */}
      <div className="mb-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-stone-800">Profile visibility</h2>
        <div className="divide-y divide-stone-50">
          {PRIVACY_TOGGLES.map(t => (
            <ToggleRow
              key={t.key}
              toggle={t}
              checked={privacy[t.key] ?? false}
              onChange={v => setPrivacy(p => ({ ...p, [t.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-stone-800">Email notifications</h2>
        <div className="divide-y divide-stone-50">
          {NOTIFICATION_TOGGLES.map(t => (
            <ToggleRow
              key={t.key}
              toggle={t}
              checked={notifications[t.key] ?? false}
              onChange={v => setNotifications(p => ({ ...p, [t.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-stone-800">Your data</h2>
        <p className="mb-4 text-xs text-stone-400">Download a copy of all the data we hold about you, including your bookings, profile, and messages.</p>
        <button
          type="button"
          className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          Request data export
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
      >
        {saved ? "Saved ✓" : "Save preferences"}
      </button>
    </div>
  );
}
