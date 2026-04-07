"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

// ── Constants ─────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { id: "catering",            label: "Catering",             emoji: "🍽️" },
  { id: "chef",                label: "Chef",                 emoji: "👨‍🍳" },
  { id: "tea_session",         label: "Tea Session",          emoji: "🍵" },
  { id: "hair",                label: "Hair",                 emoji: "💇" },
  { id: "makeup",              label: "Makeup",               emoji: "💄" },
  { id: "massage",             label: "Massage",              emoji: "💆" },
  { id: "nails",               label: "Nails",                emoji: "💅" },
  { id: "personal_training",   label: "Personal Training",    emoji: "🏋️" },
  { id: "running_buddy",       label: "Running Buddy",        emoji: "🏃" },
  { id: "photography",         label: "Photography",          emoji: "📸" },
  { id: "yoga",                label: "Yoga",                 emoji: "🧘" },
  { id: "prepared_meals",      label: "Prepared Meals",       emoji: "🥗" },
  { id: "spa",                 label: "Spa",                  emoji: "🧖" },
  { id: "driver",              label: "Driver",               emoji: "🚗" },
  { id: "waiter",              label: "Waiter",               emoji: "🤵" },
  { id: "general_assistance",  label: "General Assistance",   emoji: "🤝" },
];

const EXPERIENCE_CATEGORIES = [
  { id: "tours",          label: "Tours",           emoji: "🗺️" },
  { id: "day_trips",      label: "Day Trips",       emoji: "🚌" },
  { id: "classes",        label: "Classes",         emoji: "🎓" },
  { id: "cooking",        label: "Cooking Classes", emoji: "🧑‍🍳" },
  { id: "outdoor",        label: "Outdoor",         emoji: "🌿" },
  { id: "food_drink",     label: "Food & Drink",    emoji: "🍷" },
  { id: "cultural",       label: "Cultural",        emoji: "🏛️" },
  { id: "music",          label: "Music & Arts",    emoji: "🎭" },
  { id: "sports",         label: "Sports",          emoji: "⚽" },
  { id: "wellness",           label: "Wellness",          emoji: "🧘" },
  { id: "workshop",           label: "Workshop",          emoji: "🛠️" },
  { id: "olive_oil_tasting",  label: "Olive Oil Tasting", emoji: "🫒" },
];

