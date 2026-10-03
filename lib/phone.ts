import { type CountryCode, parsePhoneNumberWithError } from "libphonenumber-js";
import { z } from "zod";

/** COZA is Abuja-based, so the dialer opens on Nigeria rather than the US. */
export const DEFAULT_COUNTRY: CountryCode = "NG";

// No .default() on countryCode: a default splits zod's input and output types,
// which useForm cannot express with one type parameter. The field always sets it.
export const phoneNumberSchema = z.object({
  number: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1),
});

export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

/** The dialled string a field holds, as one value. */
export const phoneNumberToString = (phone: PhoneNumber): string => {
  try {
    const parsed = parsePhoneNumberWithError(phone.number, phone.countryCode as CountryCode);
    if (parsed.isPossible()) return parsed.number;
  } catch {}
  return phone.number;
};

export const phoneNumberFromString = (raw: string): PhoneNumber => {
  if (!raw?.trim()) return { number: "", countryCode: DEFAULT_COUNTRY };

  try {
    const parsed = parsePhoneNumberWithError(raw, DEFAULT_COUNTRY);
    if (parsed.country) return { number: parsed.formatNational(), countryCode: parsed.country };
  } catch {}

  return { number: raw.replace(/\D/g, ""), countryCode: DEFAULT_COUNTRY };
};

/**
 * Canonical E.164, so one person is one key however they typed it —
 * 08031234567, +2348031234567 and 803 123 4567 all collapse to +2348031234567.
 * The unique index on (service_date, phone) rests on this.
 */
export function normalizePhone(input: string, country: CountryCode = DEFAULT_COUNTRY): string {
  try {
    const parsed = parsePhoneNumberWithError(input, country);
    if (parsed.isPossible()) return parsed.number;
  } catch {}
  return input.replace(/\D/g, "");
}

/**
 * isPossible, not isValid: length-checked rather than range-checked. A visitor's
 * foreign number or a carrier range newer than the library must not be turned
 * away at the door — this catches typos, not nationality.
 */
export function isPlausiblePhone(input: string, country: CountryCode = DEFAULT_COUNTRY): boolean {
  try {
    return parsePhoneNumberWithError(input, country).isPossible();
  } catch {
    return false;
  }
}

/**
 * "+234 808 503 4076" for reading aloud or dialling. Display only — the stored
 * value stays E.164, because that is what the identity key is built on.
 */
export function formatPhoneForDisplay(e164: string): string {
  try {
    return parsePhoneNumberWithError(e164).formatInternational();
  } catch {
    return e164;
  }
}
