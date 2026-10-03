import { z } from "zod";

import { isPlausiblePhone, phoneNumberSchema, phoneNumberToString } from "@/lib/phone";

/**
 * What the person actually types. Group is not in here — it comes from the
 * route (/members or /workers), and neither is punctuality: the server reads
 * that off the clock at insert time (requirement #4).
 */
export const checkInFieldsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter the full name")
    .refine((v) => v.includes(" "), "First and last name, please"),

  // Errors are pinned to `number` so every phone problem surfaces in one place.
  phone: phoneNumberSchema.refine((v) => isPlausiblePhone(phoneNumberToString(v)), {
    message: "That doesn't look like a complete number",
    path: ["number"],
  }),

  // Optional by design: PR workers check in older members who have no email (#5).
  email: z.union([z.literal(""), z.email("Check the email address")]),

  standing: z.enum(["old_member", "new_member", "visitor"], { message: "Pick one" }),

  /** Not required when attending online — nobody boards a bus to watch from Cairo. */
  busTerminal: z.string(),

  /** Workforce only. Members submit "" and the server drops it. */
  unit: z.string(),

  /** Members only. Workforce are rostered in a building, so the server forces false. */
  online: z.boolean(),
});

const requiresTerminal = (values: { online: boolean; busTerminal: string }) =>
  values.online || values.busTerminal.trim() !== "";

const TERMINAL_REQUIRED = { message: "Pick a terminal, or 'I came on my own'", path: ["busTerminal"] };

const requiresUnit = (values: { group?: string; unit: string }) =>
  values.group !== "workforce" || values.unit.trim() !== "";

const UNIT_REQUIRED = { message: "Pick the unit you serve in", path: ["unit"] };

/** The workforce door validates the unit; the member door has no such field. */
export function fieldsSchemaFor(group: "member" | "workforce") {
  const base = checkInFieldsSchema.refine(requiresTerminal, TERMINAL_REQUIRED);
  return group === "workforce" ? base.refine((v) => requiresUnit({ ...v, group }), UNIT_REQUIRED) : base;
}

/** What the server insists on, group included. */
export const checkInSchema = checkInFieldsSchema
  .extend({ group: z.enum(["member", "workforce"]) })
  .refine(requiresUnit, UNIT_REQUIRED)
  .refine(requiresTerminal, TERMINAL_REQUIRED);

export type CheckInFields = z.infer<typeof checkInFieldsSchema>;
export type CheckInValues = z.infer<typeof checkInSchema>;
