import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function env(name: string, fallback = ''): string {
  return (typeof process !== 'undefined' && process.env[name]) || fallback;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env('DB_HOST', '127.0.0.1'),
      port: Number(env('DB_PORT', '3306')),
      user: env('DB_USER', 'root'),
      password: env('DB_PASSWORD', ''),
      database: env('DB_NAME', 'truetag'),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T> {
  const [rows] = await getPool().execute(sql, params as never);
  return rows as T;
}

export type Row = mysql.RowDataPacket;
