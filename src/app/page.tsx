"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const heroImages = [
  "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&q=80&w=2073",
  "https://plus.unsplash.com/premium_photo-1677344289088-cb9bffda8d69?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=2070",
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <section className="relative flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center overflow-hidden text-center text-white">
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Discover the Real Portugal with Vivana
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Experience Lisbon through local eyes - taste, explore, and connect with authentic moments crafted by local guides.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/experiences"
              className="rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-amber-700"
            >
              Explore Experiences
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-black px-6 py-3 text-base font-semibold text-white transition hover:border-black hover:bg-white/10"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
        <header className="text-center">
          <h2 className="text-3xl font-bold text-amber-900">Plan Your Perfect Escape</h2>
          <p className="mt-3 text-lg text-stone-700">
            Choose where to go next - meet the team behind Vivana, browse curated experiences, or get in touch to design something bespoke.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {homeCards.map(({ title, description, action, href }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-black bg-white p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-amber-800">{title}</h3>
              <p className="mt-3 text-sm text-stone-600 flex-1">{description}</p>
              <Link
                href={href}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                {action}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const homeCards = [
  {
    title: "About Vivana",
    description:
      "Meet the locals behind the journeys and discover why we're passionate about sharing Portugal's true spirit.",
    action: "Meet the team",
    href: "/about",
  },
  {
    title: "Experiences",
    description:
      "Browse curated adventures spanning cuisine, nature, culture, sports, and bespoke itineraries tailored to you.",
    action: "Browse categories",
    href: "/experiences",
  },
  {
    title: "Contact & Support",
    description:
      "Need something special? Reach out for personalised planning, group trips, or partnership opportunities.",
    action: "Get in touch",
    href: "/contact",
  },
] as const;
