import "dotenv/config";
import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    const data = await rest.get(
      Routes.applicationCommands(process.env.CLIENT_ID) // GLOBAL COMMANDS
    );

    for (const cmd of data) {
      await rest.delete(
        `${Routes.applicationCommands(process.env.CLIENT_ID)}/${cmd.id}`
      );
      console.log(`Deleted global command ${cmd.name}`);
    }
  } catch (error) {
    console.error(error);
  }
})();
