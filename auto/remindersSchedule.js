import { getDueReminders, deleteReminder } from "../db/reminders.js";

export function startReminderLoop(client) {
  setInterval(async () => {
    const now = Date.now();
    const reminders = getDueReminders.all(now);

    for (const reminder of reminders) {
      try {
        const channel = await client.channels.fetch(reminder.channel_id);
        if (!channel) continue;

        await channel.send({
          content: `<@${reminder.user_id}> ⏰ **Reminder:** ${reminder.message}`
        });

        deleteReminder.run(reminder.id);

      } catch (err) {
        console.error("Reminder send failed:", err);
        // Do NOT delete — retry next loop
      }
    }
  }, 30_000);
}
