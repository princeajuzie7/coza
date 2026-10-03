import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CUTOFF_MINUTES,
  formatCutoff,
  minutesOfDay,
  normalizeAttendanceMode,
  normalizeName,
  normalizeUnit,
  punctuality,
  serviceDate,
} from "./attendance.ts";

// Lagos is UTC+1 year round, so a UTC literal is an unambiguous Lagos clock time.
const at = (utc: string) => new Date(utc);

test("a member is early up to 08:44 and late from 08:45", () => {
  assert.equal(punctuality("member", at("2026-10-04T07:44:00Z")), "early"); // 08:44
  assert.equal(punctuality("member", at("2026-10-04T07:45:00Z")), "late"); // 08:45 exactly
  assert.equal(punctuality("member", at("2026-10-04T07:45:30Z")), "late"); // the 08:45:30 hole
});

test("workforce is held to the earlier 07:30 cutoff", () => {
  assert.equal(punctuality("workforce", at("2026-10-04T06:29:00Z")), "early"); // 07:29
  assert.equal(punctuality("workforce", at("2026-10-04T06:30:00Z")), "late"); // 07:30 exactly
});

test("the same arrival is early for a member and late for workforce", () => {
  const eightOClock = at("2026-10-04T07:00:00Z"); // 08:00 — inside the member window, past workforce
  assert.equal(punctuality("member", eightOClock), "early");
  assert.equal(punctuality("workforce", eightOClock), "late");
});

test("ticking 'early' at 08:50 does not help: the clock decides", () => {
  assert.equal(punctuality("member", at("2026-10-04T07:50:00Z")), "late");
});

test("times are read in Lagos, not on the server's clock", () => {
  // 06:05 UTC is 07:05 in Lagos. A UTC-naive reading would call this early.
  assert.equal(minutesOfDay(at("2026-10-04T06:05:00Z")), 7 * 60 + 5);
  assert.equal(minutesOfDay(at("2026-10-04T06:05:00Z"), "UTC"), 6 * 60 + 5);
});

test("a check-in just after Lagos midnight belongs to the new day, and reads as 00:30", () => {
  const justPastMidnight = at("2026-10-04T23:30:00Z"); // 00:30 on the 5th in Lagos
  assert.equal(serviceDate(justPastMidnight), "2026-10-05");
  assert.equal(minutesOfDay(justPastMidnight), 30); // not 24*60+30
});

test("cutoffs render as the times the church published", () => {
  assert.equal(formatCutoff(CUTOFF_MINUTES.workforce), "7:30 AM");
  assert.equal(formatCutoff(CUTOFF_MINUTES.member), "8:45 AM");
  assert.equal(formatCutoff(0), "12:00 AM");
});

test("a unit sticks to workforce and is stripped from members", () => {
  assert.equal(normalizeUnit("workforce", "Choir"), "Choir");
  assert.equal(normalizeUnit("workforce", "  ICT  "), "ICT");
  // A member cannot smuggle a unit in, however the request was built.
  assert.equal(normalizeUnit("member", "Choir"), null);
  assert.equal(normalizeUnit("workforce", ""), null);
  assert.equal(normalizeUnit("workforce", undefined), null);
});

test("a name typed without the shift key is tidied for the register", () => {
  assert.equal(normalizeName("prince ajuzie"), "Prince Ajuzie");
  assert.equal(normalizeName("PRINCE AJUZIE"), "Prince Ajuzie");
  assert.equal(normalizeName("  grace   adeyemi  "), "Grace Adeyemi");
  assert.equal(normalizeName("o'brien"), "O'Brien");
  assert.equal(normalizeName("adeyemi-smith"), "Adeyemi-Smith");
});

test("a name already mixed-case is left exactly as typed", () => {
  // No casing rule gets these right, and a wrong name is worse than an untidy one.
  for (const name of ["van der Berg", "McDonald", "DeSouza", "Grace Adeyemi"]) {
    assert.equal(normalizeName(name), name);
  }
});

test("only members can attend online; workforce are always in the building", () => {
  assert.equal(normalizeAttendanceMode("member", true), "online");
  assert.equal(normalizeAttendanceMode("member", false), "in_person");
  // A rostered worker cannot usher from Cairo, whatever the request claims.
  assert.equal(normalizeAttendanceMode("workforce", true), "in_person");
  assert.equal(normalizeAttendanceMode("workforce", false), "in_person");
});
