// ============================================================
//   GENSCRIPT — /unban komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Oyuncunun banını kaldırır.')
    .addStringOption(o => o.setName('lisans').setDescription('Oyucu lisans numarası (license:xxxx...)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const license = interaction.options.getString('lisans').trim();

    try {
      const res = await api.post(client.config, '/unban', { license });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message || 'Ban bulunamadı veya kaldırılamadı.')] });

      await interaction.editReply({
        embeds: [embed.success(`\`${license}\` lisansına ait ban başarıyla kaldırıldı.`, '✅ Ban Kaldırıldı')],
      });

      await logger(client, {
        action:  '✅ Ban Kaldırıldı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName || license, id: 'N/A', discordId: null },
        details: `**Lisans:** \`${license}\``,
        color:   0x2ecc71,
      });
    } catch (err) {
      console.error('[unban]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
