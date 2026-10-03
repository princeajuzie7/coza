import { date, index, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const attendeeGroupEnum = pgEnum("attendee_group", ["member", "workforce"]);
export const standingEnum = pgEnum("standing", ["old_member", "new_member", "visitor"]);
export const punctualityEnum = pgEnum("punctuality", ["early", "late"]);
export const attendanceModeEnum = pgEnum("attendance_mode", ["in_person", "online"]);
/** Live check-ins vs rows that arrived from a spreadsheet import. Keeps history apart. */
export const checkInSourceEnum = pgEnum("check_in_source", ["live", "import"]);

export const checkIns = pgTable(
  "check_ins",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    /** Identity key. Required even when email is not — it is how staff reach people. */
    phone: text("phone").notNull(),
    /** Null on purpose: reports list these people so staff know to phone instead. */
    email: text("email"),
    group: attendeeGroupEnum("group").notNull(),
    /** Workforce department (choir, ushering, ICT…). Always null for members. */
    unit: text("unit"),
    /** eChurch vs in the building. Always "in_person" for workforce. */
    attendanceMode: attendanceModeEnum("attendance_mode").notNull().default("in_person"),
    standing: standingEnum("standing").notNull(),
    /** A terminal name, or "none" for people who made their own way. */
    busTerminal: text("bus_terminal").notNull(),
    /** Lagos calendar date, not UTC — a 6am service must never land on the day before. */
    serviceDate: date("service_date").notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow().notNull(),
    /**
     * Stored, not derived at read time: if the church moves a cutoff next month,
     * last month's records must keep the verdict they were given.
     */
    punctuality: punctualityEnum("punctuality").notNull(),
    source: checkInSourceEnum("source").notNull().default("live"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // One check-in per person per service day. Also what makes phone the identity key.
    unique("unique_check_in_per_day").on(table.serviceDate, table.phone),
    index("idx_check_in_day_group").on(table.serviceDate, table.group),
    index("idx_check_in_unit").on(table.serviceDate, table.unit),
    index("idx_check_in_phone").on(table.phone),
  ]
);

export type CheckIn = InferSelectModel<typeof checkIns>;
