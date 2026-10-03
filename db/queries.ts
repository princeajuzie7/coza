import "server-only";

import { desc, eq } from "drizzle-orm";

import { type CheckIn, checkIns, db } from "./index";
import { USING_MOCK, readMockRows } from "./mock";

/**
 * One place where the mock and the real database diverge. Everything above this
 * line works the same either way, so the admin is exercised before Neon exists.
 */
export async function getCheckIns(serviceDate: string): Promise<CheckIn[]> {
  if (USING_MOCK) {
    // JSON has no Date type, so revive the timestamps the rest of the app expects.
    return readMockRows()
      .filter((r) => r.serviceDate === serviceDate)
      .map((r) => ({ ...r, checkedInAt: new Date(r.checkedInAt), createdAt: new Date(r.createdAt) }))
      .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime());
  }

  return db
    .select()
    .from(checkIns)
    .where(eq(checkIns.serviceDate, serviceDate))
    .orderBy(desc(checkIns.checkedInAt));
}

/** The distinct service dates on record, newest first — drives the date picker. */
export async function getServiceDates(): Promise<string[]> {
  if (USING_MOCK) {
    return [...new Set(readMockRows().map((r) => r.serviceDate))].sort().reverse();
  }

  const rows = await db
    .selectDistinct({ serviceDate: checkIns.serviceDate })
    .from(checkIns)
    .orderBy(desc(checkIns.serviceDate));

  return rows.map((r) => r.serviceDate);
}

/** Everyone ever seen, so "expected today" can be derived for absence. */
export async function getKnownAttendees(): Promise<Array<{ phone: string; fullName: string; group: CheckIn["group"] }>> {
  if (USING_MOCK) {
    const seen = new Map<string, { phone: string; fullName: string; group: CheckIn["group"] }>();
    for (const r of readMockRows()) seen.set(r.phone, { phone: r.phone, fullName: r.fullName, group: r.group });
    return [...seen.values()];
  }

  return db
    .selectDistinctOn([checkIns.phone], {
      phone: checkIns.phone,
      fullName: checkIns.fullName,
      group: checkIns.group,
    })
    .from(checkIns)
    .orderBy(checkIns.phone, desc(checkIns.checkedInAt));
}

export type ServiceTotals = {
  serviceDate: string;
  members: number;
  workforce: number;
  late: number;
  total: number;
  /** Share of that service that beat its cutoff, 0–100. */
  onTimeRate: number;
};

/** Turnout for the most recent services, oldest → newest, for the trend chart. */
export async function getRecentServiceTotals(limit = 8): Promise<ServiceTotals[]> {
  const dates = (await getServiceDates()).slice(0, limit).reverse();
  const perDate = await Promise.all(dates.map((d) => getCheckIns(d)));

  return dates.map((serviceDate, i) => {
    const rows = perDate[i]!;
    const late = rows.filter((r) => r.punctuality === "late").length;
    return {
      serviceDate,
      members: rows.filter((r) => r.group === "member").length,
      workforce: rows.filter((r) => r.group === "workforce").length,
      late,
      total: rows.length,
      onTimeRate: rows.length === 0 ? 0 : Math.round(((rows.length - late) / rows.length) * 100),
    };
  });
}

/** Service dates within an inclusive range. Both bounds optional. */
export async function getServiceDatesInRange(from?: string, to?: string): Promise<string[]> {
  const all = await getServiceDates();
  return all.filter((d) => (!from || d >= from) && (!to || d <= to)).sort();
}

/** Every check-in across a range of services, newest first. */
export async function getCheckInsInRange(from?: string, to?: string): Promise<CheckIn[]> {
  const dates = await getServiceDatesInRange(from, to);
  const perDate = await Promise.all(dates.map((d) => getCheckIns(d)));
  return perDate.flat().sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime());
}

/** Per-service totals across a range, oldest → newest. */
export async function getServiceTotalsInRange(from?: string, to?: string): Promise<ServiceTotals[]> {
  const dates = await getServiceDatesInRange(from, to);
  const perDate = await Promise.all(dates.map((d) => getCheckIns(d)));

  return dates.map((serviceDate, i) => {
    const rows = perDate[i]!;
    const late = rows.filter((r) => r.punctuality === "late").length;
    return {
      serviceDate,
      members: rows.filter((r) => r.group === "member").length,
      workforce: rows.filter((r) => r.group === "workforce").length,
      late,
      total: rows.length,
      onTimeRate: rows.length === 0 ? 0 : Math.round(((rows.length - late) / rows.length) * 100),
    };
  });
}
