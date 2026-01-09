const PREFIX = ".";

client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  const target =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);

  await command.execute({
    client,
    guild: message.guild,
    member: message.member,
    args: [target, ...args.slice(1)],
    reply: msg => message.reply(msg)
  });
});