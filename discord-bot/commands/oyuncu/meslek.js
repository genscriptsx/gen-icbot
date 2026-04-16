// ============================================================
//   GENSCRIPT — /meslek komutu (goster | ver | al)
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meslek')
    .setDescription('Oyuncu meslek yönetimi.')
    .addSubcommand(sub =>
      sub.setName('goster')
        .setDescription('Oyuncunun mevcut mesleğini gösterir.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Oyuncuya meslek/rütbe atar.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
        .addStringOption(o => o.setName('meslek').setDescription('Meslek adı (job name, ör: police)').setRequired(true))
        .addIntegerOption(o => o.setName('rutbe').setDescription('Rütbe (grade, ör: 0=staj, 3=şef)').setMinValue(0).setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('al')
        .setDescription('Oyuncunun mesleğini kaldırır (unemployed yapar).')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const id  = interaction.options.getInteger('id');

    try {
      // ─── Meslek Göster ──────────────────────────────────────
      if (sub === 'goster') {
        const res = await api.post(client.config, '/job/get', { playerId: id });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        const e = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle(`💼 ${res.playerName} — Meslek Bilgisi`)
          .addFields(
            { name: '🏢 Meslek',  value: `${res.jobLabel || res.job || 'N/A'} (\`${res.job || 'N/A'}\`)`, inline: true },
            { name: '⭐ Rütbe',   value: `${res.gradeLabel || 'N/A'} (Grade: \`${res.grade ?? 'N/A'}\`)`, inline: true },
          )
          .setFooter({ text: `ID: ${id} • Genscript` })
          .setTimestamp();

        await interaction.editReply({ embeds: [e] });

        await logger(client, {
          action:  '💼 Meslek Sorgulandı',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Meslek:** ${res.job} | **Rütbe:** ${res.grade}`,
        });

      // ─── Meslek Ver ─────────────────────────────────────────
      } else if (sub === 'ver') {
        const job   = interaction.options.getString('meslek').toLowerCase();
        const grade = interaction.options.getInteger('rutbe');

        const res = await api.post(client.config, '/job/set', { playerId: id, job, grade });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(
            `**${res.playerName}** mesleği **\`${job}\`** (Grade: ${grade}) olarak güncellendi.`,
            '💼 Meslek Verildi'
          )],
        });

        await logger(client, {
          action:  '💼 Meslek Verildi',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Meslek:** \`${job}\`\n**Rütbe:** ${grade}`,
          color:   0x2ecc71,
        });

      // ─── Meslek Al ──────────────────────────────────────────
      } else if (sub === 'al') {
        const res = await api.post(client.config, '/job/set', { playerId: id, job: 'unemployed', grade: 0 });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(`**${res.playerName}** işsiz yapıldı (unemployed).`, '💼 Meslek Alındı')],
        });

        await logger(client, {
          action:  '💼 Meslek Alındı',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: 'Meslek "unemployed" (grade: 0) olarak ayarlandı.',
          color:   0xe74c3c,
        });
      }
    } catch (err) {
      console.error('[meslek]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
