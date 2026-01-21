import { SlashCommandBuilder } from "discord.js";
import { insertReminder } from "../db/reminders.js";
import { dbr } from "../db/reminderdb.js";
import { toUtcTimestamp } from "../utils/time.js";

export const data = new SlashCommandBuilder()
  .setName("remind")
  .setDescription("Set a reminder")
  .addStringOption(option =>
    option
      .setName("date")
      .setDescription("Date (YYYY-MM-DD)")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("time")
      .setDescription("Time (HH:MM, 24h)")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("What to remind you about")
      .setRequired(true)
  );

const getTimezone = dbr.prepare(`
  SELECT timezone FROM user_settings WHERE user_id = ?
`);

export async function execute(interaction) {
  const date = interaction.options.getString("date");
  const time = interaction.options.getString("time");
  const message = interaction.options.getString("message");

  const row = getTimezone.get(interaction.user.id);

  if (!row) {
    return interaction.reply({
      content: " Please set your timezone first using `/timezone`",
      ephemeral: true
    });
  }

  const timestamp = toUtcTimestamp(date, time, row.timezone);

  if (!timestamp || timestamp <= Date.now()) {
    return interaction.reply({
      content: " Invalid or past date/time.",
      ephemeral: true
    });
  }

  insertReminder.run(
    interaction.user.id,
    interaction.channel.id,
    timestamp,
    message
  );

  await interaction.reply({
    content: `⏰ Reminder set for <t:${Math.floor(timestamp / 1000)}:F>`,
  });
}
