// ============================================================
//   GENSCRIPT — FiveM API Client
//   Discord bot → FiveM HTTP endpoint iletişimi
// ============================================================

const axios = require('axios');

const buildUrl = (cfg, endpoint) =>
  `http://${cfg.fivemServerIp}:${cfg.fivemServerPort}/genscript-bridge${endpoint}`;

const headers = (cfg) => ({
  'X-API-Key': cfg.apiSecret,
  'Content-Type': 'application/json',
});

module.exports = {
  /**
   * GET isteği gönderir.
   * @param {Object} cfg - client.config
   * @param {string} endpoint - /players gibi
   * @param {Object} [params] - Query parametreleri
   */
  async get(cfg, endpoint, params = {}) {
    const response = await axios.get(buildUrl(cfg, endpoint), {
      params,
      headers: headers(cfg),
      timeout: 10_000,
      validateStatus: () => true, // 4xx/5xx'te exception fırlatma, data olarak dön
    });
    return response.data;
  },

  /**
   * POST isteği gönderir.
   * @param {Object} cfg - client.config
   * @param {string} endpoint
   * @param {Object} [body]
   */
  async post(cfg, endpoint, body = {}) {
    const response = await axios.post(buildUrl(cfg, endpoint), body, {
      headers: headers(cfg),
      timeout: 10_000,
      validateStatus: () => true, // 4xx/5xx'te exception fırlatma, data olarak dön
    });
    return response.data;
  },
};
