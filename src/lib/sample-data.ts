const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const hero = {
  eyebrow: "Resort 2026",
  title: "A season for softer silhouettes.",
  copy: "Hand-finished knitwear, relaxed tailoring, and heritage leathers — made in considered quantities and shipped from our atelier in Milan.",
  imageUrl: u("photo-1483985988355-763728e1935b", 2000),
};

export const editorial = {
  eyebrow: "The Atelier",
  title: "Made slowly, in rooms that smell of leather.",
  copy: "Every object we sell is produced in editions no larger than two hundred. Our workshop in Como employs twelve artisans — each piece carries their maker's mark on the inside seam.",
  cta: { label: "Read our story", href: "/about" },
  imageUrl: u("photo-1558769132-cb1aea458c5e", 1600),
};

export const services = [
  {
    title: "Complimentary shipping",
    copy: "On every order, worldwide, in signature packaging.",
  },
  {
    title: "Thirty-day returns",
    copy: "A simple, no-questions-asked return window.",
  },
  {
    title: "Client advisors",
    copy: "Speak to a human — by appointment or by message.",
  },
  {
    title: "Lifetime repair",
    copy: "We repair every leather piece we have ever made.",
  },
];

export const nav = {
  primary: [
    { label: "New In", href: "/new-arrivals" },
    { label: "Women", href: "/women" },
    { label: "Men", href: "/men" },
    { label: "Bags", href: "/bags" },
    { label: "Jewellery", href: "/jewellery" },
    { label: "Home", href: "/home" },
    { label: "Gifts", href: "/gifts" },
  ],
  footer: {
    client: [
      { label: "Contact us", href: "/contact" },
      { label: "Book an appointment", href: "/appointment" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Repair", href: "/repair" },
    ],
    house: [
      { label: "Our story", href: "/about" },
      { label: "The atelier", href: "/atelier" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
};
