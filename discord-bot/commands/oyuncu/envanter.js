// ============================================================
//   GENSCRIPT — /envanter komutu (goster | ekle | cikar)
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api    = require('../../utils/apiClient');
const embed  = require('../../utils/embedBuilder');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('envanter')
    .setDescription('Oyuncu envanter yönetimi.')
    .addSubcommand(sub =>
      sub.setName('goster')
        .setDescription('Oyuncunun envanterini Discord\'da listeler.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('ekle')
        .setDescription('Oyuncunun envanterine eşya ekler.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
        .addStringOption(o => o.setName('esya').setDescription('Eşya adı (item name, ör: bread)').setRequired(true))
        .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('cikar')
        .setDescription('Oyuncunun envanterinden eşya çıkarır.')
        .addIntegerOption(o => o.setName('id').setDescription('Oyuncu ID').setRequired(true))
        .addStringOption(o => o.setName('esya').setDescription('Eşya adı').setRequired(true))
        .addIntegerOption(o => o.setName('miktar').setDescription('Miktar').setRequired(true))
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const id  = interaction.options.getInteger('id');

    try {
      // ─── Envanter Göster ────────────────────────────────────
      if (sub === 'goster') {
        const res = await api.post(client.config, '/inventory/get', { playerId: id });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        const items = res.inventory || [];
        const desc  = items.length
          ? items.map(i => `\`${i.name}\` ${i.label ? `(${i.label})` : ''} — **${i.count}x**`).join('\n')
          : '*Envanter boş.*';

        const e = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle(`🎒 ${res.playerName} — Envanter`)
          .setDescription(desc.length > 4000 ? desc.slice(0, 3990) + '\n...' : desc)
          .setFooter({ text: `Oyuncu ID: ${id} | ${items.length} eşya türü • Genscript` })
          .setTimestamp();

        await interaction.editReply({ embeds: [e] });

        await logger(client, {
          action:  '🎒 Envanter Görüntülendi',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `${items.length} eşya türü listelendi.`,
        });

      // ─── Eşya Ekle ──────────────────────────────────────────
      } else if (sub === 'ekle') {
        const item   = interaction.options.getString('esya').toLowerCase();
        const amount = interaction.options.getInteger('miktar');

        const res = await api.post(client.config, '/inventory/add', { playerId: id, item, amount });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(
            `**${res.playerName}** envanterine **${amount}x \`${item}\`** eklendi.`,
            '➕ Eşya Eklendi'
          )],
        });

        await logger(client, {
          action:  '➕ Envanter Ekleme',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Eşya:** \`${item}\`\n**Miktar:** ${amount}`,
          color:   0x2ecc71,
        });

      // ─── Eşya Çıkar ─────────────────────────────────────────
      } else if (sub === 'cikar') {
        const item   = interaction.options.getString('esya').toLowerCase();
        const amount = interaction.options.getInteger('miktar');

        const res = await api.post(client.config, '/inventory/remove', { playerId: id, item, amount });
        if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

        await interaction.editReply({
          embeds: [embed.success(
            `**${res.playerName}** envanterinden **${amount}x \`${item}\`** çıkarıldı.`,
            '➖ Eşya Çıkarıldı'
          )],
        });

        await logger(client, {
          action:  '➖ Envanter Çıkarma',
          admin:   { tag: interaction.user.tag, id: interaction.user.id },
          target:  { name: res.playerName, id: String(id), discordId: res.playerDiscordId },
          details: `**Eşya:** \`${item}\`\n**Miktar:** ${amount}`,
          color:   0xe74c3c,
        });
      }
    } catch (err) {
      console.error('[envanter]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
