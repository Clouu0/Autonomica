import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { userLevels } from "../data/levels.js";
import { levelRoles } from "../data/levelRoles.js";
import { updateLevelRoles } from "../utils/roles.js";

export default {
  data: new SlashCommandBuilder()
    .setName("syncroles")
    .setDescription("Sync level roles for all members")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    // Acknowledge immediately (important for long tasks)
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    // Fetch all members
    const members = await guild.members.fetch();

    let synced = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;

      const data = userLevels[member.id];
      if (!data) continue;

      await updateLevelRoles(member, data.level, levelRoles);
      synced++;
    }

    await interaction.editReply(
      `✅ Synced level roles for **${synced}** members.`
    );
  }
};
