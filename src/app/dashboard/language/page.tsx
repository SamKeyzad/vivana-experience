"use client";
import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English",    native: "English"    },
  { code: "pt", label: "Portuguese", native: "Português"  },
  { code: "es", label: "Spanish",    native: "Español"    },
  { code: "fr", label: "French",     native: "Français"   },
  { code: "de", label: "German",     native: "Deutsch"    },
  { code: "it", label: "Italian",    native: "Italiano"   },
  { code: "ar", label: "Arabic",     native: "العربية"    },
  { code: "zh", label: "Chinese",    native: "中文"        },
];

const CURRENCIES = [
  { code: "EUR", label: "Euro",               symbol: "€" },
  { code: "USD", label: "US Dollar",          symbol: "$" },
  { code: "GBP", label: "British Pound",      symbol: "£" },
  { code: "BRL", label: "Brazilian Real",     symbol: "R$"},
  { code: "CAD", label: "Canadian Dollar",    symbol: "CA$"},
];

export default function LanguagePage() {
  const [lang, setLang]     = useState("en");
  const [currency, setCurrency] = useState("EUR");
  const [saved, setSaved]   = useState(false);

  function handleSave() {
    // Persist to localStorage for now; in production this would update the profiles table
    localStorage.setItem("vivana_lang",     lang);
    localStorage.setItem("vivana_currency", currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Language & Currency</h1>
        <p className="mt-1 text-sm text-stone-500">Customize your language and currency preferences.</p>
      </div>

      {/* Language */}
      <div className="mb-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-stone-700">Preferred language</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                lang === l.code
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <p className={`text-sm font-semibold ${lang === l.code ? "text-amber-800" : "text-stone-700"}`}>{l.native}</p>
              <p className="text-xs text-stone-400">{l.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="mb-6 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-stone-700">Currency</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                currency === c.code
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${currency === c.code ? "text-amber-700" : "text-stone-500"}`}>{c.symbol}</span>
                <div>
                  <p className={`text-sm font-semibold ${currency === c.code ? "text-amber-800" : "text-stone-700"}`}>{c.code}</p>
                  <p className="text-xs text-stone-400">{c.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
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
