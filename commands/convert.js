import { SlashCommandBuilder } from 'discord.js';

/* ======================
   BASE UNIT CONVERTERS
   ====================== */

// length → meters
const length = {
  toBase: {
    m: v => v,
    km: v => v * 1000,
    cm: v => v / 100,
    ft: v => v * 0.3048,
    in: v => v * 0.0254,
    mi: v => v * 1609.34
  },
  fromBase: {
    m: v => v,
    km: v => v / 1000,
    cm: v => v * 100,
    ft: v => v / 0.3048,
    in: v => v / 0.0254,
    mi: v => v / 1609.34
  }
};

// weight → kilograms
const weight = {
  toBase: {
    kg: v => v,
    g: v => v / 1000,
    lb: v => v * 0.453592,
    oz: v => v * 0.0283495
  },
  fromBase: {
    kg: v => v,
    g: v => v * 1000,
    lb: v => v / 0.453592,
    oz: v => v / 0.0283495
  }
};

// temperature → kelvin
const temperature = {
  toBase: {
    c: v => v + 273.15,
    f: v => (v - 32) * 5 / 9 + 273.15,
    k: v => v
  },
  fromBase: {
    c: v => v - 273.15,
    f: v => (v - 273.15) * 9 / 5 + 32,
    k: v => v
  }
};

/* ======================
   CONVERSION DISPATCHER
   ====================== */

function convert(value, from, to) {
  if (length.toBase[from] && length.fromBase[to]) {
    return length.fromBase[to](length.toBase[from](value));
  }

  if (weight.toBase[from] && weight.fromBase[to]) {
    return weight.fromBase[to](weight.toBase[from](value));
  }

  if (temperature.toBase[from] && temperature.fromBase[to]) {
    return temperature.fromBase[to](temperature.toBase[from](value));
  }

  return null;
}

/* ======================
   SLASH COMMAND
   ====================== */

export default {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Convert between metric and imperial units')
    .addNumberOption(option =>
      option.setName('value')
        .setDescription('Value to convert')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('from')
        .setDescription('Unit to convert from (e.g. km, lb, f)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Unit to convert to (e.g. mi, kg, k)')
        .setRequired(true)),

  permissionLevel: 'Everyone',

  async execute(interaction) {
    const value = interaction.options.getNumber('value');
    const from = interaction.options.getString('from').toLowerCase();
    const to = interaction.options.getString('to').toLowerCase();

    const result = convert(value, from, to);

    if (result === null) {
      return interaction.reply({
        content: `I can't convert **${from} → ${to}**.`,
        ephemeral: true
      });
    }

    const formatted =
      ['c', 'f', 'k'].includes(from)
        ? `**${value}°${from.toUpperCase()}** = **${result.toFixed(2)}°${to.toUpperCase()}**`
        : `**${value} ${from}** = **${result.toFixed(4)} ${to}**`;

    await interaction.reply(formatted);
  }
};

