// ============================================================
//   GENSCRIPT — Embed Builder Utility
// ============================================================

const { EmbedBuilder } = require('discord.js');

const FOOTER = 'Genscript • Yönetim Botu';

module.exports = {
  success(description, title = '✅ Başarılı') {
    return new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: FOOTER });
  },

  error(description, title = '❌ Hata') {
    return new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: FOOTER });
  },

  info(description, title = 'ℹ️ Bilgi') {
    return new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: FOOTER });
  },

  warning(description, title = '⚠️ Uyarı') {
    return new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: FOOTER });
  },
};
