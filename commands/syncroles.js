import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import Database from 'better-sqlite3';
import { levelRoles } from '../data/levelRoles.js';

// Open DB once (safe to reuse)
const db = new Database('./levels.db');

// Prepared statement (FAST)
const getLevelStmt = db.prepare(
  'SELECT level FROM levels WHERE user_id = ?'
);

export default {
  data: new SlashCommandBuilder()
    .setName('syncroles')
    .setDescription('Re-sync level roles for all members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild;
    const botMember = guild.members.me;

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.editReply('I need **Manage Roles** permission.');
    }

    const members = await guild.members.fetch();

    let checked = 0;
    let added = 0;
    let removed = 0;

    const allLevelRoleIds = Object.values(levelRoles).flat();

    for (const member of members.values()) {
      if (member.user.bot) continue;

      const row = getLevelStmt.get(member.id);
      const level = row?.level ?? 0;
      checked++;

      // Roles user SHOULD have
      const rolesToHave = [];

      for (const [requiredLevel, roleIds] of Object.entries(levelRoles)) {
        if (level >= Number(requiredLevel)) {
          rolesToHave.push(...roleIds);
        }
      }

      // ADD missing roles
      for (const roleId of rolesToHave) {
        const role = guild.roles.cache.get(roleId);
        if (!role) continue;
        if (role.position >= botMember.roles.highest.position) continue;

        if (!member.roles.cache.has(roleId)) {
          try {
            await member.roles.add(roleId);
            added++;
          } catch {}
        }
      }

      // REMOVE invalid roles
      for (const roleId of allLevelRoleIds) {
        if (!rolesToHave.includes(roleId) && member.roles.cache.has(roleId)) {
          const role = guild.roles.cache.get(roleId);
          if (!role) continue;
          if (role.position >= botMember.roles.highest.position) continue;

          try {
            await member.roles.remove(roleId);
            removed++;
          } catch {}
        }
      }
    }

    await interaction.editReply(
      `**Level role sync complete**\n` +
      `Members checked: **${checked}**\n` +
      `Roles added: **${added}**\n` +
      `Roles removed: **${removed}**`
    );
  },
};
