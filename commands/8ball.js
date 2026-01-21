import { SlashCommandBuilder } from 'discord.js';

const responses = [
  // Positive
  'Erm... yes',
  'Why even ask, its utterly certain',
  'Highly likely to be true',
  'Bro I made all these dumb 8ball responses, also its a yes',
  'Hi, I am 8ball, and I say yes',
  'Prolly yes, now go away im playing minecraft',
  'Hmmmmmmmmmmmmmmm... yeah sure',
  'Yes.',
  'Signs point to yes, not that sign over there though, that one',

// Neutral
  'Hi, you have reached 8ball, I am currently unavailable at this time, please call again.',
  'Can you let me sleep please',
  'Shhh.. the mangoes are sleeping',
  'Bruh, idk',
  'Go ahead and ask that one again chief',
  'Top 10 most unanswerable questions',
  'Erm... maybe',

  // Negative
  'Erm... no',
  'Hi I am 8ball, and I say no',
  'I ran out of ideas of stuff to put for no, so no',
  '*bam* hit with a whole lotta nope',
  'Did you seriously think this was a yes, absolutely not',
  'I bet you did a lot of typing for that question, so no',
  'No.'
];

export default {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),
    permissionLevel: 'Everyone',
    alias: ['8'],
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = responses[Math.floor(Math.random() * responses.length)];

    await interaction.reply({
      content: `**Question:** ${question}\n**Answer:** ${answer}`
    });
  },
  async prefixExecute(message, args) {
  const question = args.join(' ');
  const answer = responses[Math.floor(Math.random() * responses.length)];
  await message.reply({
    content: `**Question:** ${question}\n**Answer:** ${answer}`
  });
  }
};
