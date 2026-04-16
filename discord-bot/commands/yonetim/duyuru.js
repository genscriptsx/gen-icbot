// ============================================================
//   GENSCRIPT — /duyuru komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duyuru')
    .setDescription('Sunucudaki tüm oyunculara duyuru gönderir.')
    .addStringOption(o => o.setName('mesaj').setDescription('Duyuru metni').setRequired(true))
    .addStringOption(o =>
      o.setName('tip')
        .setDescription('Duyuru tipi')
        .setRequired(false)
        .addChoices(
          { name: '💬 Chat Mesajı', value: 'chat' },
          { name: '🖥️ Ekran Bildirimi', value: 'screen' },
          { name: '🔔 Her İkisi', value: 'both' },
        )
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const message = interaction.options.getString('mesaj');
    const type    = interaction.options.getString('tip') || 'chat';

    const typeLabels = { chat: 'Chat Mesajı', screen: 'Ekran Bildirimi', both: 'Chat + Ekran' };

    try {
      const res = await api.post(client.config, '/announce', {
        message,
        type,
        adminTag: interaction.user.tag,
      });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `Duyuru başarıyla gönderildi!\n**Tip:** ${typeLabels[type]}\n**Mesaj:** ${message}`,
          '📢 Duyuru Gönderildi'
        )],
      });

      await logger(client, {
        action:  '📢 Sunucu Duyurusu',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: 'Tüm Oyuncular', id: 'ALL', discordId: null },
        details: `**Tip:** ${typeLabels[type]}\n**Mesaj:** ${message}`,
        color:   0xf39c12,
      });
    } catch (err) {
      console.error('[duyuru]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
