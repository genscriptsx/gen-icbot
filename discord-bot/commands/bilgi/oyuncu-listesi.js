// ============================================================
//   GENSCRIPT — /oyuncu-listesi komutu
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api   = require('../../utils/apiClient');
const embed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('oyuncu-listesi')
    .setDescription('Sunucudaki aktif oyuncuları (ID, İsim, Ping) listeler.'),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const res = await api.get(client.config, '/players');

      if (!res.success) return interaction.editReply({ embeds: [embed.error(res.message)] });

      const players = res.players || [];

      if (players.length === 0) {
        return interaction.editReply({ embeds: [embed.info('Şu anda sunucuda aktif oyuncu bulunmuyor.')] });
      }

      // Sayfalama: Discord max 4096 karakter
      const chunks = [];
      let current  = '';

      for (const p of players) {
        const line = `\`${String(p.id).padStart(3, '0')}\` ▸ **${p.name}** — Ping: \`${p.ping}ms\`\n`;
        if (current.length + line.length > 3800) {
          chunks.push(current);
          current = '';
        }
        current += line;
      }
      if (current) chunks.push(current);

      const embeds = chunks.map((chunk, idx) =>
        new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle(
            idx === 0
              ? `👥 Aktif Oyuncular — ${players.length}/${res.maxPlayers || '?'}`
              : `👥 Aktif Oyuncular (Sayfa ${idx + 1})`
          )
          .setDescription(chunk)
          .setTimestamp()
          .setFooter({ text: 'Genscript • Oyuncu Listesi' })
      );

      await interaction.editReply({ embeds: embeds.slice(0, 10) });
    } catch (err) {
      console.error('[oyuncu-listesi]', err?.message);
      await interaction.editReply({ embeds: [embed.error('FiveM sunucusuna bağlanılamadı.')] });
    }
  },
};
