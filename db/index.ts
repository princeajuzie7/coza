import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { createMockDb } from "./mock";
import * as schema from "./schema";

config({ path: ".env" });

const url = process.env.DATABASE_URL;

const realDb = () => drizzle({ client: postgres(url!), schema });

/**
 * The mock satisfies only the calls this app makes (one insert). The cast is
 * deliberate: widening it to the full drizzle surface would mean writing a fake
 * query builder, which is exactly the work the mock exists to avoid.
 */
export const db = url ? realDb() : (createMockDb() as unknown as ReturnType<typeof realDb>);

export * from "./schema";
