import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { CheckIn } from "./schema";

const STORE_FILE = join(process.cwd(), ".data", "check-ins.json");

type MockStore = { rows: CheckIn[]; warned: boolean };

/**
 * Stand-in for Postgres while DATABASE_URL is unset, so the app can be used end
 * to end — including a deployed preview — before the database exists.
 *
 * Memory is the source of truth and the file is only a development
 * convenience: a serverless filesystem is read-only, so persistence is
 * attempted and allowed to fail rather than being required.
 *
 * Pinned to globalThis so Next's dev server keeps the rows across hot reloads,
 * which would otherwise wipe them on every edit and make the duplicate check
 * look intermittent.
 *
 * ponytail: delete this file the day DATABASE_URL is set — it is scaffolding,
 * not a storage layer.
 */
const globalRef = globalThis as typeof globalThis & { __cozaMockStore?: MockStore };

const store: MockStore = (globalRef.__cozaMockStore ??= { rows: readSeedFile(), warned: false });

function readSeedFile(): CheckIn[] {
  try {
    return existsSync(STORE_FILE) ? (JSON.parse(readFileSync(STORE_FILE, "utf8")) as CheckIn[]) : [];
  } catch {
    // No file, or an unreadable one: start empty rather than refusing to boot.
    return [];
  }
}

/** Best-effort. Read-only filesystems (most hosts) simply skip this. */
function persist() {
  try {
    mkdirSync(dirname(STORE_FILE), { recursive: true });
    writeFileSync(STORE_FILE, JSON.stringify(store.rows, null, 2));
  } catch {
    // Expected in production; memory already holds the write.
  }
}

function warnOnce() {
  if (store.warned) return;
  store.warned = true;

  console.warn(
    process.env.NODE_ENV === "production"
      ? "[db] No DATABASE_URL — running on the in-memory mock. Check-ins are NOT persisted and are lost on restart or scale-out."
      : `[db] No DATABASE_URL — using the mock store at ${STORE_FILE}.`
  );
}

/** Reads the mock store. Exported so admin queries see the same rows. */
export function readMockRows(): CheckIn[] {
  warnOnce();
  return store.rows;
}

export const USING_MOCK = !process.env.DATABASE_URL;

export function createMockDb() {
  warnOnce();

  return {
    insert: () => ({
      values: async (row: CheckIn) => {
        // Mirrors unique(service_date, phone), down to the SQLSTATE the action
        // catches, so the duplicate path is exercised rather than stubbed out.
        if (store.rows.some((r) => r.serviceDate === row.serviceDate && r.phone === row.phone)) {
          throw Object.assign(new Error('duplicate key value violates unique constraint "unique_check_in_per_day"'), {
            code: "23505",
          });
        }

        store.rows.push({ ...row, createdAt: new Date() } as CheckIn);
        persist();
        return [row];
      },
    }),
  };
}
