import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { APIContext, AstroCookieSetOptions } from 'astro';
import { query, type Row } from './db';
import { newId } from './id';

const COOKIE = 'tt_session';
const SESSION_DAYS = 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'brand';
  brandId: string | null;
};

function secret(): string {
  return process.env.SESSION_SECRET || 'dev-insecure-secret';
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token + secret()).digest('hex');
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + secret()).digest('hex').slice(0, 32);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function cookieOptions(maxAgeSec: number): AstroCookieSetOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeSec,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const id = newId();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await query(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (:id, :userId, :tokenHash, :expires)`,
    { id, userId, tokenHash, expires },
  );
  return token;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await query(`DELETE FROM sessions WHERE token_hash = :h`, { h: hashToken(token) });
}

export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const rows = await query<Row[]>(
    `SELECT u.id, u.email, u.name, u.role, u.brand_id AS brandId
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = :h AND s.expires_at > NOW()
     LIMIT 1`,
    { h: hashToken(token) },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    brandId: row.brandId ?? null,
  };
}

export function getSessionToken(cookies: APIContext['cookies']): string | undefined {
  return cookies.get(COOKIE)?.value;
}

export async function requireUser(
  cookies: APIContext['cookies'],
  role?: 'admin' | 'brand',
): Promise<SessionUser | null> {
  const user = await getSessionUser(getSessionToken(cookies));
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}

export function setSessionCookie(cookies: APIContext['cookies'], token: string): void {
  cookies.set(COOKIE, token, cookieOptions(SESSION_DAYS * 86400));
}

export function clearSessionCookie(cookies: APIContext['cookies']): void {
  cookies.delete(COOKIE, { path: '/' });
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export { COOKIE };