const CITIES = [
  "Lisbon", "Porto", "Algarve", "Sintra", "Cascais",
  "Setúbal", "Braga", "Coimbra", "Évora", "Faro",
  "Madeira", "Azores", "Nazaré", "Óbidos", "Tavira",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TOTAL_STEPS = 10;

// ── Types ─────────────────────────────────────────────────────────────────────
type HostType = "services" | "experiences";
type LocationPref = "you_go" | "they_come" | "both";

type Listing = {
  title: string;
  description: string;
  serviceType: string;
  priceType: "per_guest" | "per_group";
  price: string;
  maxGuests: string;
  duration: string;
};

type DayHours = { day: string; open: boolean; from: string; to: string };

type Discounts = {
  limitedTime: { enabled: boolean; percent: number; from: string; to: string };
  earlyBird:   { enabled: boolean; percent: number; daysInAdvance: number };
  largeGroup:  { enabled: boolean; percent: number; minGuests: number };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function emptyListing(): Listing {
  return { title: "", description: "", serviceType: "", priceType: "per_guest", price: "", maxGuests: "", duration: "" };
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-stone-400">Step {step} of {total}</p>
        <p className="text-xs text-stone-400">{Math.round((step / total) * 100)}% complete</p>
      </div>
      <div className="h-1.5 rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue →",
  nextDisabled = false,
  loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="mt-8 flex gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          ← Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 rounded-full bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? "Submitting…" : nextLabel}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BecomeHostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [hostType, setHostType]     = useState<HostType | null>(null);

  // Step 2
  const [category, setCategory]     = useState("");

  // Step 3
  const [city, setCity]             = useState("");

  // Step 4 – background
  const [experience, setExperience]           = useState("");
  const [degrees, setDegrees]                 = useState("");
  const [careerHighlights, setCareerHighlights] = useState("");

  // Step 5 – website
  const [website, setWebsite]       = useState("");
  const [instagram, setInstagram]   = useState("");

  // Step 6 – location preference
  const [locationPref, setLocationPref] = useState<LocationPref | null>(null);

  // Step 7 – photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 8 – listings
  const [listings, setListings]     = useState<Listing[]>([emptyListing()]);

  // Step 9 – business hours
  const [hours, setHours]           = useState<DayHours[]>(
    DAYS.map(day => ({ day, open: true, from: "09:00", to: "18:00" }))
  );

  // Step 10 – discounts
  const [discounts, setDiscounts]   = useState<Discounts>({
    limitedTime: { enabled: false, percent: 10, from: "", to: "" },
    earlyBird:   { enabled: false, percent: 10, daysInAdvance: 7 },
    largeGroup:  { enabled: false, percent: 15, minGuests: 5 },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS + 1));
  const back = () => setStep(s => Math.max(s - 1, 1));

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const combined = [...photoFiles, ...files].slice(0, 8);
    setPhotoFiles(combined);
    setPhotoPreviews(combined.map(f => URL.createObjectURL(f)));
  }

  function removePhoto(index: number) {
    const next = photoFiles.filter((_, i) => i !== index);
    setPhotoFiles(next);
    setPhotoPreviews(next.map(f => URL.createObjectURL(f)));
  }

  function updateListing(index: number, field: keyof Listing, value: string) {
    setListings(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  }

  function addListing() {
    if (listings.length < 5) setListings(prev => [...prev, emptyListing()]);
  }

  function removeListing(index: number) {
    if (listings.length > 1) setListings(prev => prev.filter((_, i) => i !== index));
  }

  function toSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      + "-" + Math.random().toString(36).slice(2, 7);
  }

  function updateHours(index: number, field: keyof DayHours, value: string | boolean) {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  }

  async function handleSubmit() {
    const sb = getSupabase();
    if (!sb) { next(); return; }
    setSubmitting(true);

    const { data: { session } } = await sb.auth.getSession();
    if (!session) { setSubmitting(false); return; }

    // Update profile role
    await sb.from("profiles").update({
      role:          "provider",
      experience,
      degrees,
      career_highlights: careerHighlights,
      website,
      instagram,
      city,
      host_type:     hostType,
      category,
      location_pref: locationPref,
    }).eq("id", session.user.id);

    // Insert listings
    for (const listing of listings) {
      if (!listing.title && !listing.description) continue;
      const { error: listingError } = await sb.from("listings").insert({
        provider_id:  session.user.id,
        title:        listing.title,
        description:  listing.description,
        service_type: listing.serviceType,
        price_type:   listing.priceType,
        price:        parseFloat(listing.price) || 0,
        max_guests:   parseInt(listing.maxGuests) || 1,
        duration:     parseFloat(listing.duration) || 1,
        category,
        city,
        status:       "active",
        slug:         toSlug(listing.title || "listing"),
      });
      if (listingError) console.error("Listing insert error:", listingError.message);
    }

    // Insert business hours
    await sb.from("business_hours").upsert(
      hours.map(h => ({
        provider_id: session.user.id,
        day:   h.day,
        open:  h.open,
        from:  h.from,
        to:    h.to,
      }))
    );

    // Insert discounts
    if (discounts.limitedTime.enabled) {
      await sb.from("discounts").insert({
        provider_id: session.user.id,
        type: "limited_time",
        percent: discounts.limitedTime.percent,
        valid_from: discounts.limitedTime.from || null,
        valid_to:   discounts.limitedTime.to   || null,
      });
    }
    if (discounts.earlyBird.enabled) {
      await sb.from("discounts").insert({
        provider_id: session.user.id,
        type: "early_bird",
        percent: discounts.earlyBird.percent,
        days_in_advance: discounts.earlyBird.daysInAdvance,
      });
    }
    if (discounts.largeGroup.enabled) {
      await sb.from("discounts").insert({
        provider_id: session.user.id,
        type: "large_group",
        percent: discounts.largeGroup.percent,
        min_guests: discounts.largeGroup.minGuests,
      });
    }

    setSubmitting(false);
    next(); // → success screen
  }

  const inputClass = "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "mb-1.5 block text-xs font-semibold text-stone-500";

  const categories = hostType === "services" ? SERVICE_CATEGORIES : EXPERIENCE_CATEGORIES;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step > TOTAL_STEPS) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-stone-900">You&apos;re a host!</h2>
          <p className="mt-2 text-sm text-stone-500">
            Your listings are saved as drafts. Review them in your dashboard and publish when you&apos;re ready.
          </p>
          <button
            onClick={() => router.push("/dashboard/listings")}
            className="mt-6 w-full rounded-full bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700"
          >
            View my listings →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-stone-900">Become a Host</h1>
        <p className="mt-1 text-sm text-stone-500">Set up your profile and start accepting bookings.</p>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* ── Step 1: Type ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <StepTitle title="What do you want to offer?" subtitle="Choose the type of hosting that fits you best." />
            <div className="grid grid-cols-2 gap-4">
              {([
                { type: "services" as HostType,    emoji: "🛎️", title: "Services",    desc: "Offer personal services to guests at their location or yours." },
                { type: "experiences" as HostType, emoji: "🗺️", title: "Experiences", desc: "Host tours, classes, and activities for groups or individuals." },
              ]).map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setHostType(opt.type)}
                  className={`rounded-2xl border-2 p-5 text-left transition ${hostType === opt.type ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
                >
                  <div className="mb-3 text-4xl">{opt.emoji}</div>
                  <p className={`font-semibold ${hostType === opt.type ? "text-amber-800" : "text-stone-800"}`}>{opt.title}</p>
                  <p className="mt-1 text-xs text-stone-400">{opt.desc}</p>
                </button>
              ))}
            </div>
            <NavButtons onNext={next} nextDisabled={!hostType} />
          </div>
        )}

        {/* ── Step 2: Category ────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <StepTitle
              title={`Choose your ${hostType === "services" ? "service" : "experience"} category`}
              subtitle="You can add more categories later."
            />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition ${category === cat.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
                >
                  <span className="mb-1 text-2xl">{cat.emoji}</span>
                  <span className={`text-xs font-semibold leading-tight ${category === cat.id ? "text-amber-800" : "text-stone-600"}`}>{cat.label}</span>
                </button>
              ))}
            </div>
            <NavButtons onBack={back} onNext={next} nextDisabled={!category} />
          </div>
        )}

        {/* ── Step 3: City ────────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <StepTitle title="Where are you based?" subtitle="Select the city where you primarily offer your services." />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CITIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${city === c ? "border-amber-500 bg-amber-50 text-amber-800" : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className={labelClass}>Or type your city</label>
              <input
                type="text"
                value={CITIES.includes(city) ? "" : city}
                onChange={e => setCity(e.target.value)}
                placeholder="Other city…"
                className={inputClass}
              />
            </div>
            <NavButtons onBack={back} onNext={next} nextDisabled={!city} />
          </div>
        )}

        {/* ── Step 4: Background ──────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <StepTitle title="Tell guests about yourself" subtitle="Share your background, qualifications, and highlights." />
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Work experience</label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Describe your relevant work experience…"
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Degrees & certifications</label>
                <textarea
                  rows={2}
                  value={degrees}
                  onChange={e => setDegrees(e.target.value)}
                  placeholder="e.g. BSc in Nutrition, Certified Personal Trainer, Licensed Tour Guide…"
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Career highlights</label>
                <textarea
                  rows={3}
                  value={careerHighlights}
                  onChange={e => setCareerHighlights(e.target.value)}
                  placeholder="What are you most proud of? Awards, notable clients, standout achievements…"
                  className={textareaClass}
                />
              </div>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </div>
        )}

        {/* ── Step 5: Website ─────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <StepTitle title="Online presence" subtitle="Add links so guests can learn more about you. These are optional." />
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Website</label>
                <div className="flex items-center rounded-xl border border-stone-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <span className="pl-4 text-sm text-stone-400">https://</span>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="yourwebsite.com"
                    className="flex-1 rounded-r-xl px-3 py-3 text-sm text-stone-800 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <div className="flex items-center rounded-xl border border-stone-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                  <span className="pl-4 text-sm text-stone-400">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="your_handle"
                    className="flex-1 rounded-r-xl px-3 py-3 text-sm text-stone-800 outline-none"
                  />
                </div>
              </div>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </div>
        )}

        {/* ── Step 6: Location preference ─────────────────────────────────── */}
        {step === 6 && (
          <div>
            <StepTitle title="How do you work?" subtitle="Let guests know your location setup." />
            <div className="space-y-3">
              {([
                { pref: "they_come" as LocationPref, emoji: "📍", title: "Guests come to you",       desc: "You work from your own location, studio, or premises." },
                { pref: "you_go"   as LocationPref, emoji: "🚗", title: "You go to the guest",       desc: "You travel to the guest's location (home, hotel, etc.)." },
                { pref: "both"     as LocationPref, emoji: "🔄", title: "Both options available",    desc: "You're flexible — it depends on the booking." },
              ]).map(opt => (
                <button
                  key={opt.pref}
                  type="button"
                  onClick={() => setLocationPref(opt.pref)}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${locationPref === opt.pref ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className={`font-semibold ${locationPref === opt.pref ? "text-amber-800" : "text-stone-800"}`}>{opt.title}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <NavButtons onBack={back} onNext={next} nextDisabled={!locationPref} />
          </div>
        )}

        {/* ── Step 7: Photos ──────────────────────────────────────────────── */}
        {step === 7 && (
          <div>
            <StepTitle title="Add some photos" subtitle="Great photos build trust and attract more bookings. Add up to 8." />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              {photoFiles.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7 mb-1">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span className="text-xs font-medium">Add photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
            <p className="mt-3 text-xs text-stone-400">
              {photoFiles.length === 0
                ? "You can also add photos later from your listings page."
                : `${photoFiles.length} photo${photoFiles.length !== 1 ? "s" : ""} selected`}
            </p>
            <NavButtons onBack={back} onNext={next} nextLabel={photoFiles.length === 0 ? "Skip for now →" : "Continue →"} />
          </div>
        )}

        {/* ── Step 8: Listings ────────────────────────────────────────────── */}
        {step === 8 && (
          <div>
            <StepTitle
              title="Create your offerings"
              subtitle="Add up to 5 listings. Each can have its own pricing and details."
            />
            <div className="space-y-5">
              {listings.map((listing, i) => (
                <div key={i} className="relative rounded-2xl border border-stone-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-700">Listing {i + 1}</p>
                    {listings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListing(i)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={listing.title}
                        onChange={e => updateListing(i, "title", e.target.value)}
                        placeholder="e.g. Private Chef Dinner for 2"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        rows={3}
                        value={listing.description}
                        onChange={e => updateListing(i, "description", e.target.value)}
                        placeholder="Describe what guests will experience…"
                        className={textareaClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Type of service</label>
                      <input
                        type="text"
                        value={listing.serviceType}
                        onChange={e => updateListing(i, "serviceType", e.target.value)}
                        placeholder="e.g. 3-course dinner, 60-min massage, portrait session…"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Pricing</label>
                        <select
                          value={listing.priceType}
                          onChange={e => updateListing(i, "priceType", e.target.value)}
                          className={inputClass}
                        >
                          <option value="per_guest">Per guest</option>
                          <option value="per_group">Per group</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Price (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={listing.price}
                          onChange={e => updateListing(i, "price", e.target.value)}
                          placeholder="0.00"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Max guests</label>
                        <input
                          type="number"
                          min="1"
                          value={listing.maxGuests}
                          onChange={e => updateListing(i, "maxGuests", e.target.value)}
                          placeholder="e.g. 8"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Duration (hours)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={listing.duration}
                          onChange={e => updateListing(i, "duration", e.target.value)}
                          placeholder="e.g. 2"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {listings.length < 5 && (
                <button
                  type="button"
                  onClick={addListing}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-3.5 text-sm font-medium text-stone-500 transition hover:border-amber-400 hover:text-amber-600"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add another listing ({listings.length}/5)
                </button>
              )}
            </div>
            <NavButtons onBack={back} onNext={next} nextDisabled={listings.every(l => !l.title)} />
          </div>
        )}

        {/* ── Step 9: Business hours ──────────────────────────────────────── */}
        {step === 9 && (
          <div>
            <StepTitle title="Set your availability" subtitle="Choose the days and hours guests can book you." />
            <div className="space-y-2">
              {hours.map((h, i) => (
                <div key={h.day} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${h.open ? "bg-stone-50" : "bg-stone-50/40"}`}>
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={h.open}
                    onClick={() => updateHours(i, "open", !h.open)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${h.open ? "bg-amber-500" : "bg-stone-300"}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${h.open ? "translate-x-4" : "translate-x-0"}`} />
                  </button>

                  {/* Day label */}
                  <span className={`w-8 text-sm font-semibold ${h.open ? "text-stone-700" : "text-stone-300"}`}>
                    {DAY_SHORT[i]}
                  </span>

                  {/* Times */}
                  {h.open ? (
                    <>
                      <input
                        type="time"
                        value={h.from}
                        onChange={e => updateHours(i, "from", e.target.value)}
                        className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-amber-400"
                      />
                      <span className="text-xs text-stone-400">to</span>
                      <input
                        type="time"
                        value={h.to}
                        onChange={e => updateHours(i, "to", e.target.value)}
                        className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-amber-400"
                      />
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-stone-300">Closed</span>
                  )}
                </div>
              ))}
            </div>
            <NavButtons onBack={back} onNext={next} />
          </div>
        )}

        {/* ── Step 10: Discounts ──────────────────────────────────────────── */}
        {step === 10 && (
          <div>
            <StepTitle title="Offer discounts" subtitle="Attract more bookings with special deals. All optional." />
            <div className="space-y-4">

              {/* Limited time */}
              <div className={`rounded-2xl border-2 p-5 transition ${discounts.limitedTime.enabled ? "border-amber-400 bg-amber-50/50" : "border-stone-200"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-800">⏰ Limited time offer</p>
                    <p className="mt-0.5 text-xs text-stone-400">A special discount valid for a fixed date range.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={discounts.limitedTime.enabled}
                    onClick={() => setDiscounts(d => ({ ...d, limitedTime: { ...d.limitedTime, enabled: !d.limitedTime.enabled } }))}
                    className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${discounts.limitedTime.enabled ? "bg-amber-500" : "bg-stone-300"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${discounts.limitedTime.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {discounts.limitedTime.enabled && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className={labelClass}>Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={discounts.limitedTime.percent}
                        onChange={e => setDiscounts(d => ({ ...d, limitedTime: { ...d.limitedTime, percent: +e.target.value } }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Valid from</label>
                        <input
                          type="date"
                          value={discounts.limitedTime.from}
                          onChange={e => setDiscounts(d => ({ ...d, limitedTime: { ...d.limitedTime, from: e.target.value } }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Valid until</label>
                        <input
                          type="date"
                          value={discounts.limitedTime.to}
                          onChange={e => setDiscounts(d => ({ ...d, limitedTime: { ...d.limitedTime, to: e.target.value } }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Early bird */}
              <div className={`rounded-2xl border-2 p-5 transition ${discounts.earlyBird.enabled ? "border-amber-400 bg-amber-50/50" : "border-stone-200"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-800">🐦 Early bird discount</p>
                    <p className="mt-0.5 text-xs text-stone-400">Reward guests who book well in advance.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={discounts.earlyBird.enabled}
                    onClick={() => setDiscounts(d => ({ ...d, earlyBird: { ...d.earlyBird, enabled: !d.earlyBird.enabled } }))}
                    className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${discounts.earlyBird.enabled ? "bg-amber-500" : "bg-stone-300"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${discounts.earlyBird.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {discounts.earlyBird.enabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={discounts.earlyBird.percent}
                        onChange={e => setDiscounts(d => ({ ...d, earlyBird: { ...d.earlyBird, percent: +e.target.value } }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Days in advance</label>
                      <input
                        type="number"
                        min="1"
                        value={discounts.earlyBird.daysInAdvance}
                        onChange={e => setDiscounts(d => ({ ...d, earlyBird: { ...d.earlyBird, daysInAdvance: +e.target.value } }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Large group */}
              <div className={`rounded-2xl border-2 p-5 transition ${discounts.largeGroup.enabled ? "border-amber-400 bg-amber-50/50" : "border-stone-200"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-stone-800">👥 Large group discount</p>
                    <p className="mt-0.5 text-xs text-stone-400">Give a deal for bigger bookings.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={discounts.largeGroup.enabled}
                    onClick={() => setDiscounts(d => ({ ...d, largeGroup: { ...d.largeGroup, enabled: !d.largeGroup.enabled } }))}
                    className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${discounts.largeGroup.enabled ? "bg-amber-500" : "bg-stone-300"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${discounts.largeGroup.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {discounts.largeGroup.enabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={discounts.largeGroup.percent}
                        onChange={e => setDiscounts(d => ({ ...d, largeGroup: { ...d.largeGroup, percent: +e.target.value } }))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Min. group size</label>
                      <input
                        type="number"
                        min="2"
                        value={discounts.largeGroup.minGuests}
                        onChange={e => setDiscounts(d => ({ ...d, largeGroup: { ...d.largeGroup, minGuests: +e.target.value } }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <NavButtons
              onBack={back}
              onNext={handleSubmit}
              nextLabel="Submit & become a host →"
              loading={submitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
