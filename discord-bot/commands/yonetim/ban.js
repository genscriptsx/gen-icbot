// ============================================================
//   GENSCRIPT — /ban komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Oyuncuyu sunucudan yasaklar.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu sunucu ID\'si').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Ban sebebi').setRequired(true))
    .addIntegerOption(o => o.setName('sure').setDescription('Süre (dakika) — 0 = kalıcı').setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id       = interaction.options.getInteger('id');
    const reason   = interaction.options.getString('sebep');
    const duration = interaction.options.getInteger('sure') ?? 0;

    try {
      const res = await api.post(client.config, '/ban', {
        playerId:       id,
        reason,
        duration,
        adminTag:       interaction.user.tag,
        adminDiscordId: interaction.user.id,
      });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message || 'İşlem başarısız.')] });

      const durationText = duration === 0 ? '**Kalıcı**' : `**${duration} dakika**`;

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) banlandı.\n**Süre:** ${durationText}\n**Sebep:** ${reason}`,
          '🔨 Ban Uygulandı'
        )],
      });

      await logger(client, {
        action:  '🔨 Oyuncu Banlandı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Sebep:** ${reason}\n**Süre:** ${durationText}`,
        color:   0xe74c3c,
      });
    } catch (err) {
      console.error('[ban]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
