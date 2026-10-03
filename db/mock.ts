import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { CheckIn } from "./schema";

const STORE = join(process.cwd(), ".data", "check-ins.json");

/**
 * Stand-in for Postgres while DATABASE_URL is unset, so the form can be used
 * end to end before the database exists.
 *
 * File-backed rather than in-memory: Next's dev server re-evaluates modules on
 * every edit, which would wipe an array and make the duplicate check look
 * flaky. It also leaves something readable to inspect before the dashboard is built.
 *
 * ponytail: delete this file the day DATABASE_URL is set — it is scaffolding,
 * not a fallback worth maintaining.
 */
export const USING_MOCK = !process.env.DATABASE_URL;

/** Reads the mock store. Exported so admin queries can see the same rows. */
export function readMockRows(): CheckIn[] {
  assertNotProduction();
  return read();
}

function read(): CheckIn[] {
  try {
    return existsSync(STORE) ? (JSON.parse(readFileSync(STORE, "utf8")) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

function write(rows: CheckIn[]) {
  mkdirSync(dirname(STORE), { recursive: true });
  writeFileSync(STORE, JSON.stringify(rows, null, 2));
}

/**
 * Silently reading or writing attendance from a temp file on a deployed server
 * would lose real data, so the mock refuses to run there.
 *
 * Checked per call, not at module load: `next build` runs with
 * NODE_ENV=production, and merely importing this during a build is harmless —
 * it is serving a request from it that is not.
 */
function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production — the mock store is for local development only.");
  }
}

export function createMockDb() {
  console.warn(`[db] No DATABASE_URL — using the mock store at ${STORE}. Nothing is persisted to Postgres.`);

  return {
    insert: () => ({
      values: async (row: CheckIn) => {
        assertNotProduction();
        const rows = read();

        // Mirrors unique(service_date, phone), down to the SQLSTATE the action
        // catches, so the duplicate path is exercised rather than stubbed out.
        if (rows.some((r) => r.serviceDate === row.serviceDate && r.phone === row.phone)) {
          throw Object.assign(new Error('duplicate key value violates unique constraint "unique_check_in_per_day"'), {
            code: "23505",
          });
        }

        rows.push({ ...row, createdAt: new Date() } as CheckIn);
        write(rows);
        return [row];
      },
    }),
  };
}
