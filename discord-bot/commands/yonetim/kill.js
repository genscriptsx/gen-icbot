// ============================================================
//   GENSCRIPT — /kill komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('Oyuncuyu öldürür.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const id = interaction.options.getInteger('id');

    try {
      const res = await api.post(client.config, '/kill', { playerId: id });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(`**${res.playerName}** (ID: \`${id}\`) öldürüldü.`, '💀 Öldürme')],
      });

      await logger(client, {
        action:  '💀 Oyuncu Öldürüldü',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: 'Discord üzerinden öldürme komutu uygulandı.',
        color:   0xe74c3c,
      });
    } catch (err) {
      console.error('[kill]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
