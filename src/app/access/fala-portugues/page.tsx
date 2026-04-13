import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fala português? — Vivana Access",
  description:
    "A few words that open every door in Lisbon. The phrases locals actually use — and why they matter more than you think.",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Phrase = {
  pt: string;
  pronunciation?: string;
  en: string;
  note: string;
  tag?: string;
};

type Section = {
  id: string;
  title: string;
  subtitle: string;
  phrases: Phrase[];
};

// ── Content ───────────────────────────────────────────────────────────────────
const MUST_KNOW = [
  "obrigado/a", "com licença", "saudade", "fado",
  "petisco", "bifana", "bica", "bacalhau", "tejo",
];

const SECTIONS: Section[] = [
  {
    id: "in-the-room",
    title: "When you're actually in the room",
    subtitle: "Greetings and everyday courtesy — the words that signal you're paying attention.",
    phrases: [
      {
        pt: "Bom dia",
        pronunciation: "bom dee-ah",
        en: "Good morning",
        note: "Switch to boa tarde after noon, boa noite after dark. Using the right one signals awareness — locals notice.",
        tag: "greeting",
      },
      {
        pt: "Tudo bem?",
        pronunciation: "too-doo baym",
        en: "All good? / How are you?",
        note: "The standard check-in. Reply with tudo bom or tudo bem, obrigado/a. It's brief, warm, and expected.",
        tag: "greeting",
      },
      {
        pt: "Que saudade!",
        pronunciation: "keh sow-dah-deh",
        en: "I've missed this so much!",
        note: "Portugal's most untranslatable word. A warm ache for something you love. Use it and you'll earn a smile every time.",
        tag: "feeling",
      },
      {
        pt: "Obrigado / Obrigada",
        pronunciation: "oh-bree-gah-doo / -dah",
        en: "Thank you",
        note: "Men say obrigado, women say obrigada. Getting this right is a small act of respect that rarely goes unnoticed.",
        tag: "essential",
      },
      {
        pt: "Desculpe",
        pronunciation: "desh-kool-peh",
        en: "Sorry / Excuse me",
        note: "Use desculpe to apologise. Use com licença to pass someone in a narrow hallway or market aisle.",
        tag: "courtesy",
      },
      {
        pt: "Com licença",
        pronunciation: "kom lee-sen-sah",
        en: "Excuse me (to pass)",
        note: "The polite way to move through a crowd, navigate a café, or interrupt someone gently. Never goes wrong.",
        tag: "courtesy",
      },
    ],
  },
  {
    id: "belonging",
    title: "On the belonging you order",
    subtitle: "Inside a café, pastelaria, or tasca — the words that make you a regular, not a tourist.",
    phrases: [
      {
        pt: "Uma bica, por favor",
        pronunciation: "oo-mah bee-kah",
        en: "An espresso, please",
        note: "In Lisbon, coffee is a bica — not a café, not an espresso. Order it correctly and you've passed the first test.",
        tag: "café",
      },
      {
        pt: "A conta, se faz favor",
        pronunciation: "ah kon-tah seh fash fah-vor",
        en: "The bill, please",
        note: "Politer than just asking for a conta. Se faz favor softens every request and costs nothing.",
        tag: "café",
      },
      {
        pt: "Não faz mal",
        pronunciation: "now fash mal",
        en: "No problem / Never mind",
        note: "One of the most useful phrases in daily life. Said when something goes slightly wrong and it genuinely doesn't matter.",
        tag: "everyday",
      },
      {
        pt: "Mais um!",
        pronunciation: "myze oom",
        en: "Another one!",
        note: "At a bar, a pastelaria counter, or a petisco spread. Direct, cheerful, universally understood.",
        tag: "café",
      },
      {
        pt: "Está bom",
        pronunciation: "shtah bom",
        en: "It's good / That works",
        note: "Confirming something is fine, agreeing to a suggestion, or approving what's just arrived at the table.",
        tag: "everyday",
      },
      {
        pt: "Pode ser",
        pronunciation: "pod sehr",
        en: "Could be / Maybe",
        note: "A very Portuguese way of saying something is likely, or of agreeing without over-committing. Relaxed and common.",
        tag: "everyday",
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigating with locals, not just maps",
    subtitle: "Street directions work better when you ask a person. These phrases start that conversation.",
    phrases: [
      {
        pt: "Onde fica...?",
        pronunciation: "on-deh fee-kah",
        en: "Where is...?",
        note: "The most useful navigation phrase. Onde fica o Mercado? Onde fica a paragem? Drop in any destination.",
        tag: "navigation",
      },
      {
        pt: "É aqui perto?",
        pronunciation: "eh ah-kee pehr-too",
        en: "Is it nearby?",
        note: "Once someone points you in a direction, this follow-up confirms whether you're walking or needing a taxi.",
        tag: "navigation",
      },
      {
        pt: "Sempre em frente",
        pronunciation: "sem-preh aym fren-teh",
        en: "Straight ahead",
        note: "The answer you'll hear most often in Lisbon. Also useful to say it back to confirm you understood.",
        tag: "navigation",
      },
      {
        pt: "Vira à esquerda / direita",
        pronunciation: "vee-rah ah esh-kehr-dah / dee-ray-tah",
        en: "Turn left / Turn right",
        note: "Esquerda (left) and direita (right) are worth memorising — you'll hear them the moment you ask for directions.",
        tag: "navigation",
      },
    ],
  },
  {
    id: "beyond",
    title: "Words that go beyond the transaction",
    subtitle: "The phrases that move a conversation from exchange to connection.",
    phrases: [
      {
        pt: "Fica à vontade",
        pronunciation: "fee-kah ah von-tah-deh",
        en: "Make yourself at home",
        note: "The classic Portuguese welcome into a space. If someone says this to you, take it seriously — they mean it.",
        tag: "warmth",
      },
      {
        pt: "Com certeza",
        pronunciation: "kom sehr-teh-zah",
        en: "Of course / Certainly",
        note: "Confident, warm agreement. More emphatic than sim alone — signals that the answer was obvious from the start.",
        tag: "warmth",
      },
      {
        pt: "Que beleza!",
        pronunciation: "keh beh-leh-zah",
        en: "How beautiful!",
        note: "Said in front of a view, a dish, a piece of tile work, or an unexpected moment. Genuine and freely used.",
        tag: "expression",
      },
      {
        pt: "É pá!",
        pronunciation: "eh pah",
        en: "Hey! / Wow! / Come on!",
        note: "The most Portuguese exclamation. Surprise, mild frustration, friendly emphasis — context does all the work.",
        tag: "expression",
      },
    ],
  },
  {
    id: "feira",
    title: "At the feira and beyond",
    subtitle: "Markets, stalls, and the gentle art of the slow browse.",
    phrases: [
      {
        pt: "Quanto custa?",
        pronunciation: "kwan-too koosh-tah",
        en: "How much does it cost?",
        note: "Essential at the Feira da Ladra, Mercado de Arroios, or any artisan stall. Opens every negotiation.",
        tag: "market",
      },
      {
        pt: "É muito caro",
        pronunciation: "eh mwee-too kah-roo",
        en: "It's very expensive",
        note: "Not rude — it's part of the conversation at a market. Say it gently and see what happens next.",
        tag: "market",
      },
      {
        pt: "Pode fazer um desconto?",
        pronunciation: "pod fah-zehr oom desh-kon-too",
        en: "Can you give a discount?",
        note: "Only at markets and independent stalls — not in shops. The worst they can say is não.",
        tag: "market",
      },
      {
        pt: "Olha! / Linda!",
        pronunciation: "ol-yah / lin-dah",
        en: "Look! / Beautiful!",
        note: "Olha is a casual attention-getter between friends. Linda (beautiful, feminine) is freely directed at objects, views, children.",
        tag: "market",
      },
    ],
  },
];

const TAG_STYLES: Record<string, string> = {
  greeting:   "bg-sky-50 text-sky-700 border border-sky-200",
  feeling:    "bg-rose-50 text-rose-700 border border-rose-200",
  essential:  "bg-amber-50 text-amber-700 border border-amber-200",
  courtesy:   "bg-stone-100 text-stone-600 border border-stone-200",
  café:       "bg-amber-50 text-amber-700 border border-amber-200",
  everyday:   "bg-stone-100 text-stone-600 border border-stone-200",
  navigation: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warmth:     "bg-rose-50 text-rose-700 border border-rose-200",
  expression: "bg-violet-50 text-violet-700 border border-violet-200",
  market:     "bg-orange-50 text-orange-700 border border-orange-200",
};

// ── Components ────────────────────────────────────────────────────────────────
function PhraseCard({ phrase }: { phrase: Phrase }) {
  const tagStyle = phrase.tag ? TAG_STYLES[phrase.tag] ?? TAG_STYLES.everyday : TAG_STYLES.everyday;
  return (
    <div className="flex flex-col rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-stone-900 leading-snug">{phrase.pt}</h3>
        {phrase.tag && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${tagStyle}`}>
            {phrase.tag}
          </span>
        )}
      </div>
      {phrase.pronunciation && (
        <p className="mb-1 text-xs italic text-stone-400">{phrase.pronunciation}</p>
      )}
      <p className="text-sm font-semibold text-amber-700 mb-2">{phrase.en}</p>
      <p className="text-xs leading-relaxed text-stone-500">{phrase.note}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FalaPortuguesPage() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center gap-3 border-b border-black/8 bg-white/90 px-5 py-3 backdrop-blur">
        <Link
          href="/access"
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Access
        </Link>
        <span className="truncate text-sm font-semibold text-stone-800">Fala português?</span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-[420px]">
        <Image
          src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&h=500&q=80"
          alt="Lisbon street life"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-3">
            Access · Language & Belonging
          </p>
          <h1 className="text-3xl font-bold leading-snug sm:text-5xl max-w-xl">
            Fala português?
          </h1>
          <p className="mt-2 text-base text-white/80 max-w-md">
            A few words that open every door in Lisbon.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span>April 2026</span>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-5 py-12">

        {/* Intro */}
        <p className="text-base font-medium leading-relaxed text-stone-700 border-l-2 border-amber-500 pl-5 mb-8">
          Lisbon is a city that rewards the curious. Beyond its famous viewpoints and tiled facades,
          there&apos;s an entire social world that most visitors never reach — held together by shared
          language, local rhythm, and a warmth the Portuguese reserve for those who try.
        </p>

        <div className="space-y-4 text-sm leading-[1.9] text-stone-600 mb-10">
          <p>
            You don&apos;t need to be fluent. You just need to show that you tried. A handful of words
            said in the right moment — a <em>bom dia</em> at a café counter, a <em>com licença</em>
            in a narrow tile corridor, a genuine <em>obrigada</em> — signals something important.
            It says: I&apos;m not just passing through.
          </p>
          <p>
            Portuguese is not an easy language. Its vowels swallow themselves, its verbs conjugate
            in directions that feel arbitrary, and native speakers often speak at a pace that makes
            Spanish sound like slow motion. But that&apos;s not what this is. This is something
            smaller — and more useful.
          </p>
        </div>

        {/* Must-know words strip */}
        <div className="mb-12 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-amber-700">
            Must-know words
          </p>
          <div className="flex flex-wrap gap-2">
            {MUST_KNOW.map(word => (
              <span
                key={word}
                className="rounded-full bg-white border border-amber-200 px-3 py-1 text-sm font-semibold text-amber-800 shadow-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-14">
          {SECTIONS.map((section, si) => (
            <section key={section.id}>
              {/* Section header */}
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 mb-1">
                  {String(si + 1).padStart(2, "0")}
                </p>
                <h2 className="text-xl font-bold text-stone-900">{section.title}</h2>
                <p className="mt-1 text-sm text-stone-400">{section.subtitle}</p>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {section.phrases.map(phrase => (
                  <PhraseCard key={phrase.pt} phrase={phrase} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-14 rounded-3xl bg-stone-900 px-8 py-10 text-center">
          <p className="text-3xl font-bold text-white mb-3">Até já.</p>
          <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
            Language is the smallest bridge between strangers in Lisbon. A single word in Portuguese
            is enough — to show you&apos;re present, that you notice, that you&apos;re not just
            here for the views.
          </p>
          <p className="mt-4 text-xs text-stone-600 italic">Até já — see you soon.</p>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-black/8" />

        {/* More from Access */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-stone-900 mb-6">More from Access</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[
              {
                href: "/access/learning-portuguese",
                category: "Language & Belonging",
                title: "Learning Portuguese Changed How I See Lisbon",
                image: "/people_cafe.jpg",
              },
              {
                href: "/access/you-came-for-the-weather",
                category: "On Staying",
                title: "You Came for the Weather. You Stayed for Something Else.",
                image: "/lisbon_weather.jpg",
              },
            ].map(other => (
              <Link
                key={other.href}
                href={other.href}
                className="group flex flex-col rounded-2xl overflow-hidden border border-black/8 bg-white transition hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                  <Image
                    src={other.image}
                    alt={other.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                    {other.category}
                  </p>
                  <h3 className="mt-1.5 text-sm font-semibold text-stone-800 leading-snug">
                    {other.title}
                  </h3>
                  <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700">
                    Read
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-300">
        <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-bold tracking-wide text-white">VIVANA</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              Discover the real Lisbon through local eyes — authentic moments crafted by people who love this city.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition hover:text-white">Home</Link></li>
              <li><Link href="/#explore" className="transition hover:text-white">Experiences</Link></li>
              <li><Link href="/#explore" className="transition hover:text-white">Services</Link></li>
              <li><Link href="/access" className="transition hover:text-white">Access</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Experiences</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><span className="text-stone-500">Popular in Lisbon</span></li>
              <li><span className="text-stone-500">Unique Activities</span></li>
              <li><span className="text-stone-500">Gathering & Socialising</span></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="transition hover:text-white">Log in</Link></li>
              <li><Link href="/" className="transition hover:text-white">Sign up</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 px-6 py-5 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} Vivana. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
