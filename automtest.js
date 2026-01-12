import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("READY");
});

client.on("messageCreate", () => {
  console.log("EVENT FIRED");
});

client.login(token);
