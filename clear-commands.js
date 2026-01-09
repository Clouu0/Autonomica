import "dotenv/config";
import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const data = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );

    for (const cmd of data) {
      await rest.delete(
        `${Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)}/${cmd.id}`
      );
      console.log(`Deleted command ${cmd.name}`);
    }
  } catch (error) {
    console.error(error);
  }
})();