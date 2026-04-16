// ============================================================
//   GENSCRIPT — InteractionCreate Event
// ============================================================

const permCheck    = require('../utils/permCheck');
const embedBuilder = require('../utils/embedBuilder');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Yetki kontrolü
    const hasPermission = permCheck(interaction, client.config.allowedRoles);
    if (!hasPermission) {
      return interaction.reply({
        embeds: [embedBuilder.error('❌ Bu komutu kullanmak için yetkiniz bulunmuyor.')],
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`[GENSCRIPT] ❌ Komut hatası (/${interaction.commandName}):`, error);
      const errEmbed = embedBuilder.error('Komut çalıştırılırken beklenmedik bir hata oluştu.');

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
  },
};
