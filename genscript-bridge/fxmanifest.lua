fx_version 'cerulean'
game 'gta5'

name        'genscript-bridge'
description 'Genscript Discord Bot ↔ FiveM Bridge'
version     '1.0.0'
author      'Genscript'

lua54 'yes'

shared_scripts {
    'config.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/framework.lua',
    'server/server.lua',
}

client_scripts {
    'client/client.lua',
    'client/screenshot.lua',
}

dependencies {
    'oxmysql',
}
