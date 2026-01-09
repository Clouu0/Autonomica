client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  await command.execute({
    client,
    guild: interaction.guild,
    member: interaction.member,
    args: [interaction.options.getMember("user")],
    reply: msg => interaction.reply({ content: msg, ephemeral: false })
  });
});