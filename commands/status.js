import { SlashCommandBuilder } from 'discord.js';

async function getBotStatus(interaction) {
  await interaction.reply({
    content: 'Bot currently running on testbed. That means don’t complain about your levels being behind because they aren’t.',
    ephemeral: false, 
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the bot status'),

  async execute(interaction) {
    await getBotStatus(interaction);
  },
};
