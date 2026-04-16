// ============================================================
//   GENSCRIPT — /kiyafet-ver komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kiyafet-ver')
    .setDescription('Oyuncuya kıyafet/skin menüsünü açtırır.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const id = interaction.options.getInteger('id');

    try {
      const res = await api.post(client.config, '/clothing', { playerId: id });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) için kıyafet menüsü açıldı.`,
          '👕 Kıyafet Menüsü Açıldı'
        )],
      });

      await logger(client, {
        action:  '👕 Kıyafet Menüsü Açıldı',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: 'Oyuncuya kıyafet/skin menüsü açtırıldı.',
        color:   0xe91e8c,
      });
    } catch (err) {
      console.error('[kiyafet-ver]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
