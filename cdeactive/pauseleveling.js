import fs from "fs";
import path from "path";
import { SlashCommandBuilder } from 'discord.js';

const configPath = path.join(process.cwd(), "levelingConfig.json");

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ paused: false }, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("pauseleveling")
    .setDescription("Pauses or unpauses the leveling system"),
  async execute(interaction) {
    if (!interaction.member.permissions.has("ManageRoles")) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    let config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    config.paused = !config.paused;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const status = config.paused ? "paused" : "resumed";
    await interaction.reply(`✅ Leveling has been **${status}**.`);
  },
};