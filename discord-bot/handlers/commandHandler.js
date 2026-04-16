// ============================================================
//   GENSCRIPT — Command Handler
//   commands/ altındaki tüm komutları yükler ve Discord'a register eder.
// ============================================================

const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

module.exports = async (client) => {
  const commands     = [];
  const commandsPath = path.join(__dirname, '../commands');
  const categories   = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const command  = require(filePath);

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[GENSCRIPT] ✅ Komut yüklendi: /${command.data.name}`);
      } else {
        console.warn(`[GENSCRIPT] ⚠️  ${file} — data veya execute eksik, atlandı.`);
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(client.config.token);

  try {
    console.log('[GENSCRIPT] Slash komutlar Discord\'a register ediliyor...');
    await rest.put(
      Routes.applicationGuildCommands(client.config.clientId, client.config.guildId),
      { body: commands }
    );
    console.log(`[GENSCRIPT] ✅ ${commands.length} komut başarıyla register edildi.`);
  } catch (error) {
    console.error('[GENSCRIPT] ❌ Komut register hatası:', error);
  }
};
