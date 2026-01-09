import { SlashCommandBuilder } from "discord.js";
import { db } from "../data/db.js";

/* Prepared statement */
const getUser = db.prepare(
  "SELECT level, xp FROM levels WHERE user_id = ?"
);

export default {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Check your level and XP")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Check another user's level")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const userId = target.id;

    const row = getUser.get(userId);

    if (!row) {
      return interaction.reply({
        content: `${target} has no level data yet.`,
        ephemeral: true
      });
    }

    const { level, xp } = row;
    const xpNeeded = (level + 1) * 100;

    await interaction.reply({
      content: `📊 **${target.username}** is level **${level}** with **${xp} / ${xpNeeded} XP**.`
    });
  }
};

