import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

async function timeoutMember(guild, user, minutes, reason) {
  const member = await guild.members.fetch(user.id);
  await member.timeout(minutes * 60 * 1000, reason);
}

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to timeout")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("Timeout duration in minutes")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for timeout")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  permissionLevel: "Moderator",

  // SLASH COMMAND
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") || "No reason provided";

    await timeoutMember(interaction.guild, user, minutes, reason);

    await interaction.reply(
      `⏳ **${user.tag}** timed out for ${minutes} minute(s).\n**Reason:** ${reason}`
    );
  },

  // PREFIX COMMAND
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("You do not have permission to use this command.");
    }

    const user =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null));

    if (!user) {
      return message.reply("You must mention a user or provide a user ID.");
    }

    const minutes = parseInt(args[1]);
    if (!minutes || minutes <= 0) {
      return message.reply("You must specify a valid timeout duration in minutes.");
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    await timeoutMember(message.guild, user, minutes, reason);

    message.channel.send(
      `⏳ **${user.tag}** timed out for ${minutes} minute(s).\n**Reason:** ${reason}`
    );
  }
};
