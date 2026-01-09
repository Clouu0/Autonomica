import fs from "fs";
import path from "path";
import { db } from "../data/db.js";

const jsonPath = path.join(process.cwd(), "userLevels.json");

if (!fs.existsSync(jsonPath)) {
  console.log("❌ userLevels.json not found");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const insert = db.prepare(`
  INSERT OR REPLACE INTO levels (user_id, xp, level, last_message)
  VALUES (?, ?, ?, ?)
`);

let count = 0;

for (const [userId, user] of Object.entries(data)) {
  insert.run(
    userId,
    user.xp ?? 0,
    user.level ?? 1,
    user.lastMessage ?? 0
  );
  count++;
}

console.log(`✅ Migrated ${count} users into SQLite`);

