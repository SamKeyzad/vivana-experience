export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  intro: string;
  body: (string | { em: string })[][];
};

export const articles: Article[] = [
  {
    slug: "learning-portuguese",
    title: "Learning Portuguese Changed How I See Lisbon",
    category: "Language & Belonging",
    date: "April 2026",
    readTime: "5 min read",
    image: "/people_cafe.jpg",
    intro:
      "There's a moment every expat in Lisbon knows. You're sitting in a café, coffee in hand, and the table next to you erupts in laughter. You smile politely. You have no idea why it's funny.",
    body: [
      [
        "For my first year here, that was my Lisbon. Beautiful on the surface, opaque underneath. I could navigate the metro, order a bifana, apologize when I bumped into someone. But the city was still performing for me, not living in front of me.",
      ],
      [
        "Then I started actually learning Portuguese. Not the app version. The uncomfortable version — classes, mistakes, embarrassment, a teacher who refused to switch to English when I struggled.",
      ],
      [
        "The first thing that changed wasn't communication. It was attention. When you're piecing together a language, you listen differently. You stop tuning out background noise and start trying to decode it. Lisbon got louder in the best way.",
      ],
      [
        "I started catching fragments on the bus. An old man complaining about his knee to no one in particular. Two women dissecting someone's life choices with surgical precision and zero malice. A teenager narrating his own football highlights to a friend who clearly didn't care. These weren't conversations I was part of — but I was finally a witness to them.",
      ],
      [
        "Then came the tiles. Azulejos are everywhere in Lisbon, which means most visitors stop seeing them after day two. But once you can read Portuguese, they stop being decoration. Suddenly you're standing on a street corner reading a poem from 1920, or a ship captain's name, or a sentence about ",
        { em: "saudade" },
        " that takes you ten minutes to fully translate and another week to fully understand.",
      ],
      [
        "The jokes came last, and they changed everything. Portuguese humor is dry, self-deprecating, and deeply historical. Once I could follow one — really follow it, not just laugh on delay — I felt something shift. Not that I belonged, exactly. But that I was no longer just passing through.",
      ],
      [
        "There's a difference between living in a city and living ",
        { em: "inside" },
        " it. Language isn't the only door, but in Lisbon, it might be the most important one. The city has been talking the whole time. Most of us just haven't been listening.",
      ],
    ],
  },
  {
    slug: "you-came-for-the-weather",
    title: "You Came for the Weather. You Stayed for Something Else.",
    category: "On Staying",
    date: "April 2026",
    readTime: "5 min read",
    image: "/lisbon_weather.jpg",
    intro:
      "Everyone has a reason they first come to Lisbon. Usually it's practical. Cheap flights, a long weekend, a friend who moved here and kept sending photos that looked slightly unreal.",
    body: [
      [
        "Sometimes it's the weather — that specific promise of February sun when the rest of Europe is grey and defeated.",
      ],
      ["But nobody stays for the weather."],
      [
        "Ask anyone who came for a week and is now renewing their residency permit. Ask the graphic designer from Berlin who sublet her apartment \u201cjust for three months\u201d four years ago. Ask the couple from S\u00e3o Paulo who came to visit family and quietly decided not to go back. The weather gets you here. Something else keeps you.",
      ],
      ["It's harder to name than you'd think."],
      [
        "Part of it is pace. Lisbon doesn't perform urgency the way other cities do. There's no ambient pressure, no sense that everyone around you is optimizing for something. A coffee can last an hour without anyone making you feel guilty about the table. That sounds small until you've spent years in a city where it isn't true.",
      ],
      [
        "Part of it is scale. Lisbon is big enough to surprise you and small enough that you start recognizing faces within weeks. The city has a memory. It notices when you become a regular.",
      ],
      [
        "But mostly it's something that happens in an unplanned moment. A Sunday lunch that stretches into the evening because nobody wants it to end. A conversation with a stranger that goes somewhere unexpected. A neighborhood you wandered into without a destination and left feeling like you'd been let in on something.",
      ],
      [
        "Lisbon doesn't seduce you all at once. It works slowly, through accumulation. A detail here, a moment there, until one day you realize the cost of leaving has quietly become higher than the cost of staying.",
      ],
      [
        "The weather brought you. You stayed because the city, eventually, made room for you.",
      ],
      [
        "And once it does, going back to the forecast somewhere else feels like a strange kind of loss.",
      ],
    ],
  },
];
