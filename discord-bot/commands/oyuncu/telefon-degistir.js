// ============================================================
//   GENSCRIPT — /telefon-degistir komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('telefon-degistir')
    .setDescription('Oyuncunun oyun içi telefon numarasını değiştirir (SQL).')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addStringOption(o => o.setName('numara').setDescription('Yeni telefon numarası').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id     = interaction.options.getInteger('id');
    const number = interaction.options.getString('numara').trim();

    try {
      const res = await api.post(client.config, '/phone', { playerId: id, number });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** telefon numarası **${number}** olarak güncellendi.`,
          '📱 Telefon Değiştirildi'
        )],
      });

      await logger(client, {
        action:  '📱 Telefon Numarası Değiştirildi',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Yeni Numara:** \`${number}\``,
        color:   0x9b59b6,
      });
    } catch (err) {
      console.error('[telefon-degistir]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
