// ============================================================
//   GENSCRIPT — /sorgu-fivem komutu
//   FiveM ID/CitizenID → Discord profili
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api   = require('../../utils/apiClient');
const embed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sorgu-fivem')
    .setDescription('FiveM sunucu ID veya Citizen ID ile oyuncunun Discord bilgisini sorgular.')
    .addStringOption(o => o.setName('id').setDescription('Sunucu ID veya Citizen ID (ör: 5 veya GSX123456)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const playerId = interaction.options.getString('id').trim();

    try {
      const res = await api.get(client.config, '/query/fivem', { playerId });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message || 'Oyuncu bulunamadı.')] });

      const e = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle('🔍 FiveM → Discord Sorgusu')
        .addFields(
          { name: '🎮 Oyun İçi İsim',  value: res.playerName  || 'N/A',                                          inline: true },
          { name: '🪪 Citizen ID',      value: res.citizenId   || 'N/A',                                          inline: true },
          { name: '💬 Discord',         value: res.discordId ? `<@${res.discordId}> (\`${res.discordId}\`)` : 'Bağlı değil', inline: false },
          { name: '💼 Meslek',          value: res.job         || 'N/A',                                          inline: true },
          { name: '📅 Son Giriş',       value: res.lastLogin   || 'N/A',                                          inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Genscript • Sorgulama Sistemi' });

      await interaction.editReply({ embeds: [e] });
    } catch (err) {
      console.error('[sorgu-fivem]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
