import { SlashCommandBuilder } from "discord.js";
import { db } from "../data/db.js";

/* Prepared statement */
const getUser = db.prepare(
  "SELECT level, xp FROM levels WHERE user_id = ?"
);

/**
 * Shared data fetcher
 */
function getLevelData(userId) {
  const row = getUser.get(userId);
  if (!row) return null;

  const { level, xp } = row;
  const xpNeeded = (level + 1) * 100;

  return { level, xp, xpNeeded };
}

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

  permissionLevel: "Everyone",

  /* SLASH COMMAND */
  async execute(interaction) {
    const target =
      interaction.options.getUser("user") || interaction.user;

    const data = getLevelData(target.id);

    if (!data) {
      return interaction.reply({
        content: `❌ **${target.username}** has no level data yet.`,
        ephemeral: true
      });
    }

    const { level, xp, xpNeeded } = data;

    await interaction.reply(
      `📊 **${target.username}** is level **${level}** with **${xp} / ${xpNeeded} XP**.`
    );
  },

  /* PREFIX COMMAND */
  async prefixExecute(message, args) {
    let target = message.author;

    if (args[0]) {
      target = await message.client.users
        .fetch(args[0].replace(/[<@!>]/g, ""))
        .catch(() => null);

      if (!target) {
        return message.reply("❌ Invalid user.");
      }
    }

    const data = getLevelData(target.id);

    if (!data) {
      return message.channel.send(
        `❌ **${target.username}** has no level data yet.`
      );
    }

    const { level, xp, xpNeeded } = data;

    await message.channel.send(
      `📊 **${target.username}** is level **${level}** with **${xp} / ${xpNeeded} XP**.`
    );
  }
};


