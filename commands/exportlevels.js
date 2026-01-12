import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

const LEVELS_DB_PATH = path.resolve('./botguts/levels.db'); // adjust if needed
const EXPORT_CHANNEL_ID = '1450248040014413898'; // <-- replace with your channel ID

export default {
  data: new SlashCommandBuilder()
    .setName('exportlevels')
    .setDescription('Export the levels database and upload it to the designated channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // optional

  async execute(interaction) {
    try {
      // Check file exists
      if (!fs.existsSync(LEVELS_DB_PATH)) {
        return interaction.reply({
          content: '`levels.db` was not found on the server.',
          ephemeral: true,
        });
      }

      const channel = await interaction.client.channels.fetch(EXPORT_CHANNEL_ID);
      if (!channel) {
        return interaction.reply({
          content: 'Export channel not found.',
          ephemeral: true,
        });
      }

      await channel.send({
        content: `**Levels database export**\nRequested by ${interaction.user}`,
        files: [
          {
            attachment: LEVELS_DB_PATH,
            name: 'levels.db',
          },
        ],
      });

      await interaction.reply({
        content: 'Levels database exported successfully.',
        ephemeral: true,
      });
    } catch (err) {
      console.error('ExportLevels error:', err);
      await interaction.reply({
        content: 'An error occurred while exporting the levels database.',
        ephemeral: true,
      });
    }
  },
};
