// ============================================================
//   GENSCRIPT — /revive komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('revive')
    .setDescription('Oyuncuyu canlandırır.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const id = interaction.options.getInteger('id');

    try {
      const res = await api.post(client.config, '/revive', { playerId: id });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(`**${res.playerName}** (ID: \`${id}\`) canlandırıldı.`, '💊 Canlandırma')],
      });

      await logger(client, {
        action:  '💊 Oyuncu Canlandırıldı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: 'Discord üzerinden canlandırma uygulandı.',
        color:   0x2ecc71,
      });
    } catch (err) {
      console.error('[revive]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
