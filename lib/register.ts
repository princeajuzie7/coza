import type { CheckIn } from "@/db/schema";
import { type AttendeeGroup, formatCutoff, minutesOfDay } from "./attendance.ts";

export type RegisterRow = CheckIn;

export type RegisterStats = {
  total: number;
  early: number;
  late: number;
  members: number;
  workforce: number;
  online: number;
  noEmail: number;
  absent: number;
};

/**
 * Derived in one pass so the header figures and the table can never disagree —
 * the usual way a dashboard starts lying is two places counting the same thing.
 */
export function summarise(rows: RegisterRow[], absent: number): RegisterStats {
  const stats: RegisterStats = {
    total: rows.length,
    early: 0,
    late: 0,
    members: 0,
    workforce: 0,
    online: 0,
    noEmail: 0,
    absent,
  };

  for (const r of rows) {
    if (r.punctuality === "early") stats.early++;
    else stats.late++;
    if (r.group === "member") stats.members++;
    else stats.workforce++;
    if (r.attendanceMode === "online") stats.online++;
    if (!r.email) stats.noEmail++;
  }

  return stats;
}

export const byGroup = (rows: RegisterRow[], group: AttendeeGroup | "all") =>
  group === "all" ? rows : rows.filter((r) => r.group === group);

// ─── Analytics ───────────────────────────────────────────────────────────────

export type ArrivalBucket = { minute: number; label: string; early: number; late: number };

/**
 * Check-ins grouped into clock-time buckets, so the admin can see the shape of
 * the morning: when the rush hits, and how much of it lands after the cutoff.
 * Buckets are built from the data's own range rather than a fixed window, so a
 * 6am Dominion Hour and a 9am Sunday both read correctly.
 */
export function arrivalBuckets(rows: RegisterRow[], stepMinutes = 10): ArrivalBucket[] {
  if (rows.length === 0) return [];

  const minuteOf = (r: RegisterRow) => {
    const d = new Date(r.checkedInAt);
    return minutesOfDay(d);
  };

  const minutes = rows.map(minuteOf);
  const floorTo = (m: number) => Math.floor(m / stepMinutes) * stepMinutes;
  const start = floorTo(Math.min(...minutes));
  const end = floorTo(Math.max(...minutes));

  const buckets = new Map<number, ArrivalBucket>();
  for (let m = start; m <= end; m += stepMinutes) {
    buckets.set(m, { minute: m, label: formatCutoff(m).replace(/:00 /, " "), early: 0, late: 0 });
  }

  for (const r of rows) {
    const bucket = buckets.get(floorTo(minuteOf(r)));
    if (!bucket) continue;
    if (r.punctuality === "early") bucket.early++;
    else bucket.late++;
  }

  return [...buckets.values()];
}

export type UnitCount = { unit: string; present: number };

/** Workforce turnout per unit, busiest first — who actually showed up to serve. */
export function unitBreakdown(rows: RegisterRow[]): UnitCount[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.group !== "workforce" || !r.unit) continue;
    counts.set(r.unit, (counts.get(r.unit) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([unit, present]) => ({ unit, present }))
    .sort((a, b) => b.present - a.present);
}

export type StandingCount = { standing: string; label: string; count: number };

export function standingBreakdown(rows: RegisterRow[]): StandingCount[] {
  const labels: Record<string, string> = {
    old_member: "Old member",
    new_member: "New member",
    visitor: "Visitor",
  };
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.standing, (counts.get(r.standing) ?? 0) + 1);

  return ["old_member", "new_member", "visitor"].map((standing) => ({
    standing,
    label: labels[standing]!,
    count: counts.get(standing) ?? 0,
  }));
}

export type ServicePoint = { serviceDate: string; total: number; onTimeRate: number };

/**
 * Percentage change against the previous period.
 *
 * Returns null — not Infinity, and not a bogus 100% — when there is no baseline
 * to compare against, so the UI can say "no comparison" instead of printing a
 * number that means nothing.
 */
export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

// ─── Follow-up ───────────────────────────────────────────────────────────────

export type FollowUpTier = "missed" | "drifting" | "lapsed";

export type FollowUp = {
  phone: string;
  fullName: string;
  group: AttendeeGroup;
  email: string | null;
  lastSeen: string;
  /** How many services have run since they were last here. */
  servicesAway: number;
  tier: FollowUpTier;
};

export const FOLLOW_UP_TIERS: Record<FollowUpTier, { label: string; blurb: string; dot: string }> = {
  missed: { label: "Missed today", blurb: "Here last service", dot: "bg-yellow-500" },
  drifting: { label: "Drifting", blurb: "Away 2–4 services", dot: "bg-orange-500" },
  lapsed: { label: "Lapsed", blurb: "Away 5 or more", dot: "bg-red-500" },
};

/**
 * Turns "who isn't here" into "who to call first".
 *
 * A flat list of every absent name is unusable — someone who missed one Sunday
 * and someone last seen in April need different conversations. Ranking by how
 * many services they have missed is what makes it a queue.
 *
 * `serviceDates` must be every service on record, ascending.
 */
export function buildFollowUps(
  known: Array<{ phone: string; fullName: string; group: AttendeeGroup; email: string | null; lastSeen: string }>,
  presentPhones: Set<string>,
  serviceDates: string[],
  activeDate: string
): FollowUp[] {
  // Index once; this runs per absentee and the list can be long.
  const positionOf = new Map(serviceDates.map((d, i) => [d, i]));
  const activeIndex = positionOf.get(activeDate) ?? serviceDates.length - 1;

  return known
    .filter((k) => !presentPhones.has(k.phone))
    // Someone whose last visit is after the service being viewed is not absent
    // from it in any useful sense — they simply had not started yet.
    .filter((k) => (positionOf.get(k.lastSeen) ?? -1) <= activeIndex)
    .map((k) => {
      const seenIndex = positionOf.get(k.lastSeen) ?? 0;
      const servicesAway = Math.max(1, activeIndex - seenIndex);
      const tier: FollowUpTier = servicesAway === 1 ? "missed" : servicesAway <= 4 ? "drifting" : "lapsed";
      return { ...k, servicesAway, tier };
    })
    .sort((a, b) => a.servicesAway - b.servicesAway || a.fullName.localeCompare(b.fullName));
}

export const countByTier = (rows: FollowUp[]) => ({
  missed: rows.filter((r) => r.tier === "missed").length,
  drifting: rows.filter((r) => r.tier === "drifting").length,
  lapsed: rows.filter((r) => r.tier === "lapsed").length,
});
