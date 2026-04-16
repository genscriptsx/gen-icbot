// ============================================================
//   GENSCRIPT — /ss-al komutu (Screenshot)
//   screenshot-basic entegrasyonu ile oyuncu ekranı çeker.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ss-al')
    .setDescription('Belirtilen oyuncunun oyun içi ekran görüntüsünü alır.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true)),

  async execute(interaction, client) {
    // Bu komut herkese görünür — screenshot webhook'a gidecek
    await interaction.deferReply({ ephemeral: false });

    const id = interaction.options.getInteger('id');

    try {
      const res = await api.post(client.config, '/screenshot', {
        playerId:   id,
        webhookUrl: client.config.screenshotWebhook,
      });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      const e = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('📸 Ekran Görüntüsü İstendi')
        .setDescription(
          `**${res.playerName}** (ID: \`${id}\`) için ekran görüntüsü isteği gönderildi.\n` +
          `📌 Görüntü birkaç saniye içinde screenshot kanalına gelecek.`
        )
        .setTimestamp()
        .setFooter({ text: 'Genscript • Screenshot Sistemi' });

      await interaction.editReply({ embeds: [e] });

      await logger(client, {
        action:  '📸 Ekran Görüntüsü Alındı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: 'screenshot-basic ile ekran görüntüsü webhook\'a gönderildi.',
        color:   0x3498db,
      });
    } catch (err) {
      console.error('[ss-al]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
