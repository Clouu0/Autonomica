import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import { db } from "../data/db.js";

const PAGE_SIZE = 10;

/* Prepared statements */
const countUsers = db.prepare(
  "SELECT COUNT(*) AS count FROM levels"
);

const getPage = db.prepare(`
  SELECT user_id, level, xp
  FROM levels
  ORDER BY level DESC, xp DESC
  LIMIT ? OFFSET ?
`);

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the chat XP leaderboard"),

  async execute(interaction) {
    await interaction.deferReply();

    const total = countUsers.get().count;

    if (!total) {
      return interaction.editReply("❌ Leaderboard is empty.");
    }

    let page = 0;
    const maxPage = Math.ceil(total / PAGE_SIZE) - 1;

    const buildEmbed = () => {
      const offset = page * PAGE_SIZE;
      const rows = getPage.all(PAGE_SIZE, offset);

      const description = rows
        .map((u, i) => {
          const rank = offset + i + 1;
          return `**${rank}.** <@${u.user_id}> — Level **${u.level}** (${u.xp} XP)`;
        })
        .join("\n");

      return new EmbedBuilder()
        .setTitle("Chat XP Leaderboard")
        .setDescription(description)
        .setColor(0x2b2d31)
        .setFooter({
          text: `Page ${page + 1} of ${maxPage + 1} • Top ${total}`
        });
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("lb_prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("lb_next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === maxPage)
      );

    const message = await interaction.editReply({
      embeds: [buildEmbed()],
      components: [row()]
    });

    const collector = message.createMessageComponentCollector({
      time: 60_000
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ You can't control this leaderboard.",
          ephemeral: true
        });
      }

      if (i.customId === "lb_prev" && page > 0) page--;
      if (i.customId === "lb_next" && page < maxPage) page++;

      await i.update({
        embeds: [buildEmbed()],
        components: [row()]
      });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] });
    });
  }
};
