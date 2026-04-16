// ============================================================
//   GENSCRIPT — Ready Event
// ============================================================

const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[GENSCRIPT] 🟢 Bot hazır: ${client.user.tag}`);

    client.user.setPresence({
      activities: [{
        name: 'Genscript | FiveM Yönetim',
        type: ActivityType.Watching,
      }],
      status: 'dnd',
    });
  },
};
