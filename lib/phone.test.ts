import assert from "node:assert/strict";
import { test } from "node:test";

import { formatPhoneForDisplay, isPlausiblePhone, normalizePhone, phoneNumberToString } from "./phone.ts";

test("every spelling of one Nigerian number normalizes to the same E.164 key", () => {
  const expected = "+2348031234567";
  for (const typed of [
    "08031234567",
    "+2348031234567",
    "234 803 123 4567",
    "0803 123 4567",
    "+234-803-123-4567",
    "8031234567", // typed without the leading zero
  ]) {
    assert.equal(normalizePhone(typed), expected, `failed on ${typed}`);
  }
});

test("other Nigerian carrier prefixes normalize too", () => {
  assert.equal(normalizePhone("09012345678"), "+2349012345678");
  assert.equal(normalizePhone("07012345678"), "+2347012345678");
});

test("a visitor's foreign number is kept, not forced onto Nigeria", () => {
  assert.equal(normalizePhone("+44 7911 123456"), "+447911123456");
  assert.equal(normalizePhone("+1 415 555 2671"), "+14155552671");
});

test("plausible numbers pass, typos do not", () => {
  assert.ok(isPlausiblePhone("08031234567"));
  assert.ok(isPlausiblePhone("+44 7911 123456"));
  assert.ok(!isPlausiblePhone("0803"));
  assert.ok(!isPlausiblePhone(""));
});

test("a field value renders back to the same key it will be stored under", () => {
  const field = { number: "0803 123 4567", countryCode: "NG" };
  assert.equal(phoneNumberToString(field), "+2348031234567");
  assert.equal(normalizePhone(phoneNumberToString(field)), "+2348031234567");
});

test("the receipt shows a readable number while the key stays E.164", () => {
  const stored = normalizePhone("08085034076");
  assert.equal(stored, "+2348085034076");
  assert.equal(formatPhoneForDisplay(stored), "+234 808 503 4076");
});
