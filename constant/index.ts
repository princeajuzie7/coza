import type { AttendeeGroup } from "@/lib/attendance";

/** The product. The church is CHURCH below; this is the thing they log into. */
export const APP_NAME = "TrackMate";

export const NO_BUS = "none" as const;

export const CHURCH = {
  name: "COZA Global",
  legalName: "The Commonwealth of Zion Assembly",
  tagline: "A people helped by God",
  address: "1 Nasir El Rufai Crescent, Guzape Hills, Abuja, Nigeria",
  phone: "+234 1234567890",
  email: "support@cozaglobal.org",
  pastor: "The Rev. Biodun Fatoyinbo",
  pastorTitle: "Global Senior Pastor, COZA",
  quote: "You are a King in your own domain, called to take over, not to take sides.",
  motherTitle: "Pastor Modele Fatoyinbo",
  social: [
    { name: "Facebook", href: "https://facebook.com/cozaglobal", icon: "/social/facebook.svg" },
    { name: "X", href: "https://x.com/cozaglobal", icon: "/social/x.svg" },
    { name: "Instagram", href: "https://instagram.com/cozaglobal", icon: "/social/instagram.svg" },
    { name: "YouTube", href: "https://youtube.com/@cozaglobal", icon: "/social/youtube.svg" },
  ],
} as const;

export const NAV = [
  { label: "About COZA", href: "#about" },
  { label: "Sermons", href: "#sermons" },
  { label: "Locations", href: "#locations" },
  { label: "Contact", href: "#contact" },
] as const;

export const TESTIMONIALS = [
  {
    quote: "COZA didn't just change my Sunday — it changed my life. I now walk in clarity, wisdom, and divine purpose.",
    name: "Esther A.",
    where: "COZA Dubai",
  },
  {
    quote: "From the eChurch to in-person worship, I've felt God's presence move in power.",
    name: "David O.",
    where: "COZA eChurch",
  },
  {
    quote: "The Word has redefined my career, my home, and my faith.",
    name: "Rachel B.",
    where: "COZA Manchester",
  },
] as const;

export const FOOTER_LINKS = [
  { title: "Explore", links: ["Home", "About Us", "Sermons", "Give", "Contact Us"] },
  { title: "Support", links: ["Join a Church", "Watch Our Sermons", "Who We Are"] },
] as const;

export const SERVICES = [
  { name: "COZA Sundays", where: "All our churches", from: "09:00", to: "12:00" },
  { name: "COZA Tuesdays", where: "Guzape Church (HQ), Abuja", from: "18:00", to: "20:00" },
  { name: "Dominion Hour", where: "Guzape Church (HQ), Abuja", from: "06:00", to: "07:00" },
] as const;

export const STATS = [
  { value: "17+", label: "Global churches" },
  { value: "1M+", label: "Members worldwide" },
  { value: "26", label: "Years since Ilorin" },
] as const;

/** Route-level identity for the two check-in doors. */
export const GROUP_ROUTES: Array<{
  group: AttendeeGroup;
  href: string;
  invitation: string;
  blurb: string;
}> = [
  {
    group: "member",
    href: "/members",
    invitation: "I'm a member",
    blurb: "Here to worship this morning.",
  },
  {
    group: "workforce",
    href: "/workers",
    invitation: "I'm workforce",
    blurb: "Serving today — ushers, choir, media, protocol.",
  },
];

/**
 * Bus terminals the church runs pick-ups from.
 *
 * ponytail: PLACEHOLDER — Abuja districts, not a list the church gave us.
 * Replace before go-live; move to a table only once staff must edit without a deploy.
 */
export const BUS_TERMINALS = [
  "Apo",
  "Asokoro",
  "Dutse",
  "Garki",
  "Gwarinpa",
  "Jabi",
  "Karu",
  "Kubwa",
  "Lokogoma",
  "Lugbe",
  "Maitama",
  "Nyanya",
  "Wuse",
] as const;

/**
 * Workforce departments.
 *
 * ponytail: PLACEHOLDER — the usual church units, not a list COZA gave us.
 * Replace with the real roster before go-live. Same call as BUS_TERMINALS:
 * move to a table only when staff need to edit without a deploy.
 */
export const WORKFORCE_UNITS = [
  "Choir",
  "Ushering",
  "Protocol",
  "ICT",
  "Media & Sound",
  "Sanctuary Keepers",
  "Security",
  "Welfare & Hospitality",
  "Children's Church",
  "Teens Church",
  "Drama",
  "Decoration",
  "Transport",
  "Prayer",
  "Follow-up & PR",
  "Medical",
] as const;

export const STANDINGS = [
  { value: "old_member", label: "Old member", description: "Been attending" },
  { value: "new_member", label: "New member", description: "Just joined" },
  { value: "visitor", label: "Visitor", description: "Passing through" },
] as const;
