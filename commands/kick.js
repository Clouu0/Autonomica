import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to kick")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(false)
    )
    // 🔒 Moderators + Admins
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";

    // Fetch member safely
    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      return interaction.editReply("❌ That user is not in this server.");
    }

    // Prevent kicking yourself
    if (member.id === interaction.user.id) {
      return interaction.editReply("❌ You cannot kick yourself.");
    }

    // Prevent kicking the bot
    if (member.id === interaction.client.user.id) {
      return interaction.editReply("❌ I can’t kick myself.");
    }

    // Permission + hierarchy checks
    if (!member.kickable) {
      return interaction.editReply(
        "❌ I can’t kick this user (role hierarchy or permissions issue)."
      );
    }

    // Execute kick
    try {
      await member.kick(reason);

      await interaction.editReply(
        `✅ **${user.tag}** has been kicked.\n**Reason:** ${reason}`
      );
    } catch (err) {
      console.error("Kick error:", err);
      await interaction.editReply("❌ Failed to kick the user.");
    }
  }
};
