// ============================================================
//   GENSCRIPT — /sorgu-discord komutu
//   Discord ID → FiveM oyuncu bilgisi
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api   = require('../../utils/apiClient');
const embed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sorgu-discord')
    .setDescription('Discord ID ile oyuncunun FiveM karakterini sorgular.')
    .addStringOption(o => o.setName('discord-id').setDescription('Discord Kullanıcı ID\'si').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.options.getString('discord-id').trim();

    try {
      const res = await api.get(client.config, '/query/discord', { discordId });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message || 'Oyuncu bulunamadı.')] });

      const e = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle('🔍 Discord → FiveM Sorgusu')
        .addFields(
          { name: '🎮 Oyun İçi İsim',  value: res.playerName  || 'N/A',                                  inline: true },
          { name: '🪪 Citizen ID',      value: res.citizenId   || 'N/A',                                  inline: true },
          { name: '⚙️ Sunucu ID',       value: res.serverId ? `\`${res.serverId}\`` : 'Çevrimdışı',       inline: true },
          { name: '💼 Meslek',          value: res.job         || 'N/A',                                  inline: true },
          { name: '🏦 Banka',           value: `$${(res.bank  || 0).toLocaleString()}`,                   inline: true },
          { name: '📍 Durum',           value: res.serverId ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı',          inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Genscript • Sorgulama Sistemi' });

      await interaction.editReply({ embeds: [e] });
    } catch (err) {
      console.error('[sorgu-discord]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
