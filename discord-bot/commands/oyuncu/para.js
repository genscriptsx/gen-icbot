// ============================================================
//   GENSCRIPT — /para komutu (goster | ver | al)
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

const MONEY_LABELS = { cash: '💵 Nakit', bank: '🏦 Banka', black_money: '🖤 Kara Para' };

const moneyChoices = [
  { name: '💵 Nakit',     value: 'cash'        },
  { name: '🏦 Banka',     value: 'bank'        },
  { name: '🖤 Kara Para', value: 'black_money' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('para')
    .setDescription('Oyuncu para yönetimi.')
    .addSubcommand(sub =>
      sub.setName('goster')
        .setDescription('Oyuncunun tüm bakiyelerini gösterir.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Oyuncuya para verir.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
        .addStringOption(o => o.setName('tip').setDescription('Para tipi').setRequired(true).addChoices(...moneyChoices))
        .addIntegerOption(o => o.setName('miktar').setDescription('Miktar ($)').setMinValue(1).setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('al')
        .setDescription('Oyuncudan para alır.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
        .addStringOption(o => o.setName('tip').setDescription('Para tipi').setRequired(true).addChoices(...moneyChoices))
        .addIntegerOption(o => o.setName('miktar').setDescription('Miktar ($)').setMinValue(1).setRequired(true))
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const id  = interaction.options.getInteger('id');

    try {
      // ─── Bakiye Göster ──────────────────────────────────────
      if (sub === 'goster') {
        const res = await api.post(client.config, '/money/get', { playerId: id });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        const e = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`💰 ${res.playerName} — Bakiye`)
          .addFields(
            { name: '💵 Nakit',     value: `$${(res.cash        || 0).toLocaleString()}`, inline: true },
            { name: '🏦 Banka',     value: `$${(res.bank        || 0).toLocaleString()}`, inline: true },
            { name: '🖤 Kara Para', value: `$${(res.black_money || 0).toLocaleString()}`, inline: true },
          )
          .setFooter({ text: `Oyuncu ID: ${id} • Genscript` })
          .setTimestamp();

        await interaction.editReply({ embeds: [e] });

        await logger(client, {
          action:  '💰 Bakiye Görüntülendi',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `Nakit: $${res.cash || 0} | Banka: $${res.bank || 0} | Kara: $${res.black_money || 0}`,
        });

      // ─── Para Ver ───────────────────────────────────────────
      } else if (sub === 'ver') {
        const moneyType = interaction.options.getString('tip');
        const amount    = interaction.options.getInteger('miktar');

        const res = await api.post(client.config, '/money/add', { playerId: id, moneyType, amount });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(
            `**${res.playerName}** hesabına **$${amount.toLocaleString()} ${MONEY_LABELS[moneyType]}** eklendi.`,
            '💵 Para Verildi'
          )],
        });

        await logger(client, {
          action:  '💵 Para Verildi',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Miktar:** $${amount.toLocaleString()}\n**Tip:** ${MONEY_LABELS[moneyType]}`,
          color:   0x2ecc71,
        });

      // ─── Para Al ────────────────────────────────────────────
      } else if (sub === 'al') {
        const moneyType = interaction.options.getString('tip');
        const amount    = interaction.options.getInteger('miktar');

        const res = await api.post(client.config, '/money/remove', { playerId: id, moneyType, amount });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(
            `**${res.playerName}** hesabından **$${amount.toLocaleString()} ${MONEY_LABELS[moneyType]}** alındı.`,
            '💸 Para Alındı'
          )],
        });

        await logger(client, {
          action:  '💸 Para Alındı',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Miktar:** $${amount.toLocaleString()}\n**Tip:** ${MONEY_LABELS[moneyType]}`,
          color:   0xe74c3c,
        });
      }
    } catch (err) {
      console.error('[para]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
