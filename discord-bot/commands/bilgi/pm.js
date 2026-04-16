// ============================================================
//   GENSCRIPT — /pm komutu (Özel Mesaj)
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pm')
    .setDescription('Belirtilen oyuncuya oyun içi ekran mesajı (PM) gönderir.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addStringOption(o => o.setName('mesaj').setDescription('Gönderilecek mesaj').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id      = interaction.options.getInteger('id');
    const message = interaction.options.getString('mesaj');

    try {
      const res = await api.post(client.config, '/pm', {
        playerId:   id,
        message,
        senderName: `[Discord] ${interaction.user.tag}`,
      });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) oyun içi ekranına PM gönderildi.\n**Mesaj:** ${message}`,
          '💬 PM Gönderildi'
        )],
      });

      await logger(client, {
        action:  '💬 Oyun İçi PM Gönderildi',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Mesaj:** ${message}`,
        color:   0x9b59b6,
      });
    } catch (err) {
      console.error('[pm]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
