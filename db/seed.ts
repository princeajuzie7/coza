import { CUTOFF_MINUTES, serviceDate } from "@/lib/attendance";
import type { CheckIn } from "./schema";

/**
 * Demo data, bundled so a deployed preview has something to show. `.data/` is
 * gitignored and a serverless filesystem is read-only, so a JSON file never
 * survives a deploy.
 *
 * The *data* is the two objects below — a roster and a season of services. The
 * rows are expanded from them deterministically rather than written out
 * longhand: 2,000-odd literal records would be most of a megabyte of JS parsed
 * on every cold start, and nobody could edit it. Change a turnout here and the
 * whole dashboard moves.
 *
 * ponytail: delete this file the day DATABASE_URL is set.
 */

const FIRST = ["Grace","Emeka","Chidinma","Tunde","Aisha","Ifeoma","Segun","Ngozi","Bola","Uche","Funke","Kelechi","Amara","Yemi","Zainab","Obi","Temi","Chiamaka","Dayo","Nneka","Femi","Halima","Ikenna","Tolu","Adaeze","Musa","Bisi","Chinedu","Simi","Kunle","Ada","Gbenga","Ruth","Peter","Esther","David","Rachel","Samuel","Joy","Paul","Blessing","Daniel","Mercy","John","Faith","Ebere","Lanre","Oluchi","Seyi","Hauwa"];
const LAST = ["Adeyemi","Okafor","Balogun","Eze","Lawal","Nwosu","Adeleke","Ibrahim","Okonkwo","Afolabi","Udo","Bello","Chukwu","Ogunleye","Mohammed","Danjuma","Oyelaran","Nnamdi","Abiola","Suleiman","Olawale","Nwachukwu"];

const UNITS = ["Choir","Ushering","Protocol","ICT","Media & Sound","Security","Children's Church","Welfare & Hospitality","Decoration","Transport"];
const TERMINALS = ["Gwarinpa","Kubwa","Lugbe","Wuse","Garki","Nyanya","Jabi","Karu","Apo"];
const STANDINGS = ["old_member", "new_member", "visitor"] as const;

/** One service in the season. Edit these and the charts change. */
export type SeedService = {
  /** 0 is today, 1 is a week ago, and so on. */
  weeksAgo: number;
  /** Why this week looks the way it does — shown nowhere, but it explains the shape. */
  note: string;
  turnout: number;
  /** 0–1. Special services run late; quiet ones are punctual. */
  lateRatio: number;
};

/**
 * A season with a story: steady growth, two packed special weeks that arrive
 * late, a leadership summit, and two thin rainy Sundays that turn up on time.
 * A flat line would make the dashboard look broken.
 */
export const SEED_SERVICES: readonly SeedService[] = [
  { weeksAgo: 25, note: "Start of the season", turnout: 52, lateRatio: 0.3 },
  { weeksAgo: 24, note: "Steady", turnout: 57, lateRatio: 0.28 },
  { weeksAgo: 23, note: "Steady", turnout: 55, lateRatio: 0.31 },
  { weeksAgo: 22, note: "Steady", turnout: 61, lateRatio: 0.26 },
  { weeksAgo: 21, note: "12 Days of Glory — packed, everyone late", turnout: 186, lateRatio: 0.52 },
  { weeksAgo: 20, note: "12DG weekend two", turnout: 171, lateRatio: 0.48 },
  { weeksAgo: 19, note: "Post-conference dip", turnout: 49, lateRatio: 0.24 },
  { weeksAgo: 18, note: "Recovering", turnout: 63, lateRatio: 0.27 },
  { weeksAgo: 17, note: "Steady", turnout: 66, lateRatio: 0.29 },
  { weeksAgo: 16, note: "Steady", turnout: 64, lateRatio: 0.3 },
  { weeksAgo: 15, note: "Rain — thin but punctual", turnout: 38, lateRatio: 0.16 },
  { weeksAgo: 14, note: "Steady", turnout: 68, lateRatio: 0.28 },
  { weeksAgo: 13, note: "Leadership Summit Sunday", turnout: 128, lateRatio: 0.44 },
  { weeksAgo: 12, note: "Steady", turnout: 71, lateRatio: 0.3 },
  { weeksAgo: 11, note: "Steady", turnout: 69, lateRatio: 0.26 },
  { weeksAgo: 10, note: "Rain — thin but punctual", turnout: 42, lateRatio: 0.18 },
  { weeksAgo: 9, note: "Steady", turnout: 74, lateRatio: 0.29 },
  { weeksAgo: 8, note: "Steady", turnout: 77, lateRatio: 0.31 },
  { weeksAgo: 7, note: "Thanksgiving service", turnout: 112, lateRatio: 0.4 },
  { weeksAgo: 6, note: "Steady", turnout: 79, lateRatio: 0.27 },
  { weeksAgo: 5, note: "Steady", turnout: 81, lateRatio: 0.3 },
  { weeksAgo: 4, note: "Steady", turnout: 84, lateRatio: 0.28 },
  { weeksAgo: 3, note: "Steady", turnout: 83, lateRatio: 0.25 },
  { weeksAgo: 2, note: "Steady", turnout: 88, lateRatio: 0.29 },
  { weeksAgo: 1, note: "Last Sunday", turnout: 91, lateRatio: 0.27 },
  { weeksAgo: 0, note: "Today — the live register", turnout: 86, lateRatio: 0.33 },
];

