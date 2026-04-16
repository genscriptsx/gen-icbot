-- ============================================================
--   GENSCRIPT BRIDGE — Client Events
-- ============================================================

-- ─── Kill ─────────────────────────────────────────────────────
RegisterNetEvent('genscript:client:kill', function()
    SetEntityHealth(PlayerPedId(), 0)
end)

-- ─── Revive ───────────────────────────────────────────────────
RegisterNetEvent('genscript:client:revive', function()
    local ped    = PlayerPedId()
    local coords = GetEntityCoords(ped)

    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, 0.0, true, false)
    SetEntityHealth(ped, 200)
    SetPlayerInvincible(PlayerId(), false)
    ClearPedBloodDamage(ped)
    ClearPedWetness(ped)
    RemoveAllPedWeapons(ped, false)

    if Config.Framework == 'qb-core' then
        TriggerEvent('QBCore:Notify', '💊 Bir yetkili tarafından canlandırıldınız!', 'success', 5000)
    else
        TriggerEvent('esx:showNotification', '💊 Canlandırıldınız!')
    end
end)

-- ─── Teleport ─────────────────────────────────────────────────
RegisterNetEvent('genscript:client:teleport', function(x, y, z)
    local ped = PlayerPedId()
    DoScreenFadeOut(300)
    Wait(350)
    SetEntityCoords(ped, x, y, z, false, false, false, true)
    Wait(300)
    DoScreenFadeIn(300)

    if Config.Framework == 'qb-core' then
        TriggerEvent('QBCore:Notify', ('🌀 Işınlandınız: %.1f, %.1f, %.1f'):format(x, y, z), 'success', 4000)
    end
end)

-- ─── Kıyafet Menüsü ───────────────────────────────────────────
RegisterNetEvent('genscript:client:openClothing', function()
    if Config.Framework == 'qb-core' then
        -- qb-clothing veya ilk kurulu clothing scriptini dene
        if GetResourceState('qb-clothing') == 'started' then
            TriggerEvent('qb-clothing:client:openMenu')
        elseif GetResourceState('illenium-appearance') == 'started' then
            TriggerEvent('illenium-appearance:client:openMenu')
        else
            TriggerEvent('QBCore:Notify', '⚠️ Kıyafet scripti bulunamadı.', 'error')
        end
    else
        TriggerEvent('esx_skin:openSaveableMenu')
    end
end)

-- ─── Araç Spawn ───────────────────────────────────────────────
RegisterNetEvent('genscript:client:spawnVehicle', function(model, plate)
    local modelHash = GetHashKey(model)

    if not IsModelInCdimage(modelHash) or not IsModelAVehicle(modelHash) then
        if Config.Framework == 'qb-core' then
            TriggerEvent('QBCore:Notify', '❌ Geçersiz araç modeli: ' .. model, 'error')
        end
        return
    end

    RequestModel(modelHash)
    local timeout = 0
    while not HasModelLoaded(modelHash) do
        Wait(100)
        timeout = timeout + 1
        if timeout > 50 then break end
    end

    if not HasModelLoaded(modelHash) then
        TriggerEvent('QBCore:Notify', '❌ Model yüklenemedi.', 'error')
        return
    end

    local ped     = PlayerPedId()
    local coords  = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    local vehicle = CreateVehicle(modelHash, coords.x + 3.0, coords.y, coords.z, heading, true, false)

    SetVehicleNumberPlateText(vehicle, plate or 'GENSCRIPT')
    SetPedIntoVehicle(ped, vehicle, -1)
    SetVehicleEngineOn(vehicle, true, true, false)
    SetModelAsNoLongerNeeded(modelHash)

    if Config.Framework == 'qb-core' then
        TriggerEvent('QBCore:Notify', ('🚗 %s aracı çıkarıldı! Plaka: %s'):format(model, plate or 'GENSCRIPT'), 'success', 5000)
    end
end)

-- ─── Özel Mesaj (PM) ──────────────────────────────────────────
RegisterNetEvent('genscript:client:pm', function(message, senderName)
    -- Sohbet baloncuğu
    TriggerEvent('chat:addMessage', {
        color     = { 255, 100, 255 },
        multiline = false,
        args      = { '[💬 PM - ' .. senderName .. ']', message },
    })

    -- Ekran bildirimi
    BeginTextCommandDisplayHelp('STRING')
    AddTextComponentString(('[PM - %s]: %s'):format(senderName, message))
    EndTextCommandDisplayHelp(0, false, true, Config.PMDuration or 8000)

    if Config.Framework == 'qb-core' then
        TriggerEvent('QBCore:Notify', ('[💬 %s]: %s'):format(senderName, message), 'primary', 8000)
    end
end)

-- ─── Duyuru ───────────────────────────────────────────────────
RegisterNetEvent('genscript:client:announce', function(message, type, adminTag)
    -- Chat mesajı (chat ve both)
    if type == 'chat' or type == 'both' then
        TriggerEvent('chat:addMessage', {
            color     = { 255, 165, 0 },
            multiline = true,
            args      = { '[📢 DUYURU - ' .. adminTag .. ']', message },
        })
    end

    -- Ekran bildirimi (screen ve both)
    if type == 'screen' or type == 'both' then
        BeginTextCommandDisplayHelp('STRING')
        AddTextComponentString(('[📢 DUYURU]\n%s'):format(message))
        EndTextCommandDisplayHelp(0, false, true, 10000)
    end
end)

-- ─── Ped Değiştir ─────────────────────────────────────────────
RegisterNetEvent('genscript:client:changePed', function(model)
    local modelHash = GetHashKey(model)
    RequestModel(modelHash)

    local timeout = 0
    while not HasModelLoaded(modelHash) do
        Wait(100)
        timeout = timeout + 1
        if timeout > 50 then break end
    end

    if HasModelLoaded(modelHash) then
        SetPlayerModel(PlayerId(), modelHash)
        SetModelAsNoLongerNeeded(modelHash)
        if Config.Framework == 'qb-core' then
            TriggerEvent('QBCore:Notify', '🎭 Model değiştirildi: ' .. model, 'success', 5000)
        end
    else
        if Config.Framework == 'qb-core' then
            TriggerEvent('QBCore:Notify', '❌ Ped modeli yüklenemedi: ' .. model, 'error')
        end
    end
end)
