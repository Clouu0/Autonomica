import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "reminders.db");
export const dbr = new Database(dbPath);

// Schema lives here
dbr.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    remind_at INTEGER NOT NULL,
    message TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reminders_time
  ON reminders(remind_at);
`);

dbr.exec(`
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    timezone TEXT NOT NULL
  );
`);

