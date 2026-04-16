// ============================================================
//   GENSCRIPT — /tp komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tp')
    .setDescription('Oyuncuyu belirtilen koordinata ışınlar.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addNumberOption(o => o.setName('x').setDescription('X koordinatı').setRequired(true))
    .addNumberOption(o => o.setName('y').setDescription('Y koordinatı').setRequired(true))
    .addNumberOption(o => o.setName('z').setDescription('Z koordinatı').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id = interaction.options.getInteger('id');
    const x  = interaction.options.getNumber('x');
    const y  = interaction.options.getNumber('y');
    const z  = interaction.options.getNumber('z');

    try {
      const res = await api.post(client.config, '/teleport', { playerId: id, x, y, z });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) ışınlandı.\n**Koordinat:** \`X: ${x} | Y: ${y} | Z: ${z}\``,
          '🌀 Işınlama'
        )],
      });

      await logger(client, {
        action:  '🌀 Oyuncu Işınlandı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Koordinat:** X: ${x} | Y: ${y} | Z: ${z}`,
        color:   0x3498db,
      });
    } catch (err) {
      console.error('[tp]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
