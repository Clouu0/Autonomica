import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

/**
 * Shared kick logic
 */
async function kickMember(member, reason) {
  await member.kick(reason);
}

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
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers | PermissionFlagsBits.Administrator
    ),

  permissionLevel: "Moderator",

  /* SLASH COMMAND */
  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided";

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      return interaction.editReply("❌ That user is not in this server.");
    }

    if (member.id === interaction.user.id) {
      return interaction.editReply("❌ You cannot kick yourself.");
    }

    if (member.id === interaction.client.user.id) {
      return interaction.editReply("❌ I can’t kick myself.");
    }

    if (!member.kickable) {
      return interaction.editReply(
        "❌ I can’t kick this user (role hierarchy or permissions issue)."
      );
    }

    try {
      await kickMember(member, reason);
      await interaction.editReply(
        `🔨 **${user.tag}** was kicked.\nReason: ${reason}`
      );
    } catch (err) {
      console.error("Kick error:", err);
      await interaction.editReply("❌ Failed to kick the user.");
    }
  },

  /* PREFIX COMMAND */
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("❌ You do not have permission to use this command.");
    }

    const target =
      message.mentions.members.first() ||
      (args[0]
        ? await message.guild.members.fetch(args[0]).catch(() => null)
        : null);

    if (!target) {
      return message.reply("❌ You must mention a user or provide a user ID.");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot kick yourself.");
    }

    if (target.id === message.client.user.id) {
      return message.reply("❌ I can’t kick myself.");
    }

    if (!target.kickable) {
      return message.reply(
        "❌ I can’t kick this user (role hierarchy or permissions issue)."
      );
    }

    try {
      await kickMember(target, reason);
      await message.channel.send(
        `🔨 **${target.user.tag}** was kicked.\nReason: ${reason}`
      );
    } catch (err) {
      console.error("Kick error:", err);
      await message.reply("❌ Failed to kick the user.");
    }
  }
};



