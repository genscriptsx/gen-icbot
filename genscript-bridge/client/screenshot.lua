-- ============================================================
--   GENSCRIPT BRIDGE — Screenshot Client
--   screenshot-basic entegrasyonu
--   Gereksinim: screenshot-basic resource aktif olmalı
-- ============================================================

RegisterNetEvent('genscript:client:screenshot', function(webhookUrl)
    -- screenshot-basic resource'un mevcut olduğunu kontrol et
    if GetResourceState('screenshot-basic') ~= 'started' then
        TriggerServerEvent('genscript:server:screenshotError', 'screenshot-basic resource başlatılmamış.')
        return
    end

    if not webhookUrl or webhookUrl == '' then
        TriggerServerEvent('genscript:server:screenshotError', 'Webhook URL tanımlı değil.')
        return
    end

    -- Screenshot al ve doğrudan Discord webhook'a gönder
    exports['screenshot-basic']:requestScreenshotUpload(
        webhookUrl,
        'files[0]',
        function(data)
            if not data or data == '' then
                TriggerServerEvent('genscript:server:screenshotError', 'Screenshot verisi boş döndü.')
                return
            end

            local ok, resp = pcall(json.decode, data)
            if ok and resp and resp.attachments and #resp.attachments > 0 then
                TriggerServerEvent('genscript:server:screenshotDone', resp.attachments[1].url)
            else
                TriggerServerEvent('genscript:server:screenshotError', 'Webhook yanıtı işlenemedi.')
            end
        end
    )
end)

-- Server-side bildirim event'leri
RegisterNetEvent('genscript:server:screenshotDone', function(url)
    print('^2[GENSCRIPT]^0 Screenshot başarıyla gönderildi: ' .. (url or 'N/A'))
end)

RegisterNetEvent('genscript:server:screenshotError', function(reason)
    print('^1[GENSCRIPT]^0 Screenshot hatası: ' .. (reason or 'Bilinmeyen hata'))
end)
