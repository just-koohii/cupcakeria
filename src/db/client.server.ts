import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { seedDatabase } from "./seed/seed.server";

export const RESET_INTERVAL_MS = 2 * 60 * 60 * 1000;

type AppDatabase = BetterSQLite3Database<typeof schema>;

interface DatabaseState {
  sqlite: Database.Database;
  db: AppDatabase;
  epoch: number;
  seededAt: number;
}

const globalForDb = globalThis as unknown as { __cupcakeDb?: DatabaseState };

const currentEpoch = (now = Date.now()) => Math.floor(now / RESET_INTERVAL_MS);

const createDatabase = (): DatabaseState => {
  const now = Date.now();
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
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
