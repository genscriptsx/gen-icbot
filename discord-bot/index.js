// ============================================================
//   GENSCRIPT ICBOT — Ana Giriş Noktası
// ============================================================

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.config = config;

(async () => {
  try {
    console.log('[GENSCRIPT] Bot başlatılıyor...');
    await commandHandler(client);
    await eventHandler(client);
    await client.login(config.token);
  } catch (err) {
    console.error('[GENSCRIPT] Başlatma hatası:', err);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (error) => {
  console.error('[GENSCRIPT] İşlenmeyen hata:', error);
});

process.on('SIGINT', () => {
  console.log('[GENSCRIPT] Bot kapatılıyor...');
  client.destroy();
  process.exit(0);
});
