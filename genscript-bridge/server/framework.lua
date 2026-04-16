-- ============================================================
--   GENSCRIPT BRIDGE — Framework Wrapper
--   ESX ve QB-Core için tek arayüz sağlar.
-- ============================================================

Framework = {}

-- ─────────────────────────────────────────────────────────────
--   QB-CORE
-- ─────────────────────────────────────────────────────────────
if Config.Framework == "qb-core" then
    local QBCore = exports['qb-core']:GetCoreObject()

    Framework.GetPlayer = function(source)
        return QBCore.Functions.GetPlayer(source)
    end

    Framework.GetPlayerName = function(player)
        if not player then return "Bilinmiyor" end
        local ci = player.PlayerData.charinfo
        return (ci.firstname or '') .. ' ' .. (ci.lastname or '')
    end

    Framework.GetPlayerCitizenId = function(player)
        if not player then return nil end
        return player.PlayerData.citizenid
    end

    Framework.GetPlayerJob = function(player)
        if not player then return nil end
        local j = player.PlayerData.job
        return { name = j.name, label = j.label, grade = j.grade.level, gradeLabel = j.grade.name }
    end

    Framework.SetPlayerJob = function(player, job, grade)
        if not player then return false end
        player.Functions.SetJob(job, grade)
        return true
    end

    Framework.GetMoney = function(player)
        if not player then return nil end
        local m = player.PlayerData.money
        return { cash = m['cash'] or 0, bank = m['bank'] or 0, black_money = m['black_money'] or 0 }
    end

    Framework.AddMoney = function(player, moneyType, amount)
        if not player then return false end
        player.Functions.AddMoney(moneyType, amount, 'genscript-admin')
        return true
    end

    Framework.RemoveMoney = function(player, moneyType, amount)
        if not player then return false end
        return player.Functions.RemoveMoney(moneyType, amount, 'genscript-admin')
    end

    Framework.GetInventory = function(player)
        if not player then return {} end
        local items = {}
        if player.PlayerData.items then
            for _, item in pairs(player.PlayerData.items) do
                if item and item.amount and item.amount > 0 then
                    table.insert(items, { name = item.name, count = item.amount, label = item.label or item.name })
                end
            end
        end
        return items
    end

    Framework.AddItem = function(player, item, amount)
        if not player then return false end
        local added = player.Functions.AddItem(item, amount)
        if added then
            local itemData = QBCore.Shared.Items[item]
            if itemData then
                TriggerClientEvent('inventory:client:ItemBox', player.PlayerData.source, itemData, "add")
            end
        end
        return added
    end

    Framework.RemoveItem = function(player, item, amount)
        if not player then return false end
        return player.Functions.RemoveItem(item, amount)
    end

    Framework.GetDiscordId = function(source)
        for _, id in ipairs(GetPlayerIdentifiers(source)) do
            if id:sub(1, 8) == "discord:" then return id:sub(9) end
        end
        return nil
    end

    Framework.GetLicense = function(source)
        for _, id in ipairs(GetPlayerIdentifiers(source)) do
            if id:sub(1, 8) == "license:" then return id end
        end
        return nil
    end

-- ─────────────────────────────────────────────────────────────
--   ESX
-- ─────────────────────────────────────────────────────────────
elseif Config.Framework == "esx" then
    local ESX = exports["es_extended"]:getSharedObject()

    Framework.GetPlayer = function(source)
        return ESX.GetPlayerFromId(source)
    end

    Framework.GetPlayerName = function(player)
        if not player then return "Bilinmiyor" end
        return player.getName()
    end

    Framework.GetPlayerCitizenId = function(player)
        if not player then return nil end
        return player.identifier
    end

    Framework.GetPlayerJob = function(player)
        if not player then return nil end
        local j = player.getJob()
        return { name = j.name, label = j.label, grade = j.grade, gradeLabel = j.grade_label }
    end

    Framework.SetPlayerJob = function(player, job, grade)
        if not player then return false end
        player.setJob(job, grade)
        return true
    end

    Framework.GetMoney = function(player)
        if not player then return nil end
        local bank = player.getAccount('bank')
        local bm   = player.getAccount('black_money')
        return {
            cash        = player.getMoney(),
            bank        = bank and bank.money or 0,
            black_money = bm   and bm.money   or 0,
        }
    end

    Framework.AddMoney = function(player, moneyType, amount)
        if not player then return false end
        if moneyType == 'cash' then player.addMoney(amount)
        else player.addAccountMoney(moneyType, amount) end
        return true
    end

    Framework.RemoveMoney = function(player, moneyType, amount)
        if not player then return false end
        if moneyType == 'cash' then player.removeMoney(amount)
        else player.removeAccountMoney(moneyType, amount) end
        return true
    end

    Framework.GetInventory = function(player)
        if not player then return {} end
        local items = {}
        for _, item in pairs(player.getInventory()) do
            if item.count > 0 then
                table.insert(items, { name = item.name, count = item.count, label = item.label })
            end
        end
        return items
    end

    Framework.AddItem = function(player, item, amount)
        if not player then return false end
        player.addInventoryItem(item, amount)
        return true
    end

    Framework.RemoveItem = function(player, item, amount)
        if not player then return false end
        player.removeInventoryItem(item, amount)
        return true
    end

    Framework.GetDiscordId = function(source)
        for _, id in ipairs(GetPlayerIdentifiers(source)) do
            if id:sub(1, 8) == "discord:" then return id:sub(9) end
        end
        return nil
    end

    Framework.GetLicense = function(source)
        for _, id in ipairs(GetPlayerIdentifiers(source)) do
            if id:sub(1, 8) == "license:" then return id end
        end
        return nil
    end
end

print('^2[GENSCRIPT]^0 Framework wrapper yüklendi: ^3' .. Config.Framework)
