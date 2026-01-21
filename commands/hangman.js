import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const EASY_WORD_FILE = path.join(process.cwd(), 'assets', 'easy.txt');
const HARD_WORD_FILE = path.join(process.cwd(), 'assets', 'extremefile.txt');

const EASY_WORDS = fs.readFileSync(EASY_WORD_FILE, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(Boolean);

const HARD_WORDS = fs.readFileSync(HARD_WORD_FILE, 'utf8')
  .split('\n')
  .map(w => w.trim())
  .filter(Boolean);

const MAX_LIVES = 6;

// Channel-based games
export const games = new Map();

function maskWord(word, guessed) {
  return word
    .split('')
    .map(c => (guessed.has(c) ? c : '_'))
    .join(' ');
}

async function hangman(interaction, word) {
    const channelId = interaction.channel.id;

    if (games.has(channelId)) {
      return interaction.reply({
        content: '❗ A hangman game is already running in this channel.',
        ephemeral: true
      });
    }
    games.set(channelId, {
      word,
      guessed: new Set(),
      lives: MAX_LIVES,
      lastGuesser: null
    });

    await interaction.reply(
      `🎯 **Multiplayer Hangman Started!**\n\n` +
      `Word: **${maskWord(word, new Set())}**\n` +
      `Lives: ❤️ ${MAX_LIVES}\n\n` +
      `Guess by typing: **@${interaction.client.user.username} <letter>**`
  );
};

export default {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Start a multiplayer hangman game')
    .addBooleanOption(option =>
      option
        .setName('hardmode')
        .setDescription('Play with hard words')
        .setRequired(false)
    ),
  permissionLevel: 'Everyone',
  Alias: ['hm', 'hang'],
  async execute(interaction) {
    const channelId = interaction.channel.id;
    const hardMode = interaction.options.getBoolean('hardmode') ?? false;
    const WORDS = hardMode ? HARD_WORDS : EASY_WORDS;
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    await hangman(channelId, word);

    await interaction.reply(
      `🎯 **Multiplayer Hangman Started!**\n\n` +
      `Word: **${maskWord(word, new Set())}**\n` +
      `Lives: ❤️ ${MAX_LIVES}\n\n` +
      `Guess by typing: **@${interaction.client.user.username} <letter>**`
    );
  },
};

