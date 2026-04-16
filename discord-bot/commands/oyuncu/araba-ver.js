// ============================================================
//   GENSCRIPT — /araba-ver komutu
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('araba-ver')
    .setDescription('Oyuncunun yanına araç çıkarır.')
    .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    .addStringOption(o => o.setName('model').setDescription('Araç model adı (ör: adder, zentorno, police)').setRequired(true))
    .addStringOption(o => o.setName('plaka').setDescription('Plaka (boş bırakılırsa otomatik oluşturulur)').setRequired(false)),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const id    = interaction.options.getInteger('id');
    const model = interaction.options.getString('model').toLowerCase().trim();
    const plate = interaction.options.getString('plaka')?.toUpperCase().trim()
      || `GS${id}${String(Math.floor(Math.random() * 900) + 100)}`;

    try {
      const res = await api.post(client.config, '/vehicle', { playerId: id, model, plate });

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      await interaction.editReply({
        embeds: [embed.success(
          `**${res.playerName}** (ID: \`${id}\`) yanına **${model}** aracı çıkarıldı.\n**Plaka:** \`${plate}\``,
          '🚗 Araç Verildi'
        )],
      });

      await logger(client, {
        action:  '🚗 Araç Verildi',
        admin:   { tag: interaction.user.tag, id: interaction.user.id },
        target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
        details: `**Model:** ${model}\n**Plaka:** ${plate}`,
        color:   0x3498db,
      });
    } catch (err) {
      console.error('[araba-ver]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
