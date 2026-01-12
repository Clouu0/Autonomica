import { exec } from 'node:child_process';
import { SlashCommandBuilder } from 'discord.js';

const OWNER_ID = '1174905485829345353';
const PM2_NAME = 'autom.js';

export default {
  data: new SlashCommandBuilder()
    .setName('terminate')
    .setDescription('Stops the PM2 process'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: 'Unauthorized'});
    }

    await interaction.reply({
      content: 'PM2 process stopping.'
    });

    exec(`pm2 stop ${PM2_NAME}`, (err) => {
      if (err) console.error(err);
    });
  }
};

