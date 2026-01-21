import { SlashCommandBuilder } from "discord.js";
import { evaluate } from "mathjs";

/**
 * Shared evaluator
 */
function evaluateExpression(expr) {
  try {
    const result = evaluate(expr);
    return { result };
  } catch {
    return null;
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("calc")
    .setDescription("Evaluate a math expression")
    .addStringOption(option =>
      option
        .setName("expression")
        .setDescription("Example: 2*2, 6/3, sqrt(9)")
        .setRequired(true)
    ),

  permissionLevel: "Everyone",

  /* SLASH COMMAND */
  async execute(interaction) {
    const expr = interaction.options.getString("expression");

    const data = evaluateExpression(expr);
    if (!data) {
      return interaction.reply({
        content: "❌ Invalid math expression.",
        ephemeral: true
      });
    }

    await interaction.reply(
      `🧮 **${expr}** = **${data.result}**`
    );
  },

  /* PREFIX COMMAND */
  async prefixExecute(message, args) {
    const expr = args.join(" ");
    if (!expr) {
      return message.reply("❌ Please provide a math expression.");
    }

    const data = evaluateExpression(expr);
    if (!data) {
      return message.reply("❌ Invalid math expression.");
    }

    await message.channel.send(
      `🧮 **${expr}** = **${data.result}**`
    );
  }
};
