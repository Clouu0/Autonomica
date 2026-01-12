export async function updateLevelRoles(member, level, levelRoles) {
  for (const [lvl, roles] of Object.entries(levelRoles)) {
    const intLvl = Number(lvl);

    for (const roleId of roles) {
      const hasRole = member.roles.cache.has(roleId);

      if (level >= intLvl && !hasRole) {
        // should have role
        await member.roles.add(roleId).catch(() => {});
      }

      if (level < intLvl && hasRole) {
        // should NOT have role
        await member.roles.remove(roleId).catch(() => {});
      }
    }
  }
}

