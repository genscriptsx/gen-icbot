// ============================================================
//   GENSCRIPT — /ck komutu (Karakter Öldürme)
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ck')
    .setDescription('Oyuncunun karakterini kalıcı olarak siler (CK — Character Kill).')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu sunucu ID\'si').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('CK sebebi (RP gerekçesi)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id     = interaction.options.getInteger('id');
    const reason = interaction.options.getString('sebep');

    try {
      const res = await api.post(client.config, '/ck', {
        playerId:       id,
        reason,
        adminTag:       interaction.user.tag,
        adminDiscordId: interaction.user.id,
      });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) karakteri kalıcı olarak silindi.\n**Sebep:** ${reason}`,
          '💀 Karakter Öldürme (CK)'
        )],
      });

      await logger(client, {
        action:  '💀 Karakter Öldürme (CK)',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Sebep:** ${reason}\n**İşlem:** Karakter veritabanından kalıcı olarak silindi.`,
        color:   0x1a1a2e,
      });
    } catch (err) {
      console.error('[ck]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
