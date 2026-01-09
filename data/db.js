import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "levels.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
/* Main levels table */
db.prepare(`
  CREATE TABLE IF NOT EXISTS levels (
    user_id TEXT PRIMARY KEY,
    xp INTEGER NOT NULL,
    level INTEGER NOT NULL,
    last_message INTEGER NOT NULL,
    manual INTEGER DEFAULT 0
  )
`).run();

/* Optional but recommended index for leaderboards */
db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_levels_rank
  ON levels (level DESC, xp DESC)
`).run();

