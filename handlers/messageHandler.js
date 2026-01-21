import fs from "fs";
import path from "path";

const PREFIX = ".";

const commands = new Map();
const aliases = new Map();
const commandsPath = path.join(process.cwd(), "commands");

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;

  const command = (await import(`../commands/${file}`)).default;

  if (command.data?.name) {
    commands.set(command.data.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        aliases.set(alias, command);
      }
    }
  }
}

export async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = commands.get(commandName) || aliases.get(commandName);
  
  if (!command || !command.prefixExecute) return;
  try {
    await command.prefixExecute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("There was an error executing this command at prefix execution.");
  }
}
