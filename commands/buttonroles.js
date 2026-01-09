import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder
} from "discord.js";


export default {
  data: new SlashCommandBuilder()
    .setName("buttonroles")
    .setDescription("Create a button role message")
    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("Embed title")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("roles")
        .setDescription("Role IDs separated by commas")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    // IMPORTANT: acknowledge immediately
    await interaction.deferReply({ flags: 64 });

    const title = interaction.options.getString("title");
    const description = ("React to the Button to get the role you want!");
    const roleInput = interaction.options.getString("roles");

    const roleIds = roleInput.split(",").map(r => r.trim());
    const separator = new AttachmentBuilder("assets/separator.gif");

    // Build embed
    const embed = new EmbedBuilder()
    .setTitle(`**${title}**`)
    .setDescription(description)
    .setColor(0x2b2d31)
    .setImage("attachment://separator.gif");

    // Build buttons
    const row = new ActionRowBuilder();

    for (const roleId of roleIds) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) continue;

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`role_${role.id}`)
          .setLabel(role.name)
          .setStyle(ButtonStyle.Secondary) // black/gray
      );
    }

    // Send the actual role message
    await interaction.channel.send({
    embeds: [embed],
    components: [row],
    files: [separator]
  });


    // Edit deferred reply (DO NOT reply again)
    await interaction.editReply({
      content: "✅ Button role message created."
    });
  }
};



