import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../lib/db';
import {
  createSession,
  setSessionCookie,
  verifyPassword,
} from '../../../../lib/auth';
import { json, jsonError, readJson } from '../../../../lib/request';
import { rateLimit } from '../../../../lib/rateLimit';
import { clientIp } from '../../../../lib/request';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = clientIp(request);
  const rl = rateLimit(`login:${ip}`, 20);
  if (!rl.ok) return jsonError('Too many attempts', 429);

  const body = await readJson<{ email?: string; password?: string; area?: string }>(request);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password || '';
  if (!email || !password) return jsonError('Email and password required');

  const rows = await query<Row[]>(
    `SELECT id, email, password_hash, role, brand_id, name FROM users WHERE email = :email LIMIT 1`,
    { email },
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return jsonError('Invalid email or password', 401);
  }

  if (body?.area === 'admin' && user.role !== 'admin') {
    return jsonError('Admin access only', 403);
  }
  if (body?.area === 'portal' && user.role !== 'brand') {
    return jsonError('Brand access only', 403);
  }
  if (user.role === 'brand' && user.brand_id) {
    const brands = await query<Row[]>(`SELECT status FROM brands WHERE id = :id`, { id: user.brand_id });
    if (brands[0]?.status !== 'verified') {
      return jsonError('Brand is not verified yet', 403);
    }
  }

  const token = await createSession(user.id);
  setSessionCookie(cookies, token);
  return json({
    ok: true,
    role: user.role,
    redirect: user.role === 'admin' ? '/admin' : '/portal',
  });
};
