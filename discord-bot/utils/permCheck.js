// ============================================================
//   GENSCRIPT — Permission Check Utility
// ============================================================

/**
 * Kullanıcının yetkili rollerden birine sahip olup olmadığını kontrol eder.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {string[]} allowedRoles - Yetkili rol ID listesi
 * @returns {boolean}
 */
module.exports = (interaction, allowedRoles) => {
  const member = interaction.member;
  if (!member) return false;

  // Sunucu sahibine her zaman izin ver
  if (interaction.guild?.ownerId === interaction.user.id) return true;

  return member.roles.cache.some(role => allowedRoles.includes(role.id));
};
