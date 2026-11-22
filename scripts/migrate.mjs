import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'truetag';

async function main() {
  const boot = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await boot.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await boot.end();

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.end();
  console.log(`Migrated database "${database}" on ${host}:${port}`);
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
