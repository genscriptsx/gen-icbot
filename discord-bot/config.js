// ============================================================
//   GENSCRIPT ICBOT — Yapılandırma Dosyası
//   Tüm ayarları buradan düzenleyin.
// ============================================================

module.exports = {
  // ─── Discord Bot ───────────────────────────────────────────
  token: 'Kendi Tokenini gir',          // Discord Developer Portal'dan alın
  clientId: 'Botidsi',   // Bot'un uygulama ID'si
  guildId: 'GuildİD',         // Komutların register edileceği sunucu ID'si

  // ─── Yetkili Roller ────────────────────────────────────────
  // Bu rollere sahip kişiler tüm komutları kullanabilir.
  allowedRoles: [
    'Rolid1', // ← Yetkili Rol ID'si (1)
    'rolid2', // ← Yetkili Rol ID'si (2)
  ],

  // ─── Log Kanalı ───────────────────────────────────────────
  logChannelId: 'Log kanalının idsi', // Tüm işlem loglarının düşeceği kanal

  // ─── Screenshot Webhook ────────────────────────────────────
  // FiveM'deki screenshot-basic'in göndereceği Discord webhook URL'si
  screenshotWebhook: 'Webhook-URL',

  // ─── FiveM Sunucu Bağlantısı ──────────────────────────────
  fivemServerIp: 'FİVEM SUNUCUSUNUJN İPSİ',       // Sunucu IP adresi
  fivemServerPort: 30120,          // FiveM port (genellikle 30120)
  apiSecret: 'api', // config.lua'daki APISecret ile AYNI — değiştirmeyin!

  // ─── Embed Renk Paleti ────────────────────────────────────
  colors: {
    success: 0x2ecc71,
    error: 0xe74c3c,
    info: 0x3498db,
    warning: 0xf39c12,
    log: 0x9b59b6,
  },
};
