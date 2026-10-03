/**
 * Punctuality is decided by the clock, never by what the attendee ticks.
 * Everything in this file is pure so the rule can be tested without a DB.
 */

/** The church runs on Lagos time. Servers do not. Never read the host clock's zone. */
export const CHURCH_TZ = "Africa/Lagos";

export type AttendeeGroup = "member" | "workforce";
export type Punctuality = "early" | "late";
export type AttendanceMode = "in_person" | "online";

/**
 * Minutes-after-midnight at which each group stops being early.
 * At the cutoff exactly you are late — closes the 07:00:00–07:00:59 hole
 * in "early before 7:00 / late from 7:01".
 *
 * ponytail: hardcoded because today there is one service. Move to a
 * `service_windows` table the first time a special service needs its own times.
 */
export const CUTOFF_MINUTES: Record<AttendeeGroup, number> = {
  workforce: 7 * 60 + 30, // 07:30
  member: 8 * 60 + 45, // 08:45
};

export const GROUP_LABEL: Record<AttendeeGroup, string> = {
  member: "Member",
  workforce: "Workforce",
};

/**
 * Each door gets one of the two COZA inks, so which check-in you are on is
 * legible from across a lobby without reading a word.
 */
export const GROUP_STYLE: Record<AttendeeGroup, { surface: string; offset: string; ink: string }> = {
  // The offset block is the *other* ink — orange behind purple, as on the
  // eChurch poster. Same-colour offsets are invisible, which defeats the device.
  member: {
    surface: "bg-brand-orange",
    offset: "shadow-[10px_10px_0_0_var(--brand-purple)]",
    ink: "text-brand-navy",
  },
  workforce: {
    surface: "bg-brand-purple",
    offset: "shadow-[10px_10px_0_0_var(--brand-orange)]",
    ink: "text-white",
  },
};

/** Minutes after midnight for `at`, as read on a clock in `tz`. */
export function minutesOfDay(at: Date, tz: string = CHURCH_TZ): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23", // h23 so midnight is 00, not 24
  }).format(at);

  const [hour, minute] = parts.split(":").map(Number);
  return hour * 60 + minute;
}

/** The service date (YYYY-MM-DD) that `at` falls on locally, not in UTC. */
export function serviceDate(at: Date, tz: string = CHURCH_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/**
 * Only workforce belong to a unit. Members never do — so a unit arriving on a
 * member check-in is dropped rather than stored, whatever the client sent.
 */
export function normalizeUnit(group: AttendeeGroup, unit: string | undefined): string | null {
  if (group !== "workforce") return null;
  return unit?.trim() ? unit.trim() : null;
}

/**
 * Tidy a typed name for the register without mangling it.
 *
 * Only acts when the input is uniformly cased — "prince ajuzie" or "PRINCE
 * AJUZIE" are someone not bothering with the shift key, so they get title case.
 * Anything already mixed ("van der Berg", "McDonald", "DeSouza") is left exactly
 * as typed, because no rule gets those right and a wrong name is worse than an
 * untidy one.
 */
export function normalizeName(input: string): string {
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return name;

  const uniformlyCased = name === name.toLowerCase() || name === name.toUpperCase();
  if (!uniformlyCased) return name;

  // Capitalise after a space, hyphen or apostrophe: o'brien → O'Brien.
  return name.toLowerCase().replace(/(^|[\s'\u2019-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

/**
 * Members can join from anywhere via eChurch; workforce are rostered to serve
 * in a building, so they are always in person however the request was built.
 */
export function normalizeAttendanceMode(group: AttendeeGroup, online: boolean): AttendanceMode {
  if (group === "workforce") return "in_person";
  return online ? "online" : "in_person";
}

export const ATTENDANCE_MODE_LABEL: Record<AttendanceMode, string> = {
  in_person: "In person",
  online: "Online",
};

/** The whole of requirement #4, in one line. */
export function punctuality(group: AttendeeGroup, at: Date): Punctuality {
  return minutesOfDay(at) < CUTOFF_MINUTES[group] ? "early" : "late";
}

/** "7:30 AM" — for labels, from a minutes-after-midnight cutoff. */
export function formatCutoff(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** Wall-clock time in Lagos, e.g. "6:52:04 AM". */
export function formatChurchTime(at: Date, withSeconds = false): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: CHURCH_TZ,
    hour: "numeric",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" as const } : {}),
    hour12: true,
  }).format(at);
}

export function formatChurchDate(at: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: CHURCH_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(at);
}

/**
 * Single source of truth for the dashboard legend: green early, amber late,
 * red absent. Lives here so the form's confirmation and the dashboard that
 * comes later cannot drift apart.
 */
export const STATUS_STYLE = {
  early: {
    label: "Early",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    chip: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  },
  late: {
    // Yellow, not amber: amber is a near-match for the brand orange of the primary button.
    label: "Late",
    dot: "bg-yellow-500",
    text: "text-yellow-700 dark:text-yellow-400",
    chip: "bg-yellow-500/15 text-yellow-700 ring-yellow-500/30 dark:text-yellow-300",
  },
  absent: {
    label: "Absent",
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    chip: "bg-red-500/12 text-red-700 ring-red-500/25 dark:text-red-300",
  },
} as const;

/**
 * When the morning progress bars start filling. Presentation only — it has no
 * say in whether anyone is early, so it never belongs in the cutoff map.
 */
export const WINDOW_OPENS_MINUTES = 5 * 60; // 05:00

/** 0 → 1, how much of a group's early window has been used up at `at`. */
export function windowProgress(group: AttendeeGroup, at: Date): number {
  const span = CUTOFF_MINUTES[group] - WINDOW_OPENS_MINUTES;
  const elapsed = minutesOfDay(at) - WINDOW_OPENS_MINUTES;
  return Math.min(1, Math.max(0, elapsed / span));
}
