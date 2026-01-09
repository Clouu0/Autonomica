import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('What the bot should say')
        .setRequired(true)
    )
    // Optional: restrict who can use it
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    await interaction.channel.send(message);
    await interaction.reply({ content: 'Sent!', ephemeral: true });
  }
};
