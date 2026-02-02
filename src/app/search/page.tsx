import Link from "next/link";

// Server component: fetches Google Custom Search if keys are configured.
// Falls back to a helpful message + Google link when keys are absent.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = asString(searchParams.q)?.trim();
  const where = asString(searchParams.where)?.trim();
  const start = asString(searchParams.start)?.trim();
  const end = asString(searchParams.end)?.trim();
  const guests = asString(searchParams.guests)?.trim();

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  const effectiveQuery = query || buildQuery({ where, start, end, guests });

  let results: SearchResult[] | null = null;
  let error: string | null = null;

  if (effectiveQuery && apiKey && cx) {
    try {
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("q", `${effectiveQuery} events`);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("cx", cx);
      url.searchParams.set("num", "8");

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Google API responded ${res.status}`);
      }
      const data = (await res.json()) as GoogleResponse;
      results = data.items?.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      })) ?? [];
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
    }
  }

  const googleUrl = effectiveQuery
    ? `https://www.google.com/search?q=${encodeURIComponent(effectiveQuery + " events")}`
    : "https://www.google.com";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-black/50">Search</p>
        <h1 className="text-3xl font-semibold text-amber-800">Event results</h1>
        <p className="text-black/70">
          {effectiveQuery
            ? `Results for "${effectiveQuery}"`
            : "Use the search bar to pick where, when, and guests."}
        </p>
      </header>

      {!effectiveQuery && (
        <div className="rounded-2xl border border-dashed border-black/20 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Choose a location, dates, and guests, then hit Search.
        </div>
      )}

      {effectiveQuery && !apiKey && !cx && (
        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-black">Google results not configured.</p>
          <p className="text-sm text-black/70">
            Add <code className="rounded bg-black/5 px-1">GOOGLE_API_KEY</code> and <code className="rounded bg-black/5 px-1">GOOGLE_CSE_ID</code>
            to your environment to show live results here. For now, use the Google link below.
          </p>
          <Link
            href={googleUrl}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            target="_blank"
          >
            View on Google
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </Link>
        </div>
      )}

      {effectiveQuery && apiKey && cx && (
        <ResultsList results={results} error={error} googleUrl={googleUrl} />
      )}
    </div>
  );
}

function ResultsList({
  results,
  error,
  googleUrl,
}: {
  results: SearchResult[] | null;
  error: string | null;
  googleUrl: string;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Couldn&apos;t fetch Google results: {error}
      </div>
    );
  }

  if (!results) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
        Loading results...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
        No results found. <Link href={googleUrl} className="text-amber-700 underline">Search on Google</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((item) => (
        <article key={item.link} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
          <Link href={item.link} className="text-lg font-semibold text-amber-700 hover:underline" target="_blank">
            {item.title}
          </Link>
          <p className="mt-1 text-xs text-black/50">{item.displayLink}</p>
          <p className="mt-2 text-sm text-black/80">{item.snippet}</p>
        </article>
      ))}
      <div className="pt-2">
        <Link href={googleUrl} className="text-sm font-semibold text-amber-700 underline" target="_blank">
          See more on Google
        </Link>
      </div>
    </div>
  );
}

function buildQuery({
  where,
  start,
  end,
  guests,
}: {
  where?: string | null;
  start?: string | null;
  end?: string | null;
  guests?: string | null;
}) {
  const parts = [where, start && end ? `${start} to ${end}` : null, guests ? `${guests} guests` : null];
  return parts.filter(Boolean).join(" ").trim();
}

function asString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
};

type GoogleResponse = {
  items?: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }>;
};
