export type Service = {
  slug: string;
  emoji: string;
  title: string;
  shortDescription: string;
  fullDescription: string[];
  image: string;
  bookings: string;
  price: number;
  duration: string;
  availability: string;
  includes: string[];
  languages: string[];
};

export const services: Service[] = [
  {
    slug: "airport-transfers",
    emoji: "🚗",
    title: "Airport Transfers",
    shortDescription: "Private door-to-door transfers with licensed local drivers.",
    fullDescription: [
      "Arriving in a new city shouldn't start with confusion. Our private transfer service connects Lisbon Humberto Delgado Airport to any address in the Greater Lisbon area in a clean, comfortable, air-conditioned vehicle with a licensed local driver.",
      "Drivers monitor your flight in real time — if it's delayed, they adjust. They hold a name sign at arrivals, help with luggage, and take the fastest route at the time of day. No meters, no surge pricing, no surprises.",
      "Return transfers can be booked at the same time. Early morning and late-night departures are fully covered.",
    ],
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "541+",
    price: 35,
    duration: "20–45 min depending on destination",
    availability: "24 hours a day, 7 days a week",
    includes: ["Private vehicle", "Licensed driver", "Flight monitoring", "Luggage assistance", "Name sign at arrivals"],
    languages: ["English", "Portuguese"],
  },
  {
    slug: "accommodation-advice",
    emoji: "🏠",
    title: "Accommodation Advice",
    shortDescription: "Curated short-stay recommendations matched to your style and budget.",
    fullDescription: [
      "Lisbon's accommodation market is vast and bewildering. This service gives you a 45-minute video or phone consultation with a local who knows every neighbourhood, every price point, and every trade-off between location and comfort.",
      "After a brief questionnaire about your travel style, budget, group size, and priorities, you'll receive a personalised shortlist of 5–8 options with honest assessments of each — the things the reviews don't mention, the walking distances that matter, the noise levels at different times of year.",
      "Booking assistance with any property on the shortlist is included at no extra charge.",
    ],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "214+",
    price: 40,
    duration: "45 min consultation + shortlist delivery within 24h",
    availability: "Monday–Saturday, 9am–8pm",
    includes: ["Video or phone consultation", "Personalised shortlist (5–8 options)", "Neighbourhood guide", "Booking assistance"],
    languages: ["English", "Portuguese", "Spanish", "French"],
  },
  {
    slug: "childcare-babysitting",
    emoji: "👶",
    title: "Childcare & Babysitting",
    shortDescription: "Vetted, English-speaking babysitters available on short notice.",
    fullDescription: [
      "Travelling with children is wonderful. Travelling with children who need to be in bed at 8pm while you want to be at a Fado show is a logistical problem. This service provides vetted, DBS-checked, English-speaking childcare professionals who come to your accommodation.",
      "All carers hold a recognised childcare qualification and have passed a thorough background check. Most speak at least English and Portuguese; many speak a third language. Bookings can be made with as little as four hours' notice, subject to availability.",
      "Minimum booking is three hours. The rate is per hour per family (not per child).",
    ],
    image: "https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "138+",
    price: 30,
    duration: "Minimum 3 hours (then per hour)",
    availability: "Daily, 6am–midnight (later by arrangement)",
    includes: ["Vetted & qualified carer", "Travel to your accommodation", "Activity suggestions for children"],
    languages: ["English", "Portuguese"],
  },
  {
    slug: "local-guide-rental",
    emoji: "🗣️",
    title: "Local Guide Rental",
    shortDescription: "Hire a knowledgeable local companion for a half or full day.",
    fullDescription: [
      "Not quite a tour, not quite a friend — a local guide rental is something more flexible than either. You hire a knowledgeable Lisbon resident for a half day (4 hours) or full day (8 hours) and take them wherever you want to go.",
      "Want to find the best lunch spot in Intendente and then spend the afternoon in the museums of Belém? Done. Want someone to come with you to the antique fair and help you negotiate? Also done. The guide adapts entirely to your agenda.",
      "All guides speak excellent English and have deep knowledge of Lisbon history, food, and culture. They're also good company.",
    ],
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "327+",
    price: 80,
    duration: "Half day (4h) or full day (8h)",
    availability: "Daily — book at least 48 hours in advance",
    includes: ["Local expert guide", "Flexible itinerary", "Restaurant & shop recommendations", "Transport advice"],
    languages: ["English", "Portuguese", "Spanish"],
  },
  {
    slug: "luggage-storage-delivery",
    emoji: "📦",
    title: "Luggage Storage & Delivery",
    shortDescription: "Store or forward your bags between hotels and airports stress-free.",
    fullDescription: [
      "The gap between checkout time and your evening flight is one of the most annoying features of modern travel. This service removes it: store your bags at any of four central Lisbon locations and collect them when you're ready, or have them delivered to your next accommodation.",
      "Delivery covers the entire Lisbon metropolitan area. Bags collected before 10am are delivered to any Lisbon address by 2pm the same day. Airport delivery is available for early morning departures.",
      "All storage locations are staffed and secure. No weight limits; oversized items handled on request.",
    ],
    image: "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "189+",
    price: 15,
    duration: "Up to 24 hours per booking",
    availability: "Daily, 7am–10pm",
    includes: ["Secure storage", "Receipt & tag", "Delivery option (additional fee)", "Insurance up to €500"],
    languages: ["English", "Portuguese"],
  },
  {
    slug: "meal-planning-grocery",
    emoji: "🍱",
    title: "Meal Planning & Grocery",
    shortDescription: "Stocked fridge on arrival and personalised meal-prep for your stay.",
    fullDescription: [
      "Arriving at your apartment to a stocked fridge of local produce, fresh bread, and a bottle of wine in the rack is a particular kind of travel luxury. This service provides exactly that — a pre-arrival grocery shop based on your preferences, diet, and the length of your stay.",
      "You fill in a brief questionnaire (dietary requirements, breakfast preferences, whether you're likely to cook dinner). We do the market shopping and stock your kitchen before you arrive, leaving a handwritten note about what's in the fridge and the best way to use each ingredient.",
      "A full meal-prep service — where meals for your stay are prepared and portioned in advance — is available as an upgrade.",
    ],
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "102+",
    price: 55,
    duration: "Delivered before your check-in time",
    availability: "Monday–Saturday (Sunday by arrangement)",
    includes: ["Grocery shopping", "Fridge stocking", "Ingredient note", "Local produce sourced from market"],
    languages: ["English", "Portuguese"],
  },
  {
    slug: "day-trip-logistics",
    emoji: "🎒",
    title: "Day-Trip Logistics",
    shortDescription: "Full planning and transport for Sintra, Setúbal, or the Alentejo.",
    fullDescription: [
      "Lisbon is a perfect base for day trips: Sintra is 40 minutes away, the Arrábida peninsula an hour, the Alentejo under two. Getting there independently involves train timetables, unreliable bus connections, and missed lunch reservations. This service handles all of it.",
      "Tell us where you want to go and when, and we'll arrange private or shared transport, book any required tickets or restaurant reservations, build a suggested itinerary, and provide a detailed briefing document so you arrive knowing exactly what you're doing.",
      "Private vehicle with a driver-guide is available for the most flexibility. Shared departures for popular destinations run on set days.",
    ],
    image: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "256+",
    price: 90,
    duration: "Full day (8–10 hours)",
    availability: "Daily — book at least 72 hours in advance",
    includes: ["Transport (private or shared)", "Itinerary planning", "Ticket booking", "Restaurant reservations", "Briefing document"],
    languages: ["English", "Portuguese", "Spanish"],
  },
  {
    slug: "business-concierge",
    emoji: "💼",
    title: "Business Concierge",
    shortDescription: "Venue sourcing, translation, and meeting support for business travellers.",
    fullDescription: [
      "Lisbon has become one of Europe's most active cities for tech, finance, and creative industry events. Business travellers arrive in volume and often need support that their Lisbon contacts can't provide — venue sourcing, catering, translation, and local logistical knowledge.",
      "The business concierge service provides a dedicated English-speaking point of contact for the duration of your stay. Services include meeting room and venue sourcing, catering and equipment hire, Portuguese business etiquette briefings, interpretation for meetings, and full event coordination for groups.",
      "Rates are per day; hourly rates for specific tasks available on request.",
    ],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&h=360&q=80",
    bookings: "143+",
    price: 120,
    duration: "Per day (or per task — request quote)",
    availability: "Monday–Friday, 8am–8pm (weekend rates available)",
    includes: ["Dedicated concierge contact", "Venue sourcing", "Meeting logistics", "Catering coordination", "Interpretation support"],
    languages: ["English", "Portuguese", "Spanish", "French"],
  },
];

export const serviceCategories = [
  {
    id: "lisbon-services",
    label: "Services in Lisbon",
    description: "Practical local services to make your time in Lisbon seamless.",
    subcategories: services,
  },
];