type Person = {
  fullName: string;
  phone: string;
  email: string | null;
  group: "member" | "workforce";
  unit: string | null;
  standing: (typeof STANDINGS)[number];
  busTerminal: string;
  online: boolean;
};

/**
 * A stable congregation. The same people recur week to week, which is what
 * makes "not seen today" and the duplicate guard behave like the real thing.
 */
function buildRoster(size: number): Person[] {
  const people: Person[] = [];

  for (let i = 0; i < size; i++) {
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[(i * 7) % LAST.length]!;
    const isWorkforce = i % 4 === 0;
    // Roughly one in six has no email — the people staff must ring (#5).
    const hasEmail = i % 6 !== 0;

    people.push({
      fullName: `${first} ${last}`,
      phone: `+23480${String(10000000 + i * 131).slice(0, 8)}`,
      email: hasEmail ? `${first.toLowerCase()}.${last.toLowerCase()}@email.com` : null,
      group: isWorkforce ? "workforce" : "member",
      unit: isWorkforce ? UNITS[i % UNITS.length]! : null,
      standing: STANDINGS[i % 11 === 0 ? 1 : i % 13 === 0 ? 2 : 0]!,
      busTerminal: i % 5 === 0 ? "none" : TERMINALS[i % TERMINALS.length]!,
      // Members only; workforce serve in the building.
      online: !isWorkforce && i % 9 === 4,
    });
  }

  return people;
}

export const SEED_ROSTER = buildRoster(260);

/** Expands the roster and the season into check-in rows. */
export function seedCheckIns(now = new Date()): CheckIn[] {
  const rows: CheckIn[] = [];
  let id = 0;

  for (const service of SEED_SERVICES) {
    const day = serviceDate(new Date(now.getTime() - service.weeksAgo * 7 * 86_400_000));

    for (let i = 0; i < service.turnout; i++) {
      // A rolling window over the roster: mostly the same faces each week,
      // with enough churn that some people go missing and new ones appear.
      const person = SEED_ROSTER[(i + service.weeksAgo * 11) % SEED_ROSTER.length]!;
      const cutoff = CUTOFF_MINUTES[person.group];
      const late = (i * 7919) % 100 < service.lateRatio * 100;
      const minute = late ? cutoff + 1 + ((i * 13) % 55) : cutoff - 1 - ((i * 17) % 70);

      const at = new Date(
        `${day}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00+01:00`
      );

      rows.push({
        id: `ci_seed${id++}`,
        fullName: person.fullName,
        phone: person.phone,
        email: person.email,
        group: person.group,
        unit: person.unit,
        attendanceMode: person.online ? "online" : "in_person",
        standing: person.standing,
        busTerminal: person.online ? "none" : person.busTerminal,
        serviceDate: day,
        checkedInAt: at,
        punctuality: late ? "late" : "early",
        source: "live",
        createdAt: at,
      });
    }
  }

  return rows;
}
