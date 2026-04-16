-- ============================================================
--   GENSCRIPT BRIDGE — Ana HTTP Server (SetHttpHandler)
--   Discord bot'tan gelen tüm HTTP isteklerini yönetir.
-- ============================================================

-- ─── Yardımcı Fonksiyonlar ────────────────────────────────────

local function SendJSON(res, code, data)
    res.writeHead(code, { ['Content-Type'] = 'application/json' })
    res.send(json.encode(data))
end

local function ValidateKey(req)
    local key = (req.headers and (req.headers['x-api-key'] or req.headers['X-Api-Key'] or req.headers['X-API-Key'])) or ''
    print('^3[GENSCRIPT DEBUG]^0 Gelen key: "' .. key .. '" | Beklenen: "' .. tostring(Config.APISecret) .. '"')
    return key == Config.APISecret
end

local function GetSource(idParam)
    local id = tonumber(idParam)
    if not id then return nil end
    return GetPlayerName(id) ~= nil and id or nil
end

local function PlayerInfo(source)
    local player   = Framework.GetPlayer(source)
    local name     = player and Framework.GetPlayerName(player) or GetPlayerName(source) or 'Bilinmiyor'
    local discord  = Framework.GetDiscordId(source)
    return player, name, discord
end

local function ParseBody(req)
    if not req.body or req.body == '' then return {} end
    local ok, data = pcall(json.decode, req.body)
    return ok and data or {}
end

-- ─── HTTP Handler ─────────────────────────────────────────────

