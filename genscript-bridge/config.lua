-- ============================================================
--   GENSCRIPT BRIDGE — Config
-- ============================================================

Config = {}

-- Framework Seçimi: "qb-core" veya "esx"
Config.Framework = "qb-core"

-- API Güvenlik Anahtarı (discord-bot/config.js'deki apiSecret ile AYNI olmalı!)
Config.APISecret = "api"

-- Oyun içi PM mesajının ekranda durma süresi (ms)
Config.PMDuration = 8000

-- Screenshot webhook URL (discord-bot/config.js'deki screenshotWebhook ile aynı)
-- FiveM tarafında screenshot-basic bu URL'e gönderecek
Config.ScreenshotWebhook = "WEBHOOK URL"
