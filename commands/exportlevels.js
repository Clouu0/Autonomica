import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ===== CONFIG =====
const DEV_USER_ID = '123456789012345678'; // <-- YOUR Discord ID
const EXPORT_CHANNEL_ID = '123456789012345678'; // channel to upload to

// ===== PATH RESOLUTION (PM2-safe) =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust if your structure differs
const LEVELS_DB_PATH = path.join(__dirname, '..', 'levels.db');

export default {
  data: new SlashCommandBuilder()
    .setName('exportlevels')
    .setDescription('Export the levels database (dev only)'),

  async execute(interaction) {
    // 🔒 DEV LOCK
    if (interaction.user.id !== DEV_USER_ID) {
      return interaction.reply({
        content: '❌ You are not authorized to use this command.',
        ephemeral: true,
      });
    }

    try {
      console.log('[exportlevels] CWD:', process.cwd());
      console.log('[exportlevels] DB path:', LEVELS_DB_PATH);

      if (!fs.existsSync(LEVELS_DB_PATH)) {
        return interaction.reply({
          content: `❌ levels.db not found at:\n\`${LEVELS_DB_PATH}\``,
          ephemeral: true,
        });
      }

      const channel = await interaction.client.channels.fetch(EXPORT_CHANNEL_ID);

      await channel.send({
        content: `📤 **Levels DB export**\nRequested by ${interaction.user}`,
        files: [
          {
            attachment: LEVELS_DB_PATH,
            name: 'levels.db',
          },
        ],
      });

      await interaction.reply({
        content: '✅ Levels database exported successfully.',
        ephemeral: true,
      });
    } catch (err) {
      console.error('[exportlevels] Error:', err);
      await interaction.reply({
        content: '❌ Export failed.',
        ephemeral: true,
      });
    }
  },
};
