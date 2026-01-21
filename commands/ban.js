import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

async function banMember(guild, user, reason) {
  const member = await guild.members.fetch(user.id);
  await member.ban({ reason });
}

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to ban")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for ban")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  permissionLevel: "Administrator",

  // SLASH COMMAND
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    await banMember(interaction.guild, user, reason);

    await interaction.reply(
      `🔨 ${user.tag} banned.\nReason: ${reason}`
    );
  },

  // PREFIX COMMAND
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("You do not have permission to use this command.");
    }
    const user =
      message.mentions.users.first() ||
      (await message.client.users.fetch(args[0]).catch(() => null));
    if (!user) {
      return message.reply("You must mention a user or provide a user ID.");
    }
    const reason = args.slice(1).join(" ") || "No reason provided";

    await banMember(message.guild, user, reason);

    message.channel.send(
      `🔨 ${user.tag} banned.\nReason: ${reason}`
    );
  }
};
