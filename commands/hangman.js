import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

import fs from 'fs';
import path from 'path';

const EASY_WORD_FILE = path.join(process.cwd(), 'assets', 'easy.txt');
const HARD_WORD_FILE = path.join(process.cwd(), 'assets', 'extremefile.txt');

const HARD_WORDS = fs
  .readFileSync(HARD_WORD_FILE, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(Boolean);

const EASY_WORDS = fs
  .readFileSync(EASY_WORD_FILE, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(Boolean);  

const MAX_LIVES = 6;

function maskWord(word, guesses) {
  return word
    .split('')
    .map(c => (guesses.has(c) ? c : '_'))
    .join(' ');
}

function createLetterButtons(guessed) {
  const rows = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  for (let i = 0; i < letters.length; i += 5) {
    const row = new ActionRowBuilder();

    letters.slice(i, i + 5).forEach(letter => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hangman_${letter}`)
          .setLabel(letter.toUpperCase())
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(guessed.has(letter))
      );
    });

    rows.push(row);
  }

  return rows;
}

export default {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Start a hangman game')
    .addBooleanOption(option =>
      option
        .setName('hardmode')
        .setDescription('Play with hard words')
        .setRequired(false)
    ),
    permissionLevel: 'Everyone',

  async execute(interaction) {
    const hardMode = interaction.options.getBoolean('hardmode') || false;
    const WORDS = hardMode ? HARD_WORDS : EASY_WORDS;
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const guessed = new Set();
    let lives = MAX_LIVES;

    const content = () =>
      `**Hangman**\n\n` +
      `Word: **${maskWord(word, guessed)}**\n` +
      `Lives: ${lives}`;

    await interaction.reply({
      content: content(),
      components: createLetterButtons(guessed)
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      time: 5 * 60 * 1000
    });

    collector.on('collect', async btn => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({
          content: 'This is not your game!',
          ephemeral: true
        });
      }

      const letter = btn.customId.replace('hangman_', '');

      if (!word.includes(letter)) {
        lives--;
      }

      guessed.add(letter);

      const won = word.split('').every(c => guessed.has(c));
      const lost = lives <= 0;

      if (won || lost) {
        collector.stop();

        return btn.update({
          content: won
            ? `**You won!**\nThe word was **${word}**`
            : `**You lost!**\nThe word was **${word}**`,
          components: []
        });
      }

      await btn.update({
        content: content(),
        components: createLetterButtons(guessed)
      });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.editReply({
          content: `Game expired!\nThe word was **${word}**`,
          components: []
        });
      }
    });
  }
};
