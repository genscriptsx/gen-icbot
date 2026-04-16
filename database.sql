-- ============================================================
--   GENSCRIPT — Veritabanı Şeması
--   Charset: utf8mb4_general_ci
--   HeidiSQL, phpMyAdmin veya MySQL CLI ile çalıştırın.
-- ============================================================

CREATE TABLE IF NOT EXISTS `genscript_bans` (
  `id`           int(11)      NOT NULL AUTO_INCREMENT,
  `player_name`  varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `license`      varchar(64)  COLLATE utf8mb4_general_ci NOT NULL,
  `discord_id`   varchar(32)  COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reason`       text         COLLATE utf8mb4_general_ci NOT NULL,
  `banned_by`    varchar(64)  COLLATE utf8mb4_general_ci NOT NULL,
  `expire_at`    datetime     DEFAULT NULL COMMENT 'NULL = kalıcı ban',
  `is_active`    tinyint(1)   NOT NULL DEFAULT 1,
  `created_at`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_license`   (`license`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_discord`   (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `genscript_logs` (
  `id`                  int(11)      NOT NULL AUTO_INCREMENT,
  `action_type`         varchar(64)  COLLATE utf8mb4_general_ci NOT NULL,
  `admin_discord_id`    varchar(32)  COLLATE utf8mb4_general_ci NOT NULL,
  `admin_discord_tag`   varchar(64)  COLLATE utf8mb4_general_ci NOT NULL,
  `target_player_id`    varchar(32)  COLLATE utf8mb4_general_ci DEFAULT NULL,
  `target_player_name`  varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `target_discord_id`   varchar(32)  COLLATE utf8mb4_general_ci DEFAULT NULL,
  `details`             text         COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at`          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin`      (`admin_discord_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_action`     (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
