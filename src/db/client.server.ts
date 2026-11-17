import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import type { Database } from "sql.js";
import initSqlJs from "sql.js/dist/sql-wasm-inline.js";
import * as schema from "./schema";
import { seedDatabase } from "./seed/seed.server";

export const RESET_INTERVAL_MS = 2 * 60 * 60 * 1000;

type AppDatabase = SQLJsDatabase<typeof schema>;

interface DatabaseState {
  sqlite: Database;
  db: AppDatabase;
  epoch: number;
  seededAt: number;
}

const SQL = await initSqlJs();

const globalForDb = globalThis as unknown as { __cupcakeDb?: DatabaseState };

const currentEpoch = (now = Date.now()) => Math.floor(now / RESET_INTERVAL_MS);

const createDatabase = (): DatabaseState => {
  const now = Date.now();
  const sqlite = new SQL.Database();
  sqlite.run("PRAGMA foreign_keys = ON;");
  sqlite.exec(schema.SCHEMA_SQL);
  const db = drizzle(sqlite, { schema });
  seedDatabase(db, now);
  return { sqlite, db, epoch: currentEpoch(now), seededAt: now };
};

const getState = (): DatabaseState => {
  const state = globalForDb.__cupcakeDb;
  if (state && state.epoch === currentEpoch()) {
    return state;
  }
  state?.sqlite.close();
  const fresh = createDatabase();
  globalForDb.__cupcakeDb = fresh;
  return fresh;
};

export const getDb = (): AppDatabase => getState().db;

export const getDbInfo = () => {
  const state = getState();
  return {
    epoch: state.epoch,
    seededAt: state.seededAt,
    nextResetAt: (state.epoch + 1) * RESET_INTERVAL_MS,
  };
};

const globalForTimer = globalThis as unknown as { __cupcakeResetTimer?: NodeJS.Timeout };
if (!globalForTimer.__cupcakeResetTimer) {
  globalForTimer.__cupcakeResetTimer = setInterval(() => getState(), 60 * 1000);
  globalForTimer.__cupcakeResetTimer.unref();
}
