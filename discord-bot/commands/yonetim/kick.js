// ============================================================
//   GENSCRIPT — /kick komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Oyuncuyu sunucudan atar.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Kick sebebi').setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id     = interaction.options.getInteger('id');
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

    try {
      const res = await api.post(client.config, '/kick', { playerId: id, reason });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(`**${res.playerName}** (ID: \`${id}\`) sunucudan atıldı.\n**Sebep:** ${reason}`, '👢 Kick')],
      });

      await logger(client, {
        action:  '👢 Oyuncu Kicklendi',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Sebep:** ${reason}`,
        color:   0xf39c12,
      });
    } catch (err) {
      console.error('[kick]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
