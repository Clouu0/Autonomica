import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

import { db } from "../data/db.js";
import { levelRoles } from "../data/levelRoles.js";
import { updateLevelRoles } from "../utils/roles.js";

/* Prepared statements (fast & safe) */
const getUser = db.prepare(
  "SELECT * FROM levels WHERE user_id = ?"
);

const insertUser = db.prepare(
  "INSERT INTO levels (user_id, xp, level, last_message, manual) VALUES (?, 0, 1, 0, 0)"
);

const setLevel = db.prepare(
  `
  UPDATE levels
  SET level = ?, xp = 0, manual = 0
  WHERE user_id = ?
  `
);

export default {
  data: new SlashCommandBuilder()
    .setName("setlevel")
    .setDescription("Set a user’s level")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("The user to set the level for")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("level")
        .setDescription("The level to set")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser("user");
    const level = interaction.options.getInteger("level");

    const member = await interaction.guild.members.fetch(user.id);

    // Ensure user exists
    let row = getUser.get(user.id);
    if (!row) {
      insertUser.run(user.id);
    }

    // Apply level (XP reset, manual override cleared)
    setLevel.run(level, user.id);

    // Sync roles
    await updateLevelRoles(member, level, levelRoles);

    await interaction.editReply(
      `✅ ${user} is now level **${level}**`
    );
  }
};





