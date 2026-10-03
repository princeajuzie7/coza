"use server";

import type { CountryCode } from "libphonenumber-js";
import { nanoid } from "nanoid";

import { NO_BUS } from "@/constant";

import { checkInSchema, type CheckInFields, type CheckInValues } from "@/app/(check-in)/_schemas";
import { checkIns, db } from "@/db";
import { AppError, safeAction } from "@/lib/action-handler";
import {
  type AttendanceMode,
  formatChurchDate,
  formatChurchTime,
  normalizeAttendanceMode,
  normalizeName,
  normalizeUnit,
  punctuality,
  serviceDate,
} from "@/lib/attendance";
import { formatPhoneForDisplay, normalizePhone } from "@/lib/phone";

export type CheckInReceipt = {
  fullName: string;
  group: CheckInValues["group"];
  punctuality: "early" | "late";
  unit: string | null;
  mode: AttendanceMode;
  phone: string;
  standing: CheckInValues["standing"];
  busTerminal: string;
  date: string;
  /** Already formatted in Lagos time — the client must not re-derive it. */
  at: string;
  hasEmail: boolean;
};

export const postCheckIn = safeAction(
  async (group: CheckInValues["group"], fields: CheckInFields): Promise<CheckInReceipt> => {
  // Re-validate server side: the client schema is a convenience, not a guarantee.
  // Group comes from the route, so it is validated here rather than trusted.
  const parsed = checkInSchema.safeParse({ ...fields, group });
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Check the form and try again");

  const data = parsed.data;
  const now = new Date();
  const verdict = punctuality(data.group, now);
  const mode = normalizeAttendanceMode(data.group, data.online);
  // An online attendee boards nothing; never store a terminal that did not happen.
  const busTerminal = mode === "online" ? NO_BUS : data.busTerminal;
  const phone = normalizePhone(data.phone.number, data.phone.countryCode as CountryCode);

  try {
    await db.insert(checkIns).values({
      id: `ci_${nanoid(24)}`,
      fullName: normalizeName(data.fullName),
      phone: formatPhoneForDisplay(phone),
      email: data.email === "" ? null : data.email.toLowerCase(),
      group: data.group,
      unit: normalizeUnit(data.group, data.unit),
      standing: data.standing,
      busTerminal,
      attendanceMode: mode,
      serviceDate: serviceDate(now),
      checkedInAt: now,
      punctuality: verdict,
      source: "live",
    });
  } catch (err) {
    // 23505 = unique_violation on (service_date, phone): already checked in today.
    if (typeof err === "object" && err !== null && "code" in err && err.code === "23505") {
      throw new AppError(`${normalizeName(data.fullName).split(" ")[0]} is already checked in for today's service.`);
    }
    // Anything else (DB unreachable, bad credentials) is ours to debug, not theirs to read.
    console.error("check-in insert failed", err);
    throw new AppError("We could not record that check-in. Try again, or let a steward know.");
  }

  return {
    fullName: normalizeName(data.fullName),
    group: data.group,
    punctuality: verdict,
    unit: normalizeUnit(data.group, data.unit),
    phone: formatPhoneForDisplay(phone),
    standing: data.standing,
    busTerminal,
    mode,
    date: formatChurchDate(now),
    at: formatChurchTime(now),
    hasEmail: data.email !== "",
  };
  }
);
