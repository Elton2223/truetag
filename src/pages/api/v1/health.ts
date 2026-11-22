import type { APIRoute } from 'astro';
import { getPool } from '../../../lib/db';
import { json } from '../../../lib/request';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await getPool().query('SELECT 1');
    return json({ ok: true, service: 'truetag', db: 'up' });
  } catch (e) {
    return json({ ok: false, service: 'truetag', db: 'down', error: String(e) }, 503);
  }
};
