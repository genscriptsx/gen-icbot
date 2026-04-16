// ============================================================
//   GENSCRIPT — /ped-ver komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ped-ver')
    .setDescription('Oyuncunun karakterinin modelini (ped) değiştirir.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addStringOption(o => o.setName('model').setDescription('Ped model adı (ör: a_m_m_acult_01, s_f_y_cop_01)').setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id    = interaction.options.getInteger('id');
    const model = interaction.options.getString('model').trim();

    try {
      const res = await api.post(client.config, '/ped', { playerId: id, model });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** modeli **\`${model}\`** olarak değiştirildi.`,
          '🎭 Ped Değiştirildi'
        )],
      });

      await logger(client, {
        action:  '🎭 Ped Modeli Değiştirildi',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Model:** \`${model}\``,
        color:   0x8e44ad,
      });
    } catch (err) {
      console.error('[ped-ver]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
