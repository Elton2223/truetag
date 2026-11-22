-- True Tag registry schema (MySQL / MariaDB via XAMPP)

CREATE TABLE IF NOT EXISTS brands (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  reg_number VARCHAR(100) NULL,
  licence_notes TEXT NULL,
  status ENUM('pending','verified','suspended') NOT NULL DEFAULT 'pending',
  api_key_hash VARCHAR(255) NULL,
  contact_email VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','brand') NOT NULL,
  brand_id CHAR(36) NULL,
  name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  brand_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  category ENUM('alcohol','tobacco','other') NOT NULL DEFAULT 'other',
  sku VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS batches (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  label VARCHAR(100) NOT NULL,
  manufactured_on DATE NULL,
  expires_on DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_batches_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS codes (
  id CHAR(36) PRIMARY KEY,
  batch_id CHAR(36) NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  status ENUM('active','flagged','revoked') NOT NULL DEFAULT 'active',
  scan_count INT NOT NULL DEFAULT 0,
  scan_limit INT NOT NULL DEFAULT 5,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_codes_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  INDEX idx_codes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scan_events (
  id CHAR(36) PRIMARY KEY,
  code_id CHAR(36) NOT NULL,
  channel ENUM('web','whatsapp','sms','api','demo') NOT NULL DEFAULT 'web',
  verdict ENUM('genuine','suspicious','invalid') NOT NULL,
  ip_hash VARCHAR(64) NULL,
  city_approx VARCHAR(100) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scans_code FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE,
  INDEX idx_scans_code_created (code_id, created_at),
  INDEX idx_scans_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS consumer_reports (
  id CHAR(36) PRIMARY KEY,
  code_id CHAR(36) NULL,
  code_text VARCHAR(64) NULL,
  brand_id CHAR(36) NULL,
  reporter_email VARCHAR(255) NULL,
  reporter_phone VARCHAR(50) NULL,
  message TEXT NOT NULL,
  city_approx VARCHAR(100) NULL,
  status ENUM('new','reviewed','escalated','closed') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_code FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reward_campaigns (
  id CHAR(36) PRIMARY KEY,
  brand_id CHAR(36) NOT NULL,
  product_id CHAR(36) NULL,
  title VARCHAR(200) NOT NULL,
  message VARCHAR(500) NOT NULL,
  claim_limit INT NOT NULL DEFAULT 1,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rewards_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  CONSTRAINT fk_rewards_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reward_claims (
  id CHAR(36) PRIMARY KEY,
  campaign_id CHAR(36) NOT NULL,
  code_id CHAR(36) NOT NULL,
  claim_token VARCHAR(64) NOT NULL UNIQUE,
  status ENUM('eligible','claimed','redeemed','expired') NOT NULL DEFAULT 'eligible',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  claimed_at DATETIME NULL,
  CONSTRAINT fk_claims_campaign FOREIGN KEY (campaign_id) REFERENCES reward_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_code FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilot_requests (
  id CHAR(36) PRIMARY KEY,
  company VARCHAR(200) NOT NULL,
  contact_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  product_type VARCHAR(100) NOT NULL,
  message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS channel_outbox (
  id CHAR(36) PRIMARY KEY,
  channel ENUM('whatsapp','sms') NOT NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  payload_json JSON NOT NULL,
  related_code VARCHAR(32) NULL,
  status ENUM('logged','queued','sent','failed') NOT NULL DEFAULT 'logged',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
