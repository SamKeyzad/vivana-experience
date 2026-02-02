"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ExperienceCard = {
  title: string;
  description: string;
  image: string;
};

type ExperienceCategoryItem = {
  id: "food" | "nature" | "culture" | "sports" | "custom";
  label: string;
  title: string;
  description: string;
  highlights: string[];
  image: string;
  caption: string;
  cta: Array<{
    label: string;
    href: string;
    variant: "primary" | "secondary";
  }>;
  experiences?: ExperienceCard[];
};

const experienceCategories: ExperienceCategoryItem[] = [
  {
    id: "food",
    label: "Food",
    title: "Taste Portugal one bite at a time",
    description:
      "From pastel de nata workshops to wine tastings in hidden cellars, our food experiences bring Portuguese flavors to life alongside the chefs and bakers who perfected them.",
    highlights: [
      "Market-to-table cooking classes in Lisbon",
      "Wine and petiscos crawl through Bairro Alto",
      "Sunset dinner aboard a traditional Tejo boat",
    ],
    image: "https://images.unsplash.com/photo-1532634726-8b9fb99825c7?auto=format&fit=crop&q=80&w=1200",
    caption: "Local chefs and storytellers dish up Lisbon's culinary heritage.",
    cta: [
      { label: "View food tours", href: "/experiences/food", variant: "primary" },
      { label: "Request a private tasting", href: "/contact", variant: "secondary" },
    ],
    experiences: [
      {
        title: "Mercado da Ribeira Masterclass",
        description: "Shop with a chef at Lisbon's Time Out Market before cooking a seasonal menu in a private kitchen.",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Pastel de Nata Workshop",
        description: "Learn the secrets of Portugal's iconic custard tart in a cosy bakery housed in Chiado.",
        image: "https://images.unsplash.com/photo-1452251889946-8ff5ea7b27ab?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Bairro Alto Petiscos Crawl",
        description: "Taste petiscos and natural wines at three intimate taverns guided by a local sommelier.",
        image: "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Alfama Fado Dinner",
        description: "Enjoy a slow-cooked feast paired with haunting fado performances in a historic casa de fado.",
        image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Tejo River Sunset Cruise",
        description: "Sail aboard a traditional boat while sampling petiscos and vinho verde as Lisbon glows.",
        image: "https://images.unsplash.com/photo-1504968869623-36b9f0b2123c?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Cheese & Wine in the Serra",
        description: "Head to the countryside for a day of artisanal cheese making and wine tasting with local producers.",
        image: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Lisbon Coffee Rituals",
        description: "Follow a specialty barista across Lisbon's cafés to taste unique roasts and brewing techniques.",
        image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Setúbal Seafood Safari",
        description: "Cruise to Setúbal for oyster farms, fish markets, and a seafood lunch overlooking the Atlantic.",
        image: "https://images.unsplash.com/photo-1498654896305-41cabe6736b1?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
  {
    id: "nature",
    label: "Nature",
    title: "Explore wild coastlines and hidden landscapes",
    description:
      "Follow local guides through dramatic cliffs, secret beaches, and emerald forests across Sintra and the Algarve. Every journey is paced around your sense of wonder.",
    highlights: [
      "Guided hikes through Sintra-Cascais Natural Park",
      "Stand-up paddle exploration in Arrábida",
      "Stargazing and eco-camping escapes",
    ],
    image: "https://images.unsplash.com/photo-1579038773867-044c488291c1?auto=format&fit=crop&q=80&w=1200",
    caption: "Take the scenic path with locals who know every bend in the trail.",
    cta: [
      { label: "Nature day trips", href: "/experiences/nature", variant: "primary" },
      { label: "Plan a retreat", href: "/contact", variant: "secondary" },
    ],
    experiences: [
      {
        title: "Sintra Misty Peaks Hike",
        description: "Ascend to Pena Palace viewpoints through lush forests with a storyteller guide.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Arrábida SUP Adventure",
        description: "Paddle emerald coves, snorkel hidden reefs, and picnic on a secluded sandbar.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sat=-30",
      },
      {
        title: "Costa Vicentina Cliff Trek",
        description: "Follow fishermen trails along dramatic cliffs ending with sunset at Cabo Sardão.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sat=-60",
      },
      {
        title: "Serra da Estrela Stargazing",
        description: "Camp under the stars with an astronomer and warm mountain stew around the fire.",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Douro Valley Kayak & Vineyard",
        description: "Kayak the Douro before tasting organic wines on terraced vineyards.",
        image: "https://images.unsplash.com/photo-1584466977773-e625c37cdd40?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Azores Whale Watching",
        description: "Search for whales and dolphins off São Miguel with marine biologists on board.",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Gerês Forest Bathing",
        description: "Unplug in Peneda-Gerês National Park with mindful forest bathing and wild swimming.",
        image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Birding in the Tagus Estuary",
        description: "Spot flamingos and rare migratory birds with an ornithologist at EVOA reserve.",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
  {
    id: "culture",
    label: "Culture",
    title: "Step into Lisbon's creative heart",
    description:
      "Meet the artisans, historians, and musicians keeping Portuguese traditions alive. Create azulejos, attend intimate fado performances, and uncover street art stories.",
    highlights: [
      "Azulejo tile painting workshops",
      "Private fado evenings in Alfama",
      "Contemporary art walks with local curators",
    ],
    image: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?auto=format&fit=crop&q=80&w=1200",
    caption: "Capture Lisbon's creative pulse with the people who shape it daily.",
    cta: [
      { label: "Culture experiences", href: "/experiences/culture", variant: "primary" },
      { label: "Meet the artists", href: "/contact", variant: "secondary" },
    ],
    experiences: [
      {
        title: "Azulejo Atelier Workshop",
        description: "Paint your own tile alongside a third-generation artisan in Mouraria.",
        image: "https://images.unsplash.com/photo-1529429617124-aee711a36cf4?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Lisbon Street Art Walk",
        description: "Navigate LX Factory and hidden alleys to decode murals with a local artist.",
        image: "https://images.unsplash.com/photo-1529429617124-aee711a36cf4?auto=format&fit=crop&q=80&w=800&sat=-40",
      },
      {
        title: "Fado at Casa do Capitão",
        description: "Enjoy an intimate fado session with stories from the musicians themselves.",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&q=80&w=800&sat=-20",
      },
      {
        title: "Lisbon Literary Salons",
        description: "Sip ginjinha while writers share the history behind Portugal's greatest novels.",
        image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Cork & Craft Workshop",
        description: "Design sustainable accessories in Évora with cork harvesters and designers.",
        image: "https://images.unsplash.com/photo-1529429617124-aee711a36cf4?auto=format&fit=crop&q=80&w=800&sat=20",
      },
      {
        title: "Lisbon Palace Secrets Tour",
        description: "Unlock private rooms in Palácio dos Marqueses escorted by a resident historian.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&h=600",
      },
      {
        title: "From Olive to Oil",
        description: "Press olives in the Alentejo and taste small-batch oils with master producers.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&h=600&sat=10",
      },
      {
        title: "Port Wine Soundscapes",
        description: "Pair port tastings with live Portuguese guitar in a vaulted wine cellar.",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800&sat=-30",
      },
    ],
  },
  {
    id: "sports",
    label: "Sports",
    title: "Fuel your adventures with adrenaline",
    description:
      "Surf Atlantic swells, cycle coastal routes, or join a pick-up futsal match. Our sports guides tailor every session to your skills and energy.",
    highlights: [
      "Sunrise surf coaching in Carcavelos",
      "E-bike adventures along the Atlantic coast",
      "Paddle tennis meet-ups with local players",
    ],
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200",
    caption: "Play hard with local athletes who know where the action lives.",
    cta: [
      { label: "Active getaways", href: "/experiences/sports", variant: "primary" },
      { label: "Book a private coach", href: "/contact", variant: "secondary" },
    ],
    experiences: [
      {
        title: "Carcavelos Dawn Patrol",
        description: "Catch dawn waves with pro coaches and video analysis to improve your surf.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sat=40",
      },
      {
        title: "Atlantic Coast E-Bike Sprint",
        description: "Ride past dramatic cliffs from Cascais to Guincho with cafe stops along the way.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sat=70",
      },
      {
        title: "Tagus Stand-Up Paddle",
        description: "Glide beneath the 25 de Abril Bridge on a guided SUP tour ending with espresso shots.",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800&sat=-20",
      },
      {
        title: "Lisbon Futsal Night",
        description: "Join locals for an indoor futsal match followed by pastel de nata rewards.",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Arrábida Coasteering Rush",
        description: "Leap into crystal waters, abseil cliffs, and swim sea caves with expert guides.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sat=-10",
      },
      {
        title: "Serra MTB Expedition",
        description: "Conquer Serra de Sintra's rugged trails on custom-tuned mountain bikes.",
        image: "https://images.unsplash.com/photo-1455906876003-298dd8c44f29?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Algarve Kitesurf Clinic",
        description: "Harness Atlantic winds with certified instructors at a pristine Algarve lagoon.",
        image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Lisbon Tennis Social",
        description: "Hit the courts with local players and a coach, followed by sunset drinks.",
        image: "https://images.unsplash.com/photo-1577645518180-dc46f87b1f14?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
  {
    id: "custom",
    label: "Customized experience",
    title: "Design a bespoke Portuguese journey",
    description:
      "Dream up your ideal adventure and our concierge team will stitch together guides, venues, and moments into a seamless itinerary just for you.",
    highlights: [
      "Dedicated local concierge to curate every detail",
      "Mix and match experiences across Portugal",
      "Perfect for celebrations, team retreats, or slow travel",
    ],
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1200",
    caption: "Your trip, your pace - with Vivana orchestrating the magic behind the scenes.",
    cta: [
      { label: "Start a custom plan", href: "/contact", variant: "primary" },
      { label: "Chat with our team", href: "/contact", variant: "secondary" },
    ],
  },
];

type ExperienceCategory = ExperienceCategoryItem["id"];

export default function ExperiencesPage() {
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>("food");
  const category = experienceCategories.find((item) => item.id === activeCategory)!;

  return (
    <div className="min-h-screen w-full bg-white px-4 py-16 sm:px-6 lg:px-12">
      <header className="space-y-4 text-center md:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Experiences
        </p>
        <h1 className="text-4xl font-bold text-amber-900">
          Curated adventures for every kind of traveler
        </h1>
        <p className="max-w-3xl text-lg text-stone-700">
          Dive into Portugal through food, nature, culture, sports, or request a customized itinerary crafted just for you.
        </p>
      </header>

      <section className="mt-12 overflow-hidden rounded-3xl bg-white">
        <nav className="flex flex-wrap gap-2 border-b border-black bg-amber-50 px-4 py-3">
          {experienceCategories.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "bg-white text-amber-700 hover:bg-amber-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-10">
          <div className="relative h-80 w-full overflow-hidden sm:h-96">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${category.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />
            <div className="relative flex h-full flex-col justify-center gap-4 px-8 py-10 text-white sm:px-12 lg:px-16">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
                {category.label}
              </span>
              <h2 className="text-3xl font-bold leading-snug sm:text-4xl">{category.title}</h2>
              <p className="max-w-2xl text-sm text-white/85 sm:text-base">{category.description}</p>
            </div>
          </div>

          <div className="space-y-8 px-6 pb-10 md:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_auto]">
              <ul className="space-y-3 text-sm text-stone-600">
                {category.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 self-start">
                {category.cta?.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      action.variant === "primary"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "border border-black text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
            <p className="text-sm italic text-stone-500">{category.caption}</p>

            {category.experiences && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-900">
                  Featured {category.label.toLowerCase()} experiences
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {category.experiences.map((experience) => (
                    <article
                      key={experience.title}
                      className="flex flex-col overflow-hidden rounded-3xl border border-black bg-white transition hover:-translate-y-1"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={experience.image}
                          alt={experience.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          className="object-cover transition duration-700 hover:scale-105"
                          priority={experience.title === category.experiences?.[0]?.title}
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h4 className="text-lg font-semibold text-amber-800">{experience.title}</h4>
                        <p className="mt-3 flex-1 text-sm text-stone-600">{experience.description}</p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            className="flex-1 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                          >
                            Book now
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-black px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                          >
                            Add to favourites
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
