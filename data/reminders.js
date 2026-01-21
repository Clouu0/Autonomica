import { dbr } from ".data/reminderdb.js";

export const insertReminder = dbr.prepare(`
  INSERT INTO reminders (user_id, channel_id, remind_at, message)
  VALUES (?, ?, ?, ?)
`);

export const getDueReminders = dbr.prepare(`
  SELECT * FROM reminders
  WHERE remind_at <= ?
  ORDER BY remind_at ASC
`);

export const deleteReminder = dbr.prepare(`
  DELETE FROM reminders WHERE id = ?
`);