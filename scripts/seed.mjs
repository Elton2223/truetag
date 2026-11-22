import 'dotenv/config';
import { randomUUID, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'truetag';
const secret = process.env.SESSION_SECRET || 'dev-insecure-secret';

function id() {
  return randomUUID();
}

async function main() {
  const conn = await mysql.createConnection({ host, port, user, password, database, namedPlaceholders: true });

  // Wipe seedable tables for idempotent local seed
  await conn.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of [
    'reward_claims',
    'reward_campaigns',
    'scan_events',
    'consumer_reports',
    'channel_outbox',
    'codes',
    'batches',
    'products',
    'sessions',
    'users',
    'pilot_requests',
    'brands',
  ]) {
    await conn.query(`TRUNCATE TABLE \`${t}\``);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS=1');

  const brandId = id();
  const pendingBrandId = id();
  const productLager = id();
  const productCigs = id();
  const batchLager = id();
  const batchCigs = id();
  const codeGenuine = id();
  const codeSuspicious = id();
  // TT-DEMO-3003 is not inserted → invalid

  await conn.execute(
    `INSERT INTO brands (id, name, reg_number, licence_notes, status, contact_email)
     VALUES (:id, :name, :reg, :notes, 'verified', :email)`,
    {
      id: brandId,
      name: 'Sample Brewery Co',
      reg: 'K2024/000001/07',
      notes: 'Demo brand — liquor licence on file (seed)',
      email: 'brand@example.com',
    },
  );

  await conn.execute(
    `INSERT INTO brands (id, name, reg_number, status, contact_email)
     VALUES (:id, :name, :reg, 'pending', :email)`,
    {
      id: pendingBrandId,
      name: 'Pending Pilot Brand',
      reg: 'K2025/000002/07',
      email: 'pending@example.com',
    },
  );

  const adminHash = await bcrypt.hash('admin123', 10);
  const brandHash = await bcrypt.hash('brand123', 10);

  await conn.execute(
    `INSERT INTO users (id, email, password_hash, role, brand_id, name) VALUES
     (:aid, 'admin@truetag.co.za', :ah, 'admin', NULL, 'True Tag Admin'),
     (:bid, 'brand@example.com', :bh, 'brand', :brandId, 'Sample Brand User')`,
    { aid: id(), ah: adminHash, bid: id(), bh: brandHash, brandId },
  );

  await conn.execute(
    `INSERT INTO products (id, brand_id, name, category, sku) VALUES
     (:p1, :brandId, 'Sample Reserve Lager 340ml', 'alcohol', 'SRL-340'),
     (:p2, :brandId, 'Sample Premium Cigarettes 20s', 'tobacco', 'SPC-20')`,
    { p1: productLager, p2: productCigs, brandId },
  );

  await conn.execute(
    `INSERT INTO batches (id, product_id, label, manufactured_on) VALUES
     (:b1, :p1, 'B-2026-014', '2026-01-15'),
     (:b2, :p2, 'B-2026-088', '2026-02-01')`,
    { b1: batchLager, b2: batchCigs, p1: productLager, p2: productCigs },
  );

  // Keep familiar demo codes from Phase 1 marketing
  await conn.execute(
    `INSERT INTO codes (id, batch_id, code, status, scan_count, scan_limit) VALUES
     (:c1, :b1, 'TT-DEMO-1001', 'active', 0, 5),
     (:c2, :b2, 'TT-DEMO-2002', 'flagged', 12, 5)`,
    { c1: codeGenuine, c2: codeSuspicious, b1: batchLager, b2: batchCigs },
  );

  // Seed prior scans in different cities so TT-DEMO-2002 stays suspicious on next check
  for (const city of ['Durban', 'Johannesburg', 'Cape Town']) {
    await conn.execute(
      `INSERT INTO scan_events (id, code_id, channel, verdict, ip_hash, city_approx)
       VALUES (:id, :codeId, 'web', 'suspicious', :ip, :city)`,
      {
        id: id(),
        codeId: codeSuspicious,
        ip: createHash('sha256').update(city + secret).digest('hex').slice(0, 32),
        city,
      },
    );
  }

  const campaignId = id();
  await conn.execute(
    `INSERT INTO reward_campaigns (id, brand_id, product_id, title, message, claim_limit, active)
     VALUES (:id, :brandId, :productId, 'First scan thanks', 'Thanks for checking — show this at the till for a sticker.', 1, 1)`,
    { id: campaignId, brandId, productId: productLager },
  );

  await conn.execute(
    `INSERT INTO codes (id, batch_id, code, status, scan_count, scan_limit)
     VALUES (:id, :batchId, :code, 'active', 0, 5)`,
    { id: id(), batchId: batchLager, code: 'TT-7K9M-2QR4-XW8P' },
  );

  await conn.end();
  console.log('Seed complete.');
  console.log('  Admin:  admin@truetag.co.za / admin123');
  console.log('  Brand:  brand@example.com / brand123');
  console.log('  Demo:   TT-DEMO-1001 (genuine), TT-DEMO-2002 (suspicious), TT-DEMO-3003 (invalid)');
  console.log('  Extra:  TT-7K9M-2QR4-XW8P (genuine)');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
