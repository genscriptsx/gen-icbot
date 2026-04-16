# 🤖 Genscript ICBOT — Kurulum Kılavuzu

> Discord Bot ↔ FiveM Sunucusu köprüsü. Tüm yönetim komutlarını Discord üzerinden çalıştırmanızı sağlar.

---

## 📁 Proje Yapısı

```
Fivem İCBOT/
├── discord-bot/              ← PC'nizde/VPS'nizde çalışır
│   ├── config.js             ★ Tüm ayarları buraya girin
│   ├── index.js
│   ├── package.json
│   ├── commands/
│   │   ├── yonetim/          (ban, unban, kick, kill, revive, ck, tp, duyuru)
│   │   ├── oyuncu/           (envanter, para, meslek, araba-ver, vb.)
│   │   └── bilgi/            (oyuncu-listesi, plaka-kontrol, sorgu-discord, vb.)
│   ├── events/
│   ├── handlers/
│   └── utils/
│
├── fivem-resource/           ← FiveM sunucunuzun resources/ klasörüne gider
│   ├── fxmanifest.lua
│   ├── config.lua            ★ APISecret buraya
│   ├── server/
│   │   ├── server.lua        (HTTP handler — tüm endpointler)
│   │   └── framework.lua     (QB-Core / ESX wrapper)
│   └── client/
│       ├── client.lua
│       └── screenshot.lua
│
├── database.sql              ★ Veritabanına bir kez import edin
└── KURULUM.md                ← Bu dosya
```

---

## ✅ Ön Gereksinimler

| Gereksinim | Minimum Sürüm | Not |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| FiveM Server | Güncel | Artifact 6000+ |
| oxmysql | Güncel | `ensure oxmysql` |
| screenshot-basic | Güncel | `ensure screenshot-basic` |
| Framework | QB-Core veya ESX | config.lua'da seçilir |

---

## 🗄️ Adım 1 — Veritabanı

`database.sql` dosyasını sunucu veritabanınıza import edin:

```bash
# MySQL CLI
mysql -u root -p VERITABANİ_ADI < database.sql
```

Veya HeidiSQL / phpMyAdmin'de **"SQL Çalıştır"** sekmesine yapıştırın.

Bu iki tablo oluşturulur:
- `genscript_bans` — Ban kayıtları ve süreli ban takibi
- `genscript_logs` — Yönetici işlem logları

---

## 🎮 Adım 2 — FiveM Resource Kurulumu

### 2.1 — Dosyaları Kopyalayın

`fivem-resource/` klasörünü FiveM sunucunuza kopyalayın:

```
[FiveM Sunucu Dizini]/
  resources/
    [genscript]/
      genscript-bridge/       ← fivem-resource/ içindekiler buraya
          fxmanifest.lua
          config.lua
          server/
          client/
```

> ⚠️ **Klasör adı kesinlikle `genscript-bridge` olmalıdır.**

### 2.2 — config.lua Ayarları

`resources/genscript-bridge/config.lua` dosyasını açın:

```lua
-- Framework seçimi: "qb-core" veya "esx"
Config.Framework = "qb-core"

-- API anahtarı — discord-bot/config.js ile BİREBİR AYNI olmalı!
Config.APISecret = "GUVENLI_BIR_SIFRE_YAZIN"

-- Screenshot'ların düşeceği Discord webhook URL'si
Config.ScreenshotWebhook = "https://discord.com/api/webhooks/..."
```

### 2.3 — server.cfg

```cfg
# oxmysql ve screenshot-basic zaten varsa bunları atlayın
ensure oxmysql
ensure screenshot-basic

# Genscript bridge — yukarıdakilerden SONRA olmalı
ensure genscript-bridge
```

### 2.4 — Başarılı Kurulum Kontrolü

FiveM konsolunda şunu görmelisiniz (hata YOK):

```
script:genscript-bridge  [GENSCRIPT] Framework wrapper yüklendi: qb-core
script:genscript-bridge  [GENSCRIPT] HTTP Handler başlatıldı. Tüm endpoint'ler aktif.
resources                Started resource genscript-bridge
```

