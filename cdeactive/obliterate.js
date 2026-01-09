import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import { userLevels, saveLevels } from "../data/levels.js";

export default {
  data: new SlashCommandBuilder()
    .setName("obliterate")
    .setDescription("Obliterates levels")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser("user");

    // Initialize user if missing
    if (!userLevels[target.id]) {
      userLevels[target.id] = {
        level: -100000,
        xp: 0,
        lastMessage: 0
      };
    }

    // Reset values
    userLevels[target.id].level = 0;
    userLevels[target.id].xp = 0;
    userLevels[target.id].lastMessage = 0;

    // Optional: prevent XP until manually cleared
    userLevels[target.id].manual = true;

    saveLevels();

    await interaction.editReply(
      `✅ **${target.tag}** has been **reset**.`
    );
  }
};

