export default async function handleButton(interaction) {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("role_")) return;

  const roleId = interaction.customId.replace("role_", "");
  const role = interaction.guild.roles.cache.get(roleId);
  const member = interaction.member;

  if (!role) {
    return interaction.reply({
      content: "❌ Role not found.",
      flags: 64
    });
  }

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    return interaction.reply({
      content: `❌ Removed **${role.name}**`,
      flags: 64
    });
  } else {
    await member.roles.add(roleId);
    return interaction.reply({
      content: `✅ Added **${role.name}**`,
      flags: 64
    });
  }
}
