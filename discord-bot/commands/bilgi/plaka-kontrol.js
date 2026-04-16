// ============================================================
//   GENSCRIPT — /plaka-kontrol komutu
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plaka-kontrol')
    .setDescription('Araç plakasını sorgular — sahibi ve modeli gösterir.')
    .addStringOption(o => o.setName('plaka').setDescription('Sorgulanacak plaka').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const plate = interaction.options.getString('plaka').toUpperCase().trim();

    try {
      const res = await api.get(client.config, '/plate', { plate });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message || 'Plaka bulunamadı.')] });

      const e = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle(`🔍 Plaka Sorgulama: ${plate}`)
        .addFields(
          { name: '👤 Araç Sahibi',    value: res.ownerName    || 'N/A', inline: true },
          { name: '🪪 Citizen ID',     value: res.citizenId    || 'N/A', inline: true },
          { name: '🚗 Araç Modeli',    value: res.vehicleModel || 'N/A', inline: true },
          { name: '📋 Plaka',          value: plate,                     inline: true },
          { name: '🔋 Durum',          value: res.state        || 'N/A', inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Genscript • Araç Sorgulama' });

      await interaction.editReply({ embeds: [e] });

      await logger(client, {
        action:  '🚗 Plaka Sorgulandı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.ownerName || 'N/A', id: 'N/A', discordId: null },
        details: `**Plaka:** ${plate}\n**Model:** ${res.vehicleModel || 'N/A'}`,
      });
    } catch (err) {
      console.error('[plaka-kontrol]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