SetHttpHandler(function(req, res)
    local path   = (req.path or '/'):match('^([^?]*)') -- query string'i ayır
    local method = req.method or 'GET'
    local query  = req.query  or {}

    if method == 'OPTIONS' then
        res.writeHead(204); res.send(''); return
    end

    -- Yetki Kontrolü
    if not ValidateKey(req) then
        return SendJSON(res, 401, { success = false, message = 'Yetkisiz erişim. Geçersiz API anahtarı.' })
    end

    -- POST body'yi asenkron oku, sonra işle
    req.setDataHandler(function(rawBody)
        local body = {}
        if rawBody and rawBody ~= '' then
            local ok, decoded = pcall(json.decode, rawBody)
            if ok then body = decoded end
        end

    -- =========================================================
    --   GET /genscript/players
    -- =========================================================
    if path == '/players' and method == 'GET' then
        local players = {}
        for _, src in ipairs(GetPlayers()) do
            table.insert(players, {
                id   = tonumber(src),
                name = GetPlayerName(src) or 'N/A',
                ping = GetPlayerPing(src) or 0,
            })
        end
        return SendJSON(res, 200, {
            success    = true,
            players    = players,
            maxPlayers = GetConvarInt('sv_maxclients', 64),
        })
    end

    -- =========================================================
    --   POST /genscript/kick
    -- =========================================================
    if path == '/kick' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        DropPlayer(src, '❌ ' .. (body.reason or 'Yönetici tarafından atıldınız.'))
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/ban
    -- =========================================================
    if path == '/ban' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        local license  = Framework.GetLicense(src)
        local expireAt = nil

        if body.duration and tonumber(body.duration) > 0 then
            expireAt = os.date('%Y-%m-%d %H:%M:%S', os.time() + (tonumber(body.duration) * 60))
        end

        MySQL.insert(
            'INSERT INTO genscript_bans (player_name, license, discord_id, reason, banned_by, expire_at) VALUES (?, ?, ?, ?, ?, ?)',
            { name, license, discord, body.reason or 'Sebep belirtilmedi', body.adminTag or 'Discord Bot', expireAt }
        )

        DropPlayer(src, '🔨 Sunucudan banlandınız.\nSebep: ' .. (body.reason or 'Sebep belirtilmedi') ..
            (expireAt and ('\nSon: ' .. expireAt) or '\nSüre: Kalıcı'))

        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/unban
    -- =========================================================
    if path == '/unban' and method == 'POST' then
        if not body.license then
            return SendJSON(res, 400, { success = false, message = 'license parametresi gerekli.' })
        end
        MySQL.update('UPDATE genscript_bans SET is_active = 0 WHERE license = ? AND is_active = 1', { body.license })
        return SendJSON(res, 200, { success = true, playerName = body.license })
    end

    -- =========================================================
    --   POST /genscript/kill
    -- =========================================================
    if path == '/kill' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:kill', src)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/revive
    -- =========================================================
    if path == '/revive' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:revive', src)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/ck  (Karakter Kalıcı Sil)
    -- =========================================================
    if path == '/ck' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local citizenId = Framework.GetPlayerCitizenId(player)

        if Config.Framework == 'qb-core' then
            MySQL.update("UPDATE players SET is_dead = 1 WHERE citizenid = ?",       { citizenId })
            MySQL.update("DELETE FROM player_vehicles WHERE citizenid = ?",           { citizenId })
            MySQL.update("UPDATE players SET metadata = JSON_SET(metadata, '$.isdead', true) WHERE citizenid = ?", { citizenId })
        else
            MySQL.update("UPDATE users SET dead = 1 WHERE identifier = ?", { citizenId })
        end

        TriggerClientEvent('genscript:client:kill', src)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/teleport
    -- =========================================================
    if path == '/teleport' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:teleport', src, tonumber(body.x), tonumber(body.y), tonumber(body.z))
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/clothing
    -- =========================================================
    if path == '/clothing' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:openClothing', src)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/inventory/get
    -- =========================================================
    if path == '/inventory/get' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local items = Framework.GetInventory(player)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord, inventory = items })
    end

    -- =========================================================
    --   POST /genscript/inventory/add
    -- =========================================================
    if path == '/inventory/add' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local ok = Framework.AddItem(player, body.item, tonumber(body.amount) or 1)
        if not ok then return SendJSON(res, 400, { success = false, message = 'Eşya eklenemedi. Eşya adını kontrol edin.' }) end
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/inventory/remove
    -- =========================================================
    if path == '/inventory/remove' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local ok = Framework.RemoveItem(player, body.item, tonumber(body.amount) or 1)
        if not ok then return SendJSON(res, 400, { success = false, message = 'Eşya çıkarılamadı. Yeterli eşya yok olabilir.' }) end
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/money/get
    -- =========================================================
    if path == '/money/get' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local money = Framework.GetMoney(player)
        return SendJSON(res, 200, {
            success          = true,
            playerName       = name,
            playerDiscordId  = discord,
            cash             = money.cash,
            bank             = money.bank,
            black_money      = money.black_money,
        })
    end

    -- =========================================================
    --   POST /genscript/money/add
    -- =========================================================
    if path == '/money/add' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        Framework.AddMoney(player, body.moneyType or 'cash', tonumber(body.amount) or 0)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/money/remove
    -- =========================================================
    if path == '/money/remove' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local ok = Framework.RemoveMoney(player, body.moneyType or 'cash', tonumber(body.amount) or 0)
        if not ok then return SendJSON(res, 400, { success = false, message = 'Yeterli bakiye yok.' }) end
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/job/get
    -- =========================================================
    if path == '/job/get' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local job = Framework.GetPlayerJob(player)
        return SendJSON(res, 200, {
            success         = true,
            playerName      = name,
            playerDiscordId = discord,
            job             = job.name,
            jobLabel        = job.label,
            grade           = job.grade,
            gradeLabel      = job.gradeLabel,
        })
    end

    -- =========================================================
    --   POST /genscript/job/set
    -- =========================================================
    if path == '/job/set' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        Framework.SetPlayerJob(player, body.job or 'unemployed', tonumber(body.grade) or 0)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/vehicle
    -- =========================================================
    if path == '/vehicle' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:spawnVehicle', src, body.model, body.plate)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/phone
    -- =========================================================
    if path == '/phone' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local player, name, discord = PlayerInfo(src)
        if not player then return SendJSON(res, 500, { success = false, message = 'Oyuncu verisi alınamadı.' }) end
        local citizenId = Framework.GetPlayerCitizenId(player)

        if Config.Framework == 'qb-core' then
            MySQL.update('UPDATE players SET phone_number = ? WHERE citizenid = ?', { body.number, citizenId })
        else
            MySQL.update('UPDATE users SET phone_number = ? WHERE identifier = ?', { body.number, citizenId })
        end
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   GET /genscript/plate
    -- =========================================================
    if path == '/plate' and method == 'GET' then
        local plate = query.plate
        if not plate then
            SendJSON(res, 400, { success = false, message = 'plate parametresi gerekli.' })
            return
        end
        Citizen.CreateThread(function()
            local result = MySQL.query.await(
                'SELECT pv.plate, pv.vehicle, pv.state, p.charinfo, p.citizenid FROM player_vehicles pv LEFT JOIN players p ON p.citizenid = pv.citizenid WHERE pv.plate = ? LIMIT 1',
                { plate }
            )
            if not result or #result == 0 then
                return SendJSON(res, 404, { success = false, message = 'Bu plakaya ait araç bulunamadı.' })
            end
            local row     = result[1]
            local charinfo, vehData = {}, {}
            pcall(function() charinfo = json.decode(row.charinfo or '{}') end)
            pcall(function() vehData  = json.decode(row.vehicle  or '{}') end)
            local ownerName = (charinfo.firstname or '') .. ' ' .. (charinfo.lastname or '')
            SendJSON(res, 200, {
                success      = true,
                ownerName    = ownerName,
                citizenId    = row.citizenid,
                vehicleModel = vehData.model or 'N/A',
                state        = row.state == 1 and 'Garajda' or 'Dışarıda',
            })
        end)
        return
    end

    -- =========================================================
    --   POST /genscript/announce
    -- =========================================================
    if path == '/announce' and method == 'POST' then
        TriggerClientEvent('genscript:client:announce', -1, body.message or '', body.type or 'chat', body.adminTag or 'Yönetim')
        return SendJSON(res, 200, { success = true })
    end

    -- =========================================================
    --   POST /genscript/pm
    -- =========================================================
    if path == '/pm' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:pm', src, body.message or '', body.senderName or 'Yönetim')
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/ped
    -- =========================================================
    if path == '/ped' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        TriggerClientEvent('genscript:client:changePed', src, body.model)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   POST /genscript/screenshot
    -- =========================================================
    if path == '/screenshot' and method == 'POST' then
        local src = GetSource(body.playerId)
        if not src then return SendJSON(res, 404, { success = false, message = 'Oyuncu çevrimiçi değil.' }) end
        local _, name, discord = PlayerInfo(src)
        local webhookUrl = body.webhookUrl or Config.ScreenshotWebhook
        TriggerClientEvent('genscript:client:screenshot', src, webhookUrl)
        return SendJSON(res, 200, { success = true, playerName = name, playerDiscordId = discord })
    end

    -- =========================================================
    --   GET /genscript/query/discord  (Discord ID → FiveM)
    -- =========================================================
    if path == '/query/discord' and method == 'GET' then
        local discordId = query.discordId
        if not discordId then
            SendJSON(res, 400, { success = false, message = 'discordId parametresi gerekli.' })
            return
        end
        -- Önce online oyuncularda ara
        for _, src in ipairs(GetPlayers()) do
            local dId = Framework.GetDiscordId(tonumber(src))
            if dId == discordId then
                local player = Framework.GetPlayer(tonumber(src))
                if player then
                    local job   = Framework.GetPlayerJob(player)
                    local money = Framework.GetMoney(player)
                    SendJSON(res, 200, {
                        success    = true,
                        playerName = Framework.GetPlayerName(player),
                        citizenId  = Framework.GetPlayerCitizenId(player),
                        serverId   = tonumber(src),
                        job        = job   and job.name   or 'N/A',
                        bank       = money and money.bank or 0,
                        discordId  = discordId,
                    })
                    return
                end
            end
        end
        -- Offline: veritabanında ara
        Citizen.CreateThread(function()
            local result = MySQL.query.await(
                "SELECT citizenid, charinfo, job FROM players WHERE JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.discord')) = ? LIMIT 1",
                { discordId }
            )
            if not result or #result == 0 then
                return SendJSON(res, 404, { success = false, message = 'Bu Discord ID\'ye ait oyuncu bulunamadı.' })
            end
            local row = result[1]
            local charinfo, jobInfo = {}, {}
            pcall(function() charinfo = json.decode(row.charinfo or '{}') end)
            pcall(function() jobInfo  = json.decode(row.job      or '{}') end)
            SendJSON(res, 200, {
                success    = true,
                playerName = (charinfo.firstname or '') .. ' ' .. (charinfo.lastname or ''),
                citizenId  = row.citizenid,
                serverId   = nil,
                job        = jobInfo.name or 'N/A',
                bank       = 0,
                discordId  = discordId,
            })
        end)
        return
    end

    -- =========================================================
    --   GET /genscript/query/fivem  (FiveM ID/CitizenID → Discord)
    -- =========================================================
    if path == '/query/fivem' and method == 'GET' then
        local playerId = query.playerId
        if not playerId then
            SendJSON(res, 400, { success = false, message = 'playerId parametresi gerekli.' })
            return
        end
        -- Online: sunucu ID olarak dene
        local numId = tonumber(playerId)
        if numId and GetPlayerName(numId) then
            local player = Framework.GetPlayer(numId)
            if player then
                local discord  = Framework.GetDiscordId(numId)
                local charinfo = player.PlayerData and player.PlayerData.charinfo or {}
                local job      = player.PlayerData and player.PlayerData.job      or {}
                SendJSON(res, 200, {
                    success    = true,
                    playerName = (charinfo.firstname or '') .. ' ' .. (charinfo.lastname or ''),
                    citizenId  = Framework.GetPlayerCitizenId(player),
                    discordId  = discord,
                    job        = job.name or 'N/A',
                    lastLogin  = 'Çevrimiçi',
                })
                return
            end
        end
        -- Offline: citizenid ile veritabanında ara
        Citizen.CreateThread(function()
            local result = MySQL.query.await(
                'SELECT citizenid, charinfo, job, last_updated FROM players WHERE citizenid = ? LIMIT 1',
                { playerId }
            )
            if not result or #result == 0 then
                return SendJSON(res, 404, { success = false, message = 'Oyuncu bulunamadı.' })
            end
            local row = result[1]
            local charinfo, jobInfo = {}, {}
            pcall(function() charinfo = json.decode(row.charinfo or '{}') end)
            pcall(function() jobInfo  = json.decode(row.job      or '{}') end)
            SendJSON(res, 200, {
                success    = true,
                playerName = (charinfo.firstname or '') .. ' ' .. (charinfo.lastname or ''),
                citizenId  = row.citizenid,
                discordId  = nil,
                job        = jobInfo.name or 'N/A',
                lastLogin  = row.last_updated or 'N/A',
            })
        end)
        return
    end

        -- ─── 404 ──────────────────────────────────────────────────
        SendJSON(res, 404, { success = false, message = 'Endpoint bulunamadı: ' .. path })
    end) -- setDataHandler sonu
end) -- SetHttpHandler sonu

-- ─────────────────────────────────────────────────────────────
--   Ban Kontrolü — Oyuncu Bağlanırken
-- ─────────────────────────────────────────────────────────────
AddEventHandler('playerConnecting', function(name, _, deferrals)
    deferrals.defer()
    local source = source
    Wait(0)
    deferrals.update('[Genscript] Ban kontrolü yapılıyor...')

    local license = Framework.GetLicense(source)
    if not license then
        deferrals.done()
        return
    end

    MySQL.query(
        'SELECT reason, expire_at FROM genscript_bans WHERE license = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
        { license },
        function(result)
            if result and #result > 0 then
                local ban = result[1]
                if ban.expire_at then
                    deferrals.done(('❌ Banlandınız.\nSebep: %s\nSon: %s'):format(ban.reason or 'N/A', tostring(ban.expire_at)))
                else
                    deferrals.done(('❌ Kalıcı olarak banlandınız.\nSebep: %s'):format(ban.reason or 'N/A'))
                end
            else
                deferrals.done()
            end
        end
    )
end)

print('^2[GENSCRIPT]^0 HTTP Handler başlatıldı. Tüm endpoint\'ler aktif.')
