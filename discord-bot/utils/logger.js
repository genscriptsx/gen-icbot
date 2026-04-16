// ============================================================
//   GENSCRIPT — Discord Log Sistemi
//   Her işlemi log kanalına şık Embed olarak gönderir.
// ============================================================

const { EmbedBuilder } = require('discord.js');

/**
 * İşlem logu gönderir.
 * @param {import('discord.js').Client} client
 * @param {Object} opts
 * @param {string}   opts.action          - İşlem adı (ör: "Ban Uygulandı")
 * @param {{tag:string, id:string}} opts.admin  - Yetkili Discord bilgisi
 * @param {{name:string, id:string, discordId?:string}} opts.target - Hedef oyuncu
 * @param {string}   opts.details         - İşlem detayı
 * @param {number}  [opts.color]          - Embed rengi (hex)
 */
module.exports = async (client, opts) => {
  try {
    const channel = await client.channels.fetch(client.config.logChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const targetValue = [
      `**Ad:** ${opts.target?.name || 'N/A'}`,
      `**Oyun ID:** \`${opts.target?.id || 'N/A'}\``,
      opts.target?.discordId
        ? `**Discord:** <@${opts.target.discordId}> (\`${opts.target.discordId}\`)`
        : `**Discord:** Bilinmiyor`,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setColor(opts.color ?? 0x9b59b6)
      .setTitle(`📋 ${opts.action}`)
      .addFields(
        {
          name: '👮 İşlemi Yapan Yetkili',
          value: `<@${opts.admin.id}> — \`${opts.admin.tag}\`\nID: \`${opts.admin.id}\``,
          inline: true,
        },
        {
          name: '🎯 Hedef Oyuncu',
          value: targetValue,
          inline: true,
        },
        {
          name: '📝 İşlem Detayı',
          value: opts.details || '*Detay belirtilmedi*',
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Genscript Log Sistemi' });

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[GENSCRIPT] Log gönderme hatası:', err?.message || err);
  }
};