---

## 🤖 Adım 3 — Discord Bot Kurulumu

### 3.1 — Discord Developer Portal

1. https://discord.com/developers/applications → **New Application**
2. Sol menü → **Bot** → **Add Bot**
3. **Token** kopyalayın (ileride config.js'e yapıştırılacak)
4. **Privileged Gateway Intents** bölümünde şunları **aktif edin**:
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `MESSAGE CONTENT INTENT`

### 3.2 — Bot'u Sunucuya Davet Edin

1. Sol menü → **OAuth2** → **URL Generator**
2. **Scopes:** `bot` + `applications.commands`
3. **Bot Permissions:**
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `View Channels`
   - `Use Slash Commands`
4. Üretilen URL'yi açarak botu Discord sunucunuza ekleyin

### 3.3 — Gerekli ID'leri Toplayın

Discord'da **Geliştirici Modu**'nu aktif edin:
`Ayarlar → İleri → Geliştirici Modu → Açık`

| Değer | Nasıl Alınır |
|---|---|
| `token` | Developer Portal → Bot → Token |
| `clientId` | Developer Portal → OAuth2 → Client ID |
| `guildId` | Discord'da sunucuya sağ tık → "ID Kopyala" |
| `allowedRoles` | Discord'da role sağ tık → "ID Kopyala" |
| `logChannelId` | Discord'da kanala sağ tık → "ID Kopyala" |

### 3.4 — Screenshot Webhook Oluşturun

1. Screenshot'ların geleceği Discord kanalını açın
2. **Kanal Ayarları** → **Entegrasyonlar** → **Webhook Oluştur**
3. Webhook URL'sini kopyalayın

---

## ⚙️ Adım 4 — config.js Doldurma

`discord-bot/config.js` dosyasını açın ve tüm alanları doldurun:

```javascript
module.exports = {
  // Discord Bot
  token:    'BOT_TOKEN_BURAYA',
  clientId: '1234567890123456789',   // Bot uygulama ID'si
  guildId:  '1234567890123456789',   // Komutların register edileceği sunucu ID'si

  // Yetkili Roller — bu rollere sahip kişiler tüm komutları kullanabilir
  allowedRoles: [
    '1234567890123456789',  // Örn: Admin rolü ID'si
    '9876543210987654321',  // Örn: Moderatör rolü ID'si
  ],

  // Log kanalı — tüm yönetim işlemleri buraya düşer
  logChannelId: '1234567890123456789',

  // Screenshot webhook — ss-al komutuyla alınan görseller buraya gelir
  screenshotWebhook: 'https://discord.com/api/webhooks/XXXX/YYYY',

  // FiveM Sunucu Bağlantısı
  fivemServerIp:   '0.0.0.0',    // Sunucu IP adresi (localhost değil, gerçek IP)
  fivemServerPort: 30120,         // FiveM portu (genellikle 30120)
  apiSecret:       'GUVENLI_BIR_SIFRE_YAZIN', // config.lua ile BİREBİR AYNI!
};
```

> ⚠️ **`apiSecret`**, `config.js` ile `config.lua`'da **bire bir aynı** olmalıdır. Büyük/küçük harf duyarlıdır.

---

## 🚀 Adım 5 — Botu Başlatma

```bash
cd "discord-bot"
npm install
node index.js
```

Başarılı başlangıç çıktısı:

```
[GENSCRIPT] 🔧 Komut yüklendi: ban
[GENSCRIPT] 🔧 Komut yüklendi: kick
...
[GENSCRIPT] ✅ Slash komutlar register edildi.
[GENSCRIPT] ✅ Event yüklendi: ready
[GENSCRIPT] ✅ Bot hazır: Genscript Ic Bot#XXXX
```

### Sürekli Çalışması İçin (VPS / PM2)

```bash
npm install -g pm2
pm2 start index.js --name genscript-bot
pm2 save
pm2 startup
```

---

## 📋 Komut Listesi

### 🔐 Yönetim Komutları
| Komut | Açıklama |
|---|---|
| `/ban` | Oyuncuyu süreli veya kalıcı banlar |
| `/unban` | Lisans ile ban kaldırır |
| `/kick` | Oyuncuyu sunucudan atar |
| `/kill` | Oyuncuyu öldürür |
| `/revive` | Oyuncuyu canlandırır |
| `/ck` | Karakteri kalıcı siler (veritabanı) |
| `/tp` | Oyuncuyu koordinata ışınlar |
| `/duyuru` | Tüm sunucuya duyuru gönderir |

### 👤 Oyuncu Komutları
| Komut | Açıklama |
|---|---|
| `/envanter goster` | Oyuncunun envanterini listeler |
| `/envanter ekle` | Envantere eşya ekler |
| `/envanter cikar` | Envanterden eşya çıkarır |
| `/para goster` | Nakit / banka / kara para bakiyesi |
| `/para ver` | Para verir |
| `/para al` | Para alır |
| `/meslek goster` | Meslek bilgilerini gösterir |
| `/meslek ver` | Meslek ve rütbe atar |
| `/meslek al` | Oyuncuyu işsiz yapar (unemployed) |
| `/araba-ver` | Oyuncunun yanına araç çıkarır |
| `/telefon-degistir` | Telefon numarasını değiştirir |
| `/kiyafet-ver` | Kıyafet menüsünü açtırır |
| `/ped-ver` | Ped modelini değiştirir |
| `/pm` | Oyun içi özel mesaj gönderir |

### 🔍 Bilgi Komutları
| Komut | Açıklama |
|---|---|
| `/oyuncu-listesi` | Sunucudaki aktif oyuncuları (ID, İsim, Ping) listeler |
| `/plaka-kontrol` | Plakayı sorgular, araç ve sahibini gösterir |
| `/sorgu-discord` | Discord ID → FiveM karakter bilgisi |
| `/sorgu-fivem` | FiveM ID → Discord ve karakter bilgisi |
| `/ss-al` | Oyuncunun ekranının fotoğrafını çeker |

---

## 🛟 Sorun Giderme

| Hata | Olası Sebep | Çözüm |
|---|---|---|
| `401 Unauthorized` | `apiSecret` eşleşmiyor | `config.js` ve `config.lua`'daki değerlerin bire bir aynı olduğunu kontrol edin |
| `404 Endpoint bulunamadı` | Resource yüklenmemiş veya yanlış isimde | Klasör adının `genscript-bridge` olduğunu ve `server.cfg`'de `ensure genscript-bridge` bulunduğunu kontrol edin |
| `timeout of 10000ms` | FiveM sunucusuna ulaşılamıyor | IP/port doğruluğunu ve sunucu firewall'unu kontrol edin |
| `Oyuncu çevrimiçi değil` | Yanlış server ID girildi | `/oyuncu-listesi` ile aktif ID'yi kontrol edin |
| Slash komutlar görünmüyor | Register olmamış | `node index.js`'i yeniden başlatın, 30 saniye bekleyin |
| Screenshot gelmiyor | `screenshot-basic` kapalı | `server.cfg`'de `ensure screenshot-basic` bulunduğunu kontrol edin |
| `setHeader` hatası | Eski `server.lua` yüklü | En güncel `server.lua`'yı FiveM sunucusuna yükleyip `restart genscript-bridge` yapın |

### FiveM Konsol Komutları

```
refresh                     # Tüm resource'ları yeniler
restart genscript-bridge    # Sadece bu resource'u yeniden başlatır
```

---

## 🔒 Güvenlik Notları

- `apiSecret` en az 16 karakter, rastgele bir değer olsun (örn: `aBcD3Fg7HiJ2kL9m`)
- `config.js` dosyasını kesinlikle herkese açık bir yere (GitHub vb.) koymayın
- Bot token'ınızı kimseyle paylaşmayın; sızdıysa Developer Portal'dan yenileyin
- `allowedRoles` listesine yalnızca güvendiğiniz rolleri ekleyin

---

> **Genscript ICBOT** — Tüm hakları saklıdır.
 ** Genscript Discord **
 discord.gg/genscript 
