import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

const jsonPath = path.join(process.cwd(), "reactionRoles.json");

function loadData() {
  return fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf8"))
    : {};
}

function saveData(data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("reactionroles")
    .setDescription("Create reaction roles")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a reaction role")
        .addStringOption(o =>
          o.setName("emoji")
            .setDescription("Emoji to react with")
            .setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("role")
            .setDescription("Role to assign")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("message")
            .setDescription("Message text")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const emoji = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");
    const text = interaction.options.getString("message");

    const msg = await interaction.channel.send(
      `${text}\n\nReact to get the role!`
    );

    await msg.react(emoji);

    const data = loadData();
    data[msg.id] = [{ emoji, roleId: role.id }];
    saveData(data);

    await interaction.reply({ content: "✅ Reaction role created!", ephemeral: true });
  }
};



