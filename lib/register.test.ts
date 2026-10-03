import assert from "node:assert/strict";
import { test } from "node:test";

import {
  arrivalBuckets,
  buildFollowUps,
  percentDelta,
  standingBreakdown,
  summarise,
  unitBreakdown,
} from "./register.ts";

type Row = Parameters<typeof summarise>[0][number];

// Lagos is UTC+1, so a UTC literal is an unambiguous local clock time.
const row = (over: Partial<Row>): Row =>
  ({
    id: "x",
    fullName: "A B",
    phone: "+2348000000000",
    email: null,
    group: "member",
    unit: null,
    attendanceMode: "in_person",
    standing: "old_member",
    busTerminal: "none",
    serviceDate: "2026-10-04",
    checkedInAt: new Date("2026-10-04T05:30:00Z"), // 06:30 Lagos
    punctuality: "early",
    source: "live",
    createdAt: new Date("2026-10-04T05:30:00Z"),
    ...over,
  }) as Row;

test("the headline figures count each row exactly once", () => {
  const stats = summarise(
    [
      row({ punctuality: "early", group: "member" }),
      row({ punctuality: "late", group: "workforce", unit: "Choir" }),
      row({ punctuality: "late", group: "member", attendanceMode: "online", email: "a@b.com" }),
    ],
    4
  );

  assert.equal(stats.total, 3);
  assert.equal(stats.early + stats.late, stats.total, "every row is early or late");
  assert.equal(stats.members + stats.workforce, stats.total, "every row is member or workforce");
  assert.equal(stats.online, 1);
  assert.equal(stats.noEmail, 2);
  assert.equal(stats.absent, 4);
});

test("arrival buckets span the data and keep every check-in", () => {
  const rows = [
    row({ checkedInAt: new Date("2026-10-04T05:02:00Z") }), // 06:02
    row({ checkedInAt: new Date("2026-10-04T05:09:00Z") }), // 06:09 — same bucket
    row({ checkedInAt: new Date("2026-10-04T05:31:00Z"), punctuality: "late" }), // 06:31
  ];
  const buckets = arrivalBuckets(rows, 10);

  assert.equal(buckets[0]!.minute, 6 * 60); // floored to 06:00
  assert.equal(buckets.at(-1)!.minute, 6 * 60 + 30);
  assert.equal(buckets.length, 4, "06:00, 06:10, 06:20, 06:30 — gaps included");
  assert.equal(
    buckets.reduce((n, b) => n + b.early + b.late, 0),
    rows.length,
    "no check-in is dropped between buckets"
  );
  assert.equal(buckets[0]!.early, 2);
  assert.equal(buckets.at(-1)!.late, 1);
});

test("arrival buckets are empty rather than exploding on an empty register", () => {
  assert.deepEqual(arrivalBuckets([], 10), []);
});

test("unit turnout counts workforce only, busiest first", () => {
  const rows = [
    row({ group: "workforce", unit: "Choir" }),
    row({ group: "workforce", unit: "Choir" }),
    row({ group: "workforce", unit: "ICT" }),
    row({ group: "member", unit: "Choir" }), // a member cannot hold a unit
  ];
  assert.deepEqual(unitBreakdown(rows), [
    { unit: "Choir", present: 2 },
    { unit: "ICT", present: 1 },
  ]);
});

test("standing breakdown always returns all three, including zeroes", () => {
  const result = standingBreakdown([row({ standing: "visitor" })]);
  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((r) => r.count),
    [0, 0, 1]
  );
});

test("percent delta reports change, and admits when it cannot", () => {
  assert.equal(percentDelta(110, 100), 10);
  assert.equal(percentDelta(90, 100), -10);
  assert.equal(percentDelta(0, 0), 0, "nothing then nothing is no change, not a gap");
  // Growth from zero has no meaningful percentage — never print Infinity at a pastor.
  assert.equal(percentDelta(42, 0), null);
});

// ─── Follow-up ───────────────────────────────────────────────────────────────

const DATES = ["2026-09-05", "2026-09-12", "2026-09-19", "2026-09-26", "2026-10-03"];

const person = (name: string, lastSeen: string, group: "member" | "workforce" = "member") => ({
  phone: `+234${name.length}${lastSeen.slice(-2)}`,
  fullName: name,
  group,
  email: null,
  lastSeen,
});

test("follow-ups rank by how many services someone has missed", () => {
  const rows = buildFollowUps(
    [
      person("Lapsed Len", "2026-09-05"), // 4 services back
      person("Missed Mo", "2026-09-26"), // last service
      person("Drifting Dee", "2026-09-12"), // 3 back
    ],
    new Set(),
    DATES,
    "2026-10-03"
  );

  assert.deepEqual(
    rows.map((r) => [r.fullName, r.servicesAway, r.tier]),
    [
      ["Missed Mo", 1, "missed"],
      ["Drifting Dee", 3, "drifting"],
      ["Lapsed Len", 4, "drifting"],
    ],
    "nearest misses come first — they are the ones worth calling"
  );
});

test("anyone on today's register is not a follow-up", () => {
  const absent = person("Missed Mo", "2026-09-26");
  const present = person("Here Today", "2026-10-03");

  const rows = buildFollowUps([absent, present], new Set([present.phone]), DATES, "2026-10-03");

  assert.deepEqual(
    rows.map((r) => r.fullName),
    ["Missed Mo"],
    "the one who checked in drops out; the one who did not remains"
  );
});

test("someone who had not started yet is not counted absent from an earlier service", () => {
  // Viewing 12 Sept: a person first seen on 3 Oct cannot have missed it.
  const rows = buildFollowUps([person("Joined Later", "2026-10-03")], new Set(), DATES, "2026-09-12");
  assert.deepEqual(rows, []);
});

test("five or more services away is a lapse, not a drift", () => {
  const longDates = ["2026-08-01", ...DATES];
  const rows = buildFollowUps([person("Gone Greg", "2026-08-01")], new Set(), longDates, "2026-10-03");
  assert.equal(rows[0]!.servicesAway, 5);
  assert.equal(rows[0]!.tier, "lapsed");
});
