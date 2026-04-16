// ============================================================
//   GENSCRIPT — Event Handler
//   events/ altındaki tüm eventleri dinamik olarak yükler.
// ============================================================

const fs   = require('fs');
const path = require('path');

module.exports = async (client) => {
  const eventsPath = path.join(__dirname, '../events');
  const files      = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    console.log(`[GENSCRIPT] 📡 Event yüklendi: ${event.name}`);
  }
};
