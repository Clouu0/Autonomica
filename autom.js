import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials

} from "discord.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

const welcomeChannelId = "1450632412961964142";
const rolesChannelId = "1450622231851044998";
// optional
const autoRoleId = null;

//NEW DATABASE SHIT



// END NEW DATABASE

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(process.cwd(), "levelingConfig.json");
const dataPath = path.join(__dirname, "userLevels.json");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.MessageContent]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  const cmd = command.default ?? command;

  client.commands.set(cmd.data.name, cmd);
}


client.once("clientReady", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

const jsonPath = path.join(__dirname, "reactionRoles.json");

function loadData() {
  return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
}
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const data = loadData();
  const pairs = data[reaction.message.id];
  if (!pairs) return;

  const pair = pairs.find(p => p.emoji === reaction.emoji.name);
  if (!pair) return;

  const role = reaction.message.guild.roles.cache.get(pair.roleId);
  if (!role) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(role);
});
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const data = loadData();
  const pairs = data[reaction.message.id];
  if (!pairs) return;

  const pair = pairs.find(p => p.emoji === reaction.emoji.name);
  if (!pair) return;

  const role = reaction.message.guild.roles.cache.get(pair.roleId);
  if (!role) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(role);
});

//const XP_PER_MESSAGE = 10;
const XP_COOLDOWN = 60 * 1000; 
const XP_COOLDOWN_VET = 300 * 1000;
const levelUpChannelId = "1450632412961964142"; 

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}
//DB

import { db } from "./data/db.js";

const getUser = db.prepare(`
  SELECT * FROM levels WHERE user_id = ?
`);

const insertUser = db.prepare(`
  INSERT INTO levels (user_id, xp, level, last_message)
  VALUES (?, 0, 1, 0)
`);

const updateUser = db.prepare(`
  UPDATE levels
  SET xp = ?, level = ?, last_message = ?
  WHERE user_id = ?
`);

//DB
import { levelRoles } from "./data/levelRoles.js";
import { updateLevelRoles } from "./utils/roles.js";

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();

  let user = getUser.get(userId);

  // Initialize user once
  if (!user) {
    insertUser.run(userId);
    user = getUser.get(userId);
  }

  // Respect manual override
  if (user.manual) return;

  // Cooldown
  const cooldown = XP_COOLDOWN;
  if (now - user.last_message < cooldown) return;

  // Add XP
  const xpGain = getRandomIntInclusive(15, 40);
  let xp = user.xp + xpGain;
  let level = user.level;
  let leveledUp = false;

  const neededXP = (level + 1) * 100;
  if (xp >= neededXP) {
    level++;
    xp = 0;
    leveledUp = true;
  }

  updateUser.run(xp, level, now, userId);

  if (leveledUp) {
    const channel = message.guild.channels.cache.get(levelUpChannelId);
    if (channel) {
      await channel.send(
        `🎉 Congratulations <@${userId}>! You reached level **${level}**!`
      );
    }

    await updateLevelRoles(message.member, level, levelRoles);
  }
});


import handleButton from "./interactions/buttonHandler.js";

client.on("interactionCreate", async interaction => {
  try {
    // BUTTONS
    if (interaction.isButton()) {
      return handleButton(interaction);
    }

    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    }
  } catch (err) {
    console.error("Interaction error:", err);
  }
});


client.on("guildMemberAdd", async member => {
  try {
    if (!member?.guild || !member.user) return;

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const perms = channel.permissionsFor(member.guild.members.me);
    if (!perms?.has(PermissionsBitField.Flags.SendMessages)) return;

    const rolesChannel = member.guild.channels.cache.get(rolesChannelId);
    const rolesMention = rolesChannel ? `<#${rolesChannel.id}>` : "#roles";

    const embed = new EmbedBuilder()
      .setTitle("Welcome!")
      .setDescription(
        `Welcome to **${member.guild.name}**, ${member}!\n\n` +
        `• Please read the rules\n` +
        `• Get roles from ${rolesMention}\n` +
        `• Enjoy your stay!`
      )
      .setColor(0x2b2d31)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    if (autoRoleId) {
      const role = member.guild.roles.cache.get(autoRoleId);
      if (role) await member.roles.add(role).catch(() => {});
    }

  } catch (err) {
    console.error("Welcome system error:", err);
  }
});









client.login(token);


