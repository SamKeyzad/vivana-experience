"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type ActiveSearchPanel = "where" | "when" | "who" | null;

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Contact", href: "/contact" },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayInitials = ["S", "M", "T", "W", "T", "F", "S"];

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
};

const isBetweenExclusive = (day: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  const time = startOfDay(day).getTime();
  const startTime = startOfDay(start).getTime();
  const endTime = startOfDay(end).getTime();
  if (endTime < startTime) return false;
  return time > startTime && time < endTime;
};

const buildCalendarDays = (reference: Date) => {
  const firstDayOfMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const startWeekday = firstDayOfMonth.getDay();
  const days: Date[] = [];

  for (let i = startWeekday; i > 0; i--) {
    days.push(new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), 1 - i));
  }

  const daysInMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  for (let i = 0; i < daysInMonth; i++) {
    days.push(new Date(reference.getFullYear(), reference.getMonth(), i + 1));
  }

  while (days.length % 7 !== 0) {
    const lastDay = days[days.length - 1];
    days.push(new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1));
  }

  return days;
};

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
  isAuthenticated?: boolean;
};

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePanel, setActivePanel] = useState<ActiveSearchPanel>(null);
  const [whereQuery, setWhereQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()));
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [guestCounts, setGuestCounts] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadUser = () => {
      const raw = window.localStorage.getItem("vivanaUser");
      if (!raw) {
        setUser(null);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as UserProfile & { password?: string };
        if (parsed?.isAuthenticated) {
          const { password, ...safeProfile } = parsed;
          void password; // explicitly ignore persisted password
          setUser(safeProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Could not parse stored user profile", error);
        setUser(null);
      }
    };

    loadUser();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "vivanaUser") {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("vivanaUser");
      if (raw) {
        try {
          const stored = JSON.parse(raw) as Record<string, unknown>;
          window.localStorage.setItem(
            "vivanaUser",
            JSON.stringify({ ...stored, isAuthenticated: false })
          );
        } catch {
          window.localStorage.removeItem("vivanaUser");
        }
      }
    }
    setUser(null);
  };

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const insideSearch = searchRef.current?.contains(target);
      const insidePanel = target.closest("[data-search-panel]");
      if (!insideSearch && !insidePanel) {
        setActivePanel(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activePanel]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const whereDisplay = whereQuery || "Search cities";

  const dateDisplay = useMemo(() => {
    const { start, end } = selectedRange;
    if (start && end) {
      const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endText = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${startText} - ${endText}`;
    }
    if (start) {
      return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "Add dates";
  }, [selectedRange]);

  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.infants;
  const guestDisplay =
    totalGuests > 0
      ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`
      : "Add guests";

  const handlePanelToggle = (panel: ActiveSearchPanel) => {
    setActivePanel(panel);
  };

  const handleDateClick = (day: Date) => {
    const normalizedDay = startOfDay(day);
    setSelectedRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: normalizedDay, end: null };
      }
      if (normalizedDay.getTime() < prev.start.getTime()) {
        return { start: normalizedDay, end: prev.start };
      }
      if (isSameDay(normalizedDay, prev.start)) {
        return { start: normalizedDay, end: null };
      }
      return { start: prev.start, end: normalizedDay };
    });
  };

  const adjustGuests = (key: "adults" | "children" | "infants", delta: number) => {
    setGuestCounts((prev) => {
      const next = Math.max(0, prev[key] + delta);
      const updated = { ...prev, [key]: next };
      if (updated.adults === 0 && key === "adults") {
        updated.adults = 1;
      }
      return updated;
    });
  };

  const handleSuggestedDate = (offsetStart: number, offsetEnd: number) => {
    const base = startOfDay(new Date());
    const start = new Date(base);
    start.setDate(start.getDate() + offsetStart);
    const end = new Date(base);
    end.setDate(end.getDate() + offsetEnd);
    setSelectedRange({ start, end });
  };

  const handleSearch = () => {
    const startText =
      selectedRange.start &&
      selectedRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endText =
      selectedRange.end &&
      selectedRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const parts = [
      whereQuery || "nearby",
      startText && endText ? `${startText} to ${endText}` : "",
      `${totalGuests || 1} ${totalGuests === 1 ? "guest" : "guests"}`,
      "events",
    ].filter(Boolean);

    const query = parts.join(" ");

    const params = new URLSearchParams({
      q: query,
      where: whereQuery || "",
      start: startText || "",
      end: endText || "",
      guests: String(totalGuests || 1),
    });

    router.push(`/search?${params.toString()}`);
    setActivePanel(null);
  };

  const nearbyOptions = ["Lisbon, Portugal", "Porto, Portugal", "Cascais, Portugal"];
  const suggestedPlaces = ["Sintra", "Algarve", "Madeira", "Azores"];
  const recentSearches = ["Lisbon foodie tour", "Port wine tasting"];

  const searchExpanded = Boolean(activePanel);
  const searchContainerClass = [
    "relative mx-auto flex items-stretch rounded-full border border-black bg-white transition-all duration-300 ease-out",
    searchExpanded ? "w-full max-w-3xl lg:max-w-4xl px-5 py-3" : "w-[320px] px-3 py-1"
  ].join(" ");
  const searchButtonClass = [
    "flex items-center gap-2 rounded-full bg-amber-600 text-sm font-semibold text-white transition hover:bg-amber-700",
    searchExpanded ? "px-5 py-3" : "px-3 py-2"
  ].join(" ");
  const showSearchText = searchExpanded;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-black bg-white/95 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wide text-amber-800">
          VIVANA
        </Link>

        <div ref={searchRef} className="flex w-full justify-center justify-self-center">
          <div className={searchContainerClass}>
            <div className="flex flex-1 items-center">
              <SearchSegment
                label="Where"
                description={whereDisplay}
                active={activePanel === "where"}
                onClick={() => handlePanelToggle("where")}
                compact={!searchExpanded}
              >
                <WherePanel
                  query={whereQuery}
                  onQueryChange={setWhereQuery}
                  onAdvance={() => setActivePanel("when")}
                  nearbyOptions={nearbyOptions}
                  suggestedPlaces={suggestedPlaces}
                  recentSearches={recentSearches}
                />
              </SearchSegment>
              <div className="h-8 w-px bg-black/20" aria-hidden="true" />
            </div>

            <div className="flex flex-1 items-center">
              <SearchSegment
                label="When"
                description={dateDisplay}
                active={activePanel === "when"}
                onClick={() => handlePanelToggle("when")}
                compact={!searchExpanded}
              >
                <WhenPanel
                  currentMonth={currentMonth}
                  onMonthChange={(direction) =>
                    setCurrentMonth((prev) =>
                      startOfDay(new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
                    )
                  }
                  calendarDays={calendarDays}
                  selectedRange={selectedRange}
                  onDateClick={handleDateClick}
                  onSuggested={handleSuggestedDate}
                  onAdvance={() => setActivePanel("who")}
                />
              </SearchSegment>
              <div className="h-8 w-px bg-black/20" aria-hidden="true" />
            </div>

            <div className="flex flex-1 items-center">
              <SearchSegment
                label="Who"
                description={guestDisplay}
                active={activePanel === "who"}
                onClick={() => handlePanelToggle("who")}
                compact={!searchExpanded}
              >
                <WhoPanel guestCounts={guestCounts} adjustGuests={adjustGuests} />
              </SearchSegment>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className={searchButtonClass}
              aria-label="Search"
            >
              {showSearchText && <span>Search</span>}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:gap-4">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
            >
              <span>Menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-black bg-white py-2">
                  <ul className="text-sm text-black">
                    {NAV_LINKS.map((link) => (
                      <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block px-4 py-2 transition hover:bg-black/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {user ? (
            <ProfileMenu user={user} onLogout={handleLogout} />
          ) : (
            <Link
              href="/auth"
              onClick={handleAuthLink}
              className="rounded-full border border-black px-5 py-2 text-base font-semibold text-amber-700 transition hover:bg-amber-600 hover:text-white"
            >
              Log in / Sign up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function SearchSegment({
  label,
  description,
  active,
  onClick,
  children,
  compact,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact: boolean;
}) {
  const paddingClasses = compact ? "px-4 py-1.5" : "px-5 py-3";
  const labelClasses = compact
    ? "text-sm font-semibold text-black"
    : "text-xs font-semibold uppercase tracking-wide text-black/60";
  const descriptionClasses = "mt-1 text-sm font-medium text-black/70";
  const showDescription = !compact;
  return (
    <div className="relative flex-1 min-w-0" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={onClick}
        className={`flex h-full w-full flex-col justify-center rounded-full text-left transition ${paddingClasses} ${
          active ? "bg-black/10" : "bg-transparent"
        }`}
      >
        <span className={labelClasses}>{label}</span>
        {showDescription && (
          <span className={descriptionClasses}>{description}</span>
        )}
      </button>
      {active && (
        <div className="absolute left-0 top-full z-50 mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function WherePanel({
  query,
  onQueryChange,
  onAdvance,
  nearbyOptions,
  suggestedPlaces,
  recentSearches,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onAdvance: () => void;
  nearbyOptions: string[];
  suggestedPlaces: string[];
  recentSearches: string[];
}) {
  const handleSelect = (value: string) => {
    onQueryChange(value);
    onAdvance();
  };

  return (
    <div
      className="w-[320px] rounded-3xl border border-black bg-white p-4"
      data-search-panel
      onClick={(event) => event.stopPropagation()}
    >
      <label className="block text-xs font-semibold uppercase tracking-wide text-black/60">
        Search cities
        <input
          autoFocus
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Try Lisbon or Porto"
          className="mt-2 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
        />
      </label>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60">Nearby</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {nearbyOptions.map((option) => (
              <button
                key={option}
                type="button"
                className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black transition hover:bg-black/10"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Recent searches
          </p>
          <ul className="mt-2 space-y-1 text-black/80">
            {recentSearches.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  className="w-full text-left text-xs underline-offset-2 hover:underline"
                  onClick={() => handleSelect(term)}
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Suggested destinations
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {suggestedPlaces.map((place) => (
              <button
                key={place}
                type="button"
                className="rounded-xl border border-black px-3 py-2 text-xs font-semibold text-black transition hover:bg-black/5"
                onClick={() => handleSelect(place)}
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WhenPanel({
  currentMonth,
  onMonthChange,
  calendarDays,
  selectedRange,
  onDateClick,
  onSuggested,
  onAdvance,
}: {
  currentMonth: Date;
  onMonthChange: (direction: number) => void;
  calendarDays: Date[];
  selectedRange: { start: Date | null; end: Date | null };
  onDateClick: (day: Date) => void;
  onSuggested: (offsetStart: number, offsetEnd: number) => void;
  onAdvance: () => void;
}) {
  const today = startOfDay(new Date());
  const thisWeekday = today.getDay();
  const daysUntilSaturday = (6 - thisWeekday + 7) % 7;
  const weekendStartOffset = daysUntilSaturday === 0 ? 0 : daysUntilSaturday;
  const weekendEndOffset = weekendStartOffset + 1;

  return (
    <div
      className="w-[360px] rounded-3xl border border-black bg-white p-4"
      data-search-panel
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          className="rounded-full border border-black px-2 py-1 text-xs font-semibold text-black transition hover:bg-black/10"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-black">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => onMonthChange(1)}
          className="rounded-full border border-black px-2 py-1 text-xs font-semibold text-black transition hover:bg-black/10"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold text-black/70">
        <button
          type="button"
          onClick={() => onSuggested(0, 0)}
          className="rounded-full border border-black px-3 py-2 transition hover:bg-black/10"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onSuggested(1, 1)}
          className="rounded-full border border-black px-3 py-2 transition hover:bg-black/10"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={() => onSuggested(weekendStartOffset, weekendEndOffset)}
          className="rounded-full border border-black px-3 py-2 transition hover:bg-black/10"
        >
          This weekend
        </button>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase text-black/50">
          {weekdayInitials.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
        {calendarDays.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isStart = isSameDay(day, selectedRange.start);
            const isEnd = isSameDay(day, selectedRange.end);
            const inRange = isBetweenExclusive(day, selectedRange.start, selectedRange.end);
            const isToday = isSameDay(day, today);

            const baseClasses =
              "flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition";

            let stateClasses = "text-black";
            if (!isCurrentMonth) {
              stateClasses = "text-black/30";
            }
            if (isStart || isEnd) {
              stateClasses = "border-amber-600 bg-amber-600 text-white";
            } else if (inRange) {
              stateClasses = "border-amber-100 bg-amber-100 text-black";
            } else if (isToday) {
              stateClasses = "border-black text-black";
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onDateClick(day)}
                className={`${baseClasses} ${stateClasses}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onAdvance}
          className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          Next: Who
        </button>
      </div>
    </div>
  );
}

function WhoPanel({
  guestCounts,
  adjustGuests,
}: {
  guestCounts: { adults: number; children: number; infants: number };
  adjustGuests: (key: "adults" | "children" | "infants", delta: number) => void;
}) {
  const guestRows = [
    { key: "adults" as const, label: "Adults", description: "Ages 13 or above", min: 1 },
    { key: "children" as const, label: "Children", description: "Ages 2 - 12", min: 0 },
    { key: "infants" as const, label: "Infants", description: "Under 2", min: 0 },
  ];

  return (
    <div
      className="w-[320px] rounded-3xl border border-black bg-white p-4"
      data-search-panel
      onClick={(event) => event.stopPropagation()}
    >
      <div className="space-y-3">
        {guestRows.map(({ key, label, description, min }) => {
          const value = guestCounts[key];
          const disableDecrement = value <= min;
          return (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black">{label}</p>
                <p className="text-xs text-black/60">{description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Decrease ${label}`}
                  disabled={disableDecrement}
                  onClick={() => adjustGuests(key, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black text-sm transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold text-black">{value}</span>
                <button
                  type="button"
                  aria-label={`Increase ${label}`}
                  onClick={() => adjustGuests(key, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black text-sm transition hover:bg-black/10"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileMenu({
  user,
  onLogout,
}: {
  user: UserProfile;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "Traveler";

  const initials =
    [user.firstName, user.lastName]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.charAt(0))
      .join("")
      .toUpperCase() || "V";

  const quickLinks = [
    { label: "Wishlists", href: "/wishlists" },
    { label: "Trips", href: "/trips" },
    { label: "Messages", href: "/messages" },
    { label: "Profile", href: "/profile" },
  ];

  const settingsLinks = [
    { label: "Language & currency", href: "/settings/preferences" },
    { label: "Account settings", href: "/settings/account" },
    { label: "Help center", href: "/help" },
    { label: "Become a guide", href: "/become-a-guide" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full border border-black bg-white px-3 py-2 transition hover:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={displayName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold uppercase text-white">
            {initials}
          </div>
        )}
        <span className="hidden text-sm font-semibold text-amber-800 md:block">
          {displayName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-amber-600 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.856a.75.75 0 011.08 1.04l-4.24 4.404a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-black bg-white py-2 ring-1 ring-black/5">
          <div className="px-4 pb-3 text-xs uppercase tracking-wide text-amber-500">
            Signed in as
            <div className="mt-1 text-sm font-semibold text-amber-800">
              {displayName}
            </div>
            {user.email && (
              <div className="text-xs text-stone-500">{user.email}</div>
            )}
          </div>
          <ul className="border-y border-black py-2 text-sm text-stone-700">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2 hover:bg-amber-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <span className="text-amber-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="border-b border-black py-2 text-sm text-stone-700">
            {settingsLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2 hover:bg-amber-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <span className="text-amber-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-amber-700 hover:bg-amber-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
  const handleAuthLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.sessionStorage.setItem("vivana:redirect", url);
    }
  };
